import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const Schema = z.object({ code: z.string().min(1).max(50) });

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("discount_percentage, active")
      .ilike("code", parsed.data.code)
      .single();

    if (!promo || promo.active !== true) {
      return NextResponse.json({ valid: false, message: "Invalid or inactive voucher code" });
    }

    return NextResponse.json({ valid: true, discountPercentage: promo.discount_percentage });
  } catch (err) {
    console.error("[validate-promo] error:", err);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
