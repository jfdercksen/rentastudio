import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { ITNPayloadSchema } from "@/lib/validations/itn";
import { buildPayFastSignature } from "@/lib/payfast/signature";
import { sendAdminNotification } from "@/lib/resend/send-admin-notification";
import { sendConfirmationEmail } from "@/lib/resend/send-confirmation";
import { sendModificationEmail } from "@/lib/resend/send-modification-email";

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

  // Handle modification top-up payments (extras added via customer portal)
  if (payload.m_payment_id.startsWith("mod_")) {
    const { data: mod } = await supabase
      .from("booking_modifications")
      .select("id, booking_id, new_values, top_up_amount, status")
      .eq("payfast_payment_id", payload.m_payment_id)
      .eq("status", "pending_payment")
      .single();

    if (!mod) {
      console.error("ITN: no pending modification found for", payload.m_payment_id);
      return OK;
    }

    const receivedAmount = parseFloat(payload.amount_gross).toFixed(2);
    const expectedAmount = (mod.top_up_amount as number).toFixed(2);
    if (receivedAmount !== expectedAmount) {
      console.error("ITN mod: amount mismatch — received", receivedAmount, "expected", expectedAmount);
      return OK;
    }

    const newVals = mod.new_values as {
      booking_date: string;
      start_time: string;
      end_time: string;
      duration_type: string;
      add_ons: string[];
      subtotal: number;
      total_amount: number;
    };

    const { data: modBooking } = await supabase
      .from("bookings")
      .select("client_name, client_email, package_type, deposit_amount")
      .eq("id", mod.booking_id)
      .single();

    if (!modBooking) {
      console.error("ITN mod: booking not found for modification", mod.id);
      return OK;
    }

    // Apply modification — WHERE status='confirmed' makes this idempotent
    const { error: applyError } = await supabase
      .from("bookings")
      .update({
        add_ons: newVals.add_ons,
        subtotal: newVals.subtotal,
        total_amount: newVals.total_amount,
        final_total: newVals.total_amount,
      })
      .eq("id", mod.booking_id)
      .eq("status", "confirmed");

    if (applyError) {
      console.error("ITN mod: apply error:", applyError.message);
      return OK;
    }

    await supabase
      .from("booking_modifications")
      .update({ status: "applied" })
      .eq("id", mod.id);

    // Look up access token for the manage URL
    const { data: tokenRow } = await supabase
      .from("booking_access_tokens")
      .select("token")
      .eq("booking_id", mod.booking_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const manageUrl = tokenRow ? `${siteUrl}/booking/manage/${tokenRow.token}` : siteUrl;

    await sendModificationEmail({
      clientName: modBooking.client_name as string,
      clientEmail: modBooking.client_email as string,
      bookingDate: newVals.booking_date,
      startTime: newVals.start_time,
      endTime: newVals.end_time,
      packageType: modBooking.package_type as string,
      durationType: newVals.duration_type,
      addOns: newVals.add_ons,
      subtotal: newVals.subtotal,
      depositAmount: modBooking.deposit_amount as number,
      totalAmount: newVals.total_amount,
      manageUrl,
      modificationType: "add_ons",
    }).catch((e: unknown) => console.error("ITN mod: email error:", e));

    return OK;
  }

  // Step 7: Find matching pending booking
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, client_name, client_email, client_phone, shoot_type, booking_date, start_time, end_time, package_type, duration_type, add_ons, subtotal, deposit_amount, total_amount, final_total, promo_code, discount_amount, bank_holder_name, bank_name, account_number, branch_code, id_document_url, status"
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

  // Step 10: Generate a secure access token for the customer booking portal
  const token = randomBytes(32).toString("hex");
  const { error: tokenError } = await supabase
    .from("booking_access_tokens")
    .insert({ booking_id: booking.id, token });
  if (tokenError) console.error("ITN: failed to insert access token:", tokenError.message);

  // Mark any abandoned booking as recovered
  const { error: abandonError } = await supabase
    .from("abandoned_bookings")
    .update({ is_recovered: true, recovered_at: new Date().toISOString() })
    .eq("client_email", booking.client_email)
    .eq("is_recovered", false);
  if (abandonError) console.error("ITN: failed to mark abandonment recovered:", abandonError.message);

  // Step 11: Send emails — failures must NOT prevent returning 200
  const addOns = Array.isArray(booking.add_ons)
    ? (booking.add_ons as string[])
    : [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const manageUrl = `${siteUrl}/booking/manage/${token}`;

  await Promise.allSettled([
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
      finalTotal: booking.final_total as number | null,
      manageUrl,
    }),
    sendAdminNotification({
      bookingId: booking.id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      clientPhone: (booking.client_phone as string) ?? "",
      shootType: (booking.shoot_type as string) ?? "",
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      packageType: booking.package_type,
      durationType: booking.duration_type,
      addOns,
      subtotal: booking.subtotal as number,
      depositAmount: booking.deposit_amount as number,
      totalAmount: booking.total_amount as number,
      finalTotal: booking.final_total as number | null,
      promoCode: booking.promo_code as string | null,
      discountAmount: booking.discount_amount as number | null,
      bankHolderName: booking.bank_holder_name as string | null,
      bankName: booking.bank_name as string | null,
      accountNumber: booking.account_number as string | null,
      branchCode: booking.branch_code as string | null,
      idDocumentUrl: booking.id_document_url as string | null,
    }),
  ]);

  // Step 11: Always return 200
  return OK;
}
