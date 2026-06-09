import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const AbandonmentSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email(),
  clientPhone: z.string().max(30).optional(),
  bookingDetails: z.object({
    date: z.string().optional(),
    startTime: z.string().optional(),
    packageType: z.string().optional(),
    durationType: z.string().optional(),
  }).optional(),
  stepReached: z.enum(["details", "verification", "payment"]).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const parsed = AbandonmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const { clientName, clientEmail, clientPhone, bookingDetails, stepReached } = parsed.data;
    const supabase = createAdminClient();

    // Check if this email already has an unrecovered abandonment record
    const { data: existing } = await supabase
      .from("abandoned_bookings")
      .select("id, step_reached")
      .eq("client_email", clientEmail)
      .eq("is_recovered", false)
      .single();

    if (existing) {
      // Update with latest info — don't reset email sent timestamps
      await supabase
        .from("abandoned_bookings")
        .update({
          client_name: clientName,
          client_phone: clientPhone ?? null,
          booking_details: bookingDetails ?? {},
          step_reached: stepReached ?? existing.step_reached,
        })
        .eq("id", existing.id);
    } else {
      // Insert new record — ignore if the unique index prevents it (race condition)
      await supabase
        .from("abandoned_bookings")
        .insert({
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone ?? null,
          booking_details: bookingDetails ?? {},
          step_reached: stepReached ?? "details",
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[booking-abandonment/POST] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// Called by the bookings API and ITN handler to cancel recovery sequence
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase
      .from("abandoned_bookings")
      .update({
        is_recovered: true,
        recovered_at: new Date().toISOString(),
      })
      .eq("client_email", email)
      .eq("is_recovered", false);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[booking-abandonment/DELETE] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
