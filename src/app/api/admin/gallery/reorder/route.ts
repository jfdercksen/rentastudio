import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface OrderItem {
  id: string;
  display_order: number;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const { order } = body as { order: unknown };

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "order must be an array", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Update each image's display_order
  const updates = (order as OrderItem[]).map(({ id, display_order }) =>
    admin.from("gallery_images").update({ display_order }).eq("id", id)
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}
