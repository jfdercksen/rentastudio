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

  const { alt_text } = body as { alt_text: unknown };

  if (typeof alt_text !== "string") {
    return NextResponse.json({ error: "alt_text must be a string", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("gallery_images").update({ alt_text }).eq("id", id);

  if (error) {
    console.error("[admin/gallery/PATCH] error:", error.message);
    return NextResponse.json({ error: "Failed to update image", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { id } = await params;

  const admin = createAdminClient();

  // Get the image URL to extract storage path
  const { data: img, error: fetchError } = await admin
    .from("gallery_images")
    .select("url")
    .eq("id", id)
    .single();

  if (fetchError || !img) {
    return NextResponse.json({ error: "Image not found", code: "NOT_FOUND" }, { status: 404 });
  }

  // Extract storage path from URL — everything after /gallery/
  const url = img.url as string;
  const marker = "/gallery/";
  const markerIdx = url.indexOf(marker);
  if (markerIdx !== -1) {
    const storagePath = url.slice(markerIdx + 1); // keep the "gallery/" prefix for the bucket
    await admin.storage.from("gallery").remove([storagePath.replace(/^gallery\//, "")]);
  }

  const { error: deleteError } = await admin.from("gallery_images").delete().eq("id", id);

  if (deleteError) {
    console.error("[admin/gallery/DELETE] db error:", deleteError.message);
    return NextResponse.json({ error: "Failed to delete image record", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
