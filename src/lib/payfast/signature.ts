import crypto from "crypto";
import type { BookingPayfastInput } from "@/types/payfast";

// Match PHP urlencode() exactly:
//   - spaces → +
//   - ! ~ * ' ( ) are encoded by PHP urlencode but NOT by encodeURIComponent
// Any mismatch here causes a signature failure if a field value contains those chars
// (e.g. a client name with an apostrophe like "D'Angelo").
function pfEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function buildPayFastSignature(
  params: Record<string, string>,
  passphrase?: string
): string {
  const queryString = Object.entries(params)
    .filter(([key, value]) => key !== "signature" && value !== "" && value != null)
    .map(([key, value]) => `${key}=${pfEncode(value)}`)
    .join("&");

  const toHash = passphrase
    ? `${queryString}&passphrase=${pfEncode(passphrase)}`
    : queryString;

  return crypto.createHash("md5").update(toHash).digest("hex");
}

export function buildPayFastPayload(
  input: BookingPayfastInput,
  signature: string
): Record<string, string> {
  const payload: Record<string, string> = {
    merchant_id: input.merchantId,
    merchant_key: input.merchantKey,
    return_url: input.returnUrl,
    cancel_url: input.cancelUrl,
    notify_url: input.notifyUrl,
    m_payment_id: input.mPaymentId,
    amount: input.amount,
    item_name: input.itemName,
  };

  if (input.nameFirst) payload.name_first = input.nameFirst;
  if (input.nameLast) payload.name_last = input.nameLast;
  if (input.emailAddress) payload.email_address = input.emailAddress;
  if (input.itemDescription) payload.item_description = input.itemDescription;

  payload.signature = signature;
  return payload;
}
