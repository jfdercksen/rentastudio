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

  const { price_rands } = body as { price_rands: unknown };

  if (typeof price_rands !== "number" || isNaN(price_rands) || price_rands <= 0) {
    return NextResponse.json(
      { error: "price_rands must be a positive number", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("pricing")
    .update({ price_rands })
    .eq("id", id);

  if (error) {
    console.error("[admin/pricing/PATCH] error:", error.message);
    return NextResponse.json({ error: "Failed to update price", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
