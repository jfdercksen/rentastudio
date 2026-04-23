import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();
    await supabase.from("site_content").select("key").limit(1);
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[health] Supabase ping failed:", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
