import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gallery_images")
    .select("*")
    .order("display_order");

  if (error) {
    return NextResponse.json({ error: "Failed to load gallery", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const file = formData.get("file");
  const altText = (formData.get("alt_text") as string) || "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 5MB limit", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const admin = createAdminClient();

  const ext = file.name.split(".").pop() ?? "jpg";
  const uuid = crypto.randomUUID();
  const path = `gallery/${uuid}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("gallery")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[admin/gallery] upload error:", uploadError.message);
    return NextResponse.json({ error: "Upload failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("gallery").getPublicUrl(path);

  // Get current max display_order
  const { data: maxRow } = await admin
    .from("gallery_images")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = ((maxRow?.display_order as number) ?? -1) + 1;

  const { data: imageRow, error: insertError } = await admin
    .from("gallery_images")
    .insert({ url: urlData.publicUrl, alt_text: altText, display_order: nextOrder })
    .select()
    .single();

  if (insertError || !imageRow) {
    console.error("[admin/gallery] insert error:", insertError?.message);
    return NextResponse.json({ error: "Failed to save image record", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ image: imageRow }, { status: 201 });
}
