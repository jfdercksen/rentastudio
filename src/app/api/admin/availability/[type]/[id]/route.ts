import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// DELETE /api/admin/availability/date/[id]   — remove a blocked_dates entry
// DELETE /api/admin/availability/slot/[id]   — remove a blocked_time_slots entry
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
): Promise<NextResponse> {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const { type, id } = await params;

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (type === "date") {
      const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
      if (error) {
        console.error("[admin/availability/DELETE] date error:", error.message);
        return NextResponse.json({ error: "Failed to remove block", code: "INTERNAL_ERROR" }, { status: 500 });
      }
    } else if (type === "slot") {
      const { error } = await supabase.from("blocked_time_slots").delete().eq("id", id);
      if (error) {
        console.error("[admin/availability/DELETE] slot error:", error.message);
        return NextResponse.json({ error: "Failed to remove block", code: "INTERNAL_ERROR" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Invalid type (use 'date' or 'slot')", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/availability/DELETE] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
