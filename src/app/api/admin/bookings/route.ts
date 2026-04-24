import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bookings")
    .select("*")
    .order("booking_date", { ascending: false });

  if (error) {
    console.error("[admin/bookings] fetch error:", error.message);
    return NextResponse.json({ error: "Failed to load bookings", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}
