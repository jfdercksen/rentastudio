import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_KEYS = [
  "amenities",
  "faq_items",
  "terms_conditions",
  "footer_address",
  "footer_phone",
  "space_description",
] as const;

type AllowedKey = (typeof ALLOWED_KEYS)[number];

export async function POST(request: Request): Promise<NextResponse> {
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

  const { key, value } = body as { key: unknown; value: unknown };

  if (!ALLOWED_KEYS.includes(key as AllowedKey)) {
    return NextResponse.json(
      { error: `key must be one of: ${ALLOWED_KEYS.join(", ")}`, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (typeof value !== "string") {
    return NextResponse.json({ error: "value must be a string", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("site_content").upsert(
    { key: key as AllowedKey, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  if (error) {
    console.error("[admin/content] upsert error:", error.message);
    return NextResponse.json({ error: "Failed to save content", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
