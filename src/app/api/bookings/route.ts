import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingSchema } from "@/lib/validations/booking";
import {
  buildPayFastSignature,
  buildPayFastPayload,
} from "@/lib/payfast/signature";

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

  // Upload ID document if provided
  let idDocumentUrl: string | null = null;
  if (data.idDocumentBase64 && data.idDocumentName) {
    const bookingId = crypto.randomUUID();
    const buffer = Buffer.from(data.idDocumentBase64, "base64");
    const fileName = data.idDocumentName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${bookingId}/${fileName}`;

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

  // Insert booking
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
      payfast_payment_id: paymentId,
      status: "pending",
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isSandbox = process.env.PAYFAST_SANDBOX !== "false";
  const payfastUrl = isSandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

  const payfastParams: Record<string, string> = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID ?? "",
    merchant_key: process.env.PAYFAST_MERCHANT_KEY ?? "",
    return_url: `${siteUrl}/booking/confirmed`,
    cancel_url: `${siteUrl}/booking`,
    notify_url: `${siteUrl}/api/payfast/itn`,
    m_payment_id: paymentId,
    amount: totalAmount.toFixed(2),
    item_name: `Kyalami Studio — ${data.packageType} ${data.date}`,
    email_address: data.clientEmail,
    name_first: data.clientName.split(" ")[0] ?? data.clientName,
    name_last: data.clientName.split(" ").slice(1).join(" ") || "",
  };

  const signature = buildPayFastSignature(
    payfastParams,
    process.env.PAYFAST_PASSPHRASE
  );
  const payfastPayload = buildPayFastPayload(
    {
      merchantId: payfastParams.merchant_id,
      merchantKey: payfastParams.merchant_key,
      returnUrl: payfastParams.return_url,
      cancelUrl: payfastParams.cancel_url,
      notifyUrl: payfastParams.notify_url,
      mPaymentId: paymentId,
      amount: payfastParams.amount,
      itemName: payfastParams.item_name,
      emailAddress: payfastParams.email_address,
      nameFirst: payfastParams.name_first,
      nameLast: payfastParams.name_last,
    },
    signature
  );

  return NextResponse.json(
    { bookingId: booking.id, payfastUrl, payfastPayload },
    { status: 201 }
  );
}
