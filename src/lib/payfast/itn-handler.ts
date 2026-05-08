import { createAdminClient } from "@/lib/supabase/admin";
import { ITNPayloadSchema } from "@/lib/validations/itn";
import { buildPayFastSignature } from "@/lib/payfast/signature";
import { sendConfirmationEmail } from "@/lib/resend/send-confirmation";

const PAYFAST_IP_WHITELIST = [
  "41.74.179.194",
  "41.74.179.195",
  "41.74.179.196",
  "41.74.179.197",
  "196.33.227.224",
  "196.33.227.225",
  "196.33.227.226",
  "196.33.227.227",
  "196.33.227.228",
  "196.33.227.229",
  "196.33.227.230",
  "196.33.227.231",
];

const OK = new Response("OK", { status: 200 });

export async function handleITN(request: Request): Promise<Response> {
  // Step 1: IP whitelist check — must be first
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwarded?.split(",")[0] ?? realIp ?? "").trim();

  if (!PAYFAST_IP_WHITELIST.includes(ip)) {
    console.error("ITN: blocked IP", ip);
    return OK;
  }

  // Step 2: Parse URL-encoded body
  const raw = await request.text();
  const params = Object.fromEntries(new URLSearchParams(raw));

  // Step 3: Validate payload shape
  const parsed = ITNPayloadSchema.safeParse(params);
  if (!parsed.success) {
    console.error("ITN: invalid payload", parsed.error.issues);
    return OK;
  }

  const payload = parsed.data;

  // Step 4: Rebuild signature (exclude 'signature' field)
  const { signature: _sig, ...sigParams } = payload;
  const rebuilt = buildPayFastSignature(
    sigParams as Record<string, string>,
    process.env.PAYFAST_PASSPHRASE
  );

  // Step 5: Compare signatures
  if (rebuilt !== payload.signature) {
    console.error("ITN: signature mismatch");
    return OK;
  }

  // Step 6: Payment status must be COMPLETE
  if (payload.payment_status !== "COMPLETE") {
    console.error("ITN: payment_status is not COMPLETE:", payload.payment_status);
    return OK;
  }

  const supabase = createAdminClient();

  // Step 7: Find matching pending booking
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, client_name, client_email, booking_date, start_time, end_time, package_type, duration_type, add_ons, subtotal, deposit_amount, total_amount, final_total, status"
    )
    .eq("payfast_payment_id", payload.m_payment_id)
    .eq("status", "pending")
    .single();

  if (!booking) {
    console.error("ITN: no pending booking found for", payload.m_payment_id);
    return OK;
  }

  // Step 8: Verify amount — use final_total when a promo discount was applied,
  // fall back to total_amount for bookings created before promo support.
  const receivedAmount = parseFloat(payload.amount_gross).toFixed(2);
  const chargedAmount = (booking.final_total ?? booking.total_amount) as number;
  const expectedAmount = chargedAmount.toFixed(2);
  if (receivedAmount !== expectedAmount) {
    console.error(
      "ITN: amount mismatch — received",
      receivedAmount,
      "expected",
      expectedAmount
    );
    return OK;
  }

  // Step 9: Confirm booking — WHERE status='pending' makes this idempotent
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      payfast_amount_gross: payload.amount_gross,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .eq("status", "pending");

  if (updateError) {
    console.error("ITN: booking update failed:", updateError.message);
    return OK;
  }

  // Step 10: Send confirmation email — failure must NOT prevent returning 200
  const addOns = Array.isArray(booking.add_ons)
    ? (booking.add_ons as string[])
    : [];

  sendConfirmationEmail({
    clientName: booking.client_name,
    clientEmail: booking.client_email,
    bookingDate: booking.booking_date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    packageType: booking.package_type,
    durationType: booking.duration_type,
    addOns,
    subtotal: booking.subtotal as number,
    depositAmount: booking.deposit_amount as number,
  }).catch((e: unknown) => {
    console.error("ITN: email send failed:", e);
  });

  // Step 11: Always return 200
  return OK;
}
