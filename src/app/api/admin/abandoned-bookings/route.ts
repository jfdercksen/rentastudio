import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("abandoned_bookings")
      .select(
        "id, client_name, client_email, client_phone, booking_details, step_reached, email_1_sent_at, email_2_sent_at, email_3_sent_at, is_recovered, recovered_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[admin/abandoned-bookings/GET] error:", error.message);
      return NextResponse.json({ error: "Failed to fetch", code: "INTERNAL_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error("[admin/abandoned-bookings/GET] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
