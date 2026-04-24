import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
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
  const { data: booking, error } = await admin
    .from("bookings")
    .select("id_document_url")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const docUrl = booking.id_document_url;
  if (!docUrl) {
    return NextResponse.json({ error: "No ID document on file", code: "NOT_FOUND" }, { status: 404 });
  }

  // Extract the path from the public URL: everything after /id-documents/
  const marker = "/id-documents/";
  const markerIdx = docUrl.indexOf(marker);
  if (markerIdx === -1) {
    return NextResponse.json({ error: "Invalid document URL format", code: "INTERNAL_ERROR" }, { status: 500 });
  }
  const storagePath = docUrl.slice(markerIdx + marker.length);

  const { data: signed, error: signError } = await admin.storage
    .from("id-documents")
    .createSignedUrl(storagePath, 3600);

  if (signError || !signed) {
    console.error("[id-document] signed URL error:", signError?.message);
    return NextResponse.json({ error: "Could not generate download link", code: "INTERNAL_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signed.signedUrl });
}
