import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingSchema } from "@/lib/validations/booking";
import { buildPayFastSignature } from "@/lib/payfast/signature";
import { sendAdminNotification } from "@/lib/resend/send-admin-notification";
import { sendConfirmationEmail } from "@/lib/resend/send-confirmation";

const DEPOSIT_AMOUNT = 750;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotsOverlap(
  reqStart: string,
  reqEnd: string,
  bookedStart: string,
  bookedEnd: string
): boolean {
  const rs = timeToMinutes(reqStart);
  const re = timeToMinutes(reqEnd);
  const bs = timeToMinutes(bookedStart);
  const be = timeToMinutes(bookedEnd);
  return bs < re && be > rs;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // Re-verify slot availability
  const { data: conflictsRaw } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("booking_date", data.date)
    .in("status", ["confirmed", "pending"]);

  const conflicts = (conflictsRaw ?? []) as { start_time: string; end_time: string }[];

  {
    const hasConflict = conflicts.some((b) =>
      slotsOverlap(data.startTime, data.endTime, b.start_time, b.end_time)
    );
    if (hasConflict) {
      return NextResponse.json(
        { error: "Slot no longer available" },
        { status: 409 }
      );
    }
  }

  // Look up package price
  const { data: pricingRow } = await supabase
    .from("pricing")
    .select("price_rands")
    .eq("package_type", data.packageType)
    .eq("duration_type", data.durationType)
    .eq("is_weekday", data.isWeekday)
    .single();

  if (!pricingRow) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  // Sum add-on prices
  let addOnsSubtotal = 0;
  let addOnNames: string[] = [];
  if (data.addOnIds.length > 0) {
    const { data: addOnRows } = await supabase
      .from("add_ons")
      .select("id, name, price_rands")
      .in("id", data.addOnIds);

    if (addOnRows) {
      addOnsSubtotal = addOnRows.reduce((sum, a) => sum + a.price_rands, 0);
      addOnNames = addOnRows.map((a) => a.name);
    }
  }

  const subtotal = pricingRow.price_rands + addOnsSubtotal;
  const totalAmount = subtotal + DEPOSIT_AMOUNT;

  // Validate promo code server-side (never trust client-provided discount value)
  let promoCodeSaved: string | null = null;
  let discountPercentageSaved: number | null = null;
  let discountAmount = 0;
  let finalTotal = totalAmount;

  if (data.promoCode) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("discount_percentage, active")
      .ilike("code", data.promoCode)
      .single();

    if (promo && promo.active === true) {
      promoCodeSaved = data.promoCode.toUpperCase();
      discountPercentageSaved = promo.discount_percentage as number;
      discountAmount = parseFloat(
        (totalAmount * discountPercentageSaved / 100).toFixed(2)
      );
      finalTotal = parseFloat((totalAmount - discountAmount).toFixed(2));
    }
  }

  // Upload ID document if provided
  let idDocumentUrl: string | null = null;
  if (data.idDocumentBase64 && data.idDocumentName) {
    const docId = crypto.randomUUID();
    const buffer = Buffer.from(data.idDocumentBase64, "base64");
    const fileName = data.idDocumentName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${docId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("id-documents")
      .upload(path, buffer, { upsert: false });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("id-documents")
        .getPublicUrl(path);
      idDocumentUrl = urlData.publicUrl;
    }
  }

  // For 100% discount bookings there is no PayFast payment, so we confirm directly.
  // The status guard in the ITN handler prevents this path from being abused by
  // normal paid bookings — only server-validated zero-total bookings reach here.
  const isFree = finalTotal === 0;
  const paymentId = crypto.randomUUID();

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      client_name: data.clientName,
      client_email: data.clientEmail,
      client_phone: data.clientPhone,
      booking_date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      package_type: data.packageType,
      duration_type: data.durationType,
      is_weekday: data.isWeekday,
      shoot_type: data.shootType,
      add_ons: addOnNames,
      subtotal,
      deposit_amount: DEPOSIT_AMOUNT,
      total_amount: totalAmount,
      promo_code: promoCodeSaved,
      discount_percentage: discountPercentageSaved,
      discount_amount: discountAmount > 0 ? discountAmount : null,
      final_total: finalTotal,
      payfast_payment_id: paymentId,
      status: isFree ? "confirmed" : "pending",
      confirmed_at: isFree ? new Date().toISOString() : null,
      id_document_url: idDocumentUrl,
      bank_holder_name: data.bankHolderName,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      branch_code: data.branchCode,
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    console.error("Booking insert failed:", insertError?.message);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }

  // Free booking (100% promo) — no PayFast redirect needed
  if (isFree) {
    sendAdminNotification({
      bookingId: booking.id,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      shootType: data.shootType,
      bookingDate: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      packageType: data.packageType,
      durationType: data.durationType,
      addOns: addOnNames,
      subtotal,
      depositAmount: DEPOSIT_AMOUNT,
      totalAmount,
      finalTotal: 0,
      promoCode: promoCodeSaved,
      discountAmount: discountAmount > 0 ? discountAmount : null,
      bankHolderName: data.bankHolderName,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      branchCode: data.branchCode,
      idDocumentUrl: idDocumentUrl,
    }).catch((e: unknown) => {
      console.error("Free booking: admin notification failed:", e);
    });

    sendConfirmationEmail({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      bookingDate: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      packageType: data.packageType,
      durationType: data.durationType,
      addOns: addOnNames,
      subtotal,
      depositAmount: DEPOSIT_AMOUNT,
      finalTotal: 0,
    }).catch((e: unknown) => {
      console.error("Free booking: client confirmation email failed:", e);
    });

    return NextResponse.json({ bookingId: booking.id, paymentId, free: true }, { status: 201 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isSandbox = process.env.PAYFAST_SANDBOX !== "false";
  const payfastUrl = isSandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  const nameParts = data.clientName.split(" ");
  const nameFirst = nameParts[0] ?? data.clientName;
  const nameLast = nameParts.slice(1).join(" ");

  // Build params in PayFast's expected order, omitting empty fields so the
  // signature string matches exactly what PayFast recomputes from the POST body.
  const payfastParams: Record<string, string> = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID ?? "",
    merchant_key: process.env.PAYFAST_MERCHANT_KEY ?? "",
    return_url: `${siteUrl}/booking/confirmed`,
    cancel_url: `${siteUrl}/booking`,
    notify_url: `${siteUrl}/api/payfast/itn`,
    name_first: nameFirst,
    ...(nameLast ? { name_last: nameLast } : {}),
    email_address: data.clientEmail,
    m_payment_id: paymentId,
    amount: finalTotal.toFixed(2),
    item_name: `Kyalami Studio - ${data.packageType} ${data.date}`,
  };

  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  const signature = buildPayFastSignature(payfastParams, passphrase);
  const payfastPayload = { ...payfastParams, signature };

  return NextResponse.json(
    { bookingId: booking.id, payfastUrl, payfastPayload },
    { status: 201 }
  );
}
