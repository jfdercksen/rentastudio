import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const patch = body as Record<string, unknown>;
  const update: { price_rands?: number; is_active?: boolean } = {};

  if ("price_rands" in patch) {
    const v = patch.price_rands;
    if (typeof v !== "number" || isNaN(v) || v <= 0) {
      return NextResponse.json(
        { error: "price_rands must be a positive number", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    update.price_rands = v;
  }

  if ("is_active" in patch) {
    if (typeof patch.is_active !== "boolean") {
      return NextResponse.json(
        { error: "is_active must be a boolean", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    update.is_active = patch.is_active;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("add_ons").update(update).eq("id", id);

  if (error) {
    console.error("[admin/add-ons/PATCH] error:", error.message);
    return NextResponse.json({ error: "Failed to update add-on", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
