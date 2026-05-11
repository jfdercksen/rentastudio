import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const SaveSchema = z.object({
  email: z.string().min(1).includes("@"),
  draft: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("booking_drafts")
    .upsert({
      email: parsed.data.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      draft: parsed.data.draft as any,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

  if (error) {
    console.error("booking-draft save failed:", error.message);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
