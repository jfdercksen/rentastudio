import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAbandonmentEmail } from "@/lib/resend/send-abandonment-email";

// Vercel Cron calls this with the CRON_SECRET as Bearer token
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const THREE_DAYS_MS = 3 * ONE_DAY_MS;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const bookingUrl = `${siteUrl}/booking`;
    const now = new Date();

    // Fetch all unrecovered abandonments
    const { data: records, error } = await supabase
      .from("abandoned_bookings")
      .select(
        "id, client_name, client_email, booking_details, email_1_sent_at, email_2_sent_at, email_3_sent_at, created_at"
      )
      .eq("is_recovered", false);

    if (error) {
      console.error("[cron/send-abandonment-emails] fetch error:", error.message);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    let sent = 0;

    for (const record of records ?? []) {
      const createdAt = new Date(record.created_at as string);
      const ageMs = now.getTime() - createdAt.getTime();

      const details = (record.booking_details as Record<string, string>) ?? {};
      const emailInput = {
        clientName: record.client_name as string,
        clientEmail: record.client_email as string,
        bookingDetails: {
          date: details.date,
          startTime: details.startTime,
          packageType: details.packageType,
          durationType: details.durationType,
        },
        bookingUrl,
      };

      // Email 1: 1 hour after abandonment, if not yet sent
      if (!record.email_1_sent_at && ageMs >= ONE_HOUR_MS) {
        const result = await sendAbandonmentEmail({ ...emailInput, emailNumber: 1 });
        if (result.success) {
          await supabase
            .from("abandoned_bookings")
            .update({ email_1_sent_at: now.toISOString() })
            .eq("id", record.id);
          sent++;
        }
        continue; // Only send one email per run per record
      }

      // Email 2: 24 hours after abandonment, if email 1 was sent and email 2 not yet
      if (record.email_1_sent_at && !record.email_2_sent_at && ageMs >= ONE_DAY_MS) {
        const result = await sendAbandonmentEmail({ ...emailInput, emailNumber: 2 });
        if (result.success) {
          await supabase
            .from("abandoned_bookings")
            .update({ email_2_sent_at: now.toISOString() })
            .eq("id", record.id);
          sent++;
        }
        continue;
      }

      // Email 3: 72 hours after abandonment, if email 2 was sent and email 3 not yet
      if (record.email_2_sent_at && !record.email_3_sent_at && ageMs >= THREE_DAYS_MS) {
        const result = await sendAbandonmentEmail({ ...emailInput, emailNumber: 3 });
        if (result.success) {
          await supabase
            .from("abandoned_bookings")
            .update({ email_3_sent_at: now.toISOString() })
            .eq("id", record.id);
          sent++;
        }
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("[cron/send-abandonment-emails] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
