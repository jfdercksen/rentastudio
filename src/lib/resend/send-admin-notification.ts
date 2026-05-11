import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDuration(durationType: string): string {
  if (durationType === "hourly") return "Hourly";
  if (durationType === "half_day") return "Half Day (4 hours)";
  if (durationType === "full_day") return "Full Day (8 hours)";
  return durationType;
}

function formatPackage(packageType: string): string {
  if (packageType === "studio_only") return "Studio Only";
  if (packageType === "all_inclusive") return "All-Inclusive";
  return packageType;
}

export interface AdminNotificationInput {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  shootType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  packageType: string;
  durationType: string;
  addOns: string[];
  subtotal: number;
  depositAmount: number;
  totalAmount: number;
  finalTotal: number | null;
  promoCode?: string | null;
  discountAmount?: number | null;
  bankHolderName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  branchCode?: string | null;
  idDocumentUrl?: string | null;
}

export async function sendAdminNotification(
  input: AdminNotificationInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminEmails = process.env.ADMIN_NOTIFICATION_EMAIL
      ?.split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (!adminEmails || adminEmails.length === 0) {
      console.error("sendAdminNotification: ADMIN_NOTIFICATION_EMAIL not set");
      return { success: false, error: "ADMIN_NOTIFICATION_EMAIL not set" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Kyalami Studio <bookings@kyalamistudio.co.za>";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const paidTotal = input.finalTotal ?? input.totalAmount;

    const addOnsHtml =
      input.addOns.length > 0
        ? input.addOns.map((a) => `<li>${escapeHtml(a)}</li>`).join("")
        : `<li style="color:#8a857a">None</li>`;

    const promoHtml = input.promoCode
      ? `<tr>
          <td style="padding:5px 0;opacity:0.7;">Promo Code</td>
          <td style="padding:5px 0;text-align:right;">${escapeHtml(input.promoCode)}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#e07d5a;">Discount</td>
          <td style="padding:5px 0;text-align:right;color:#e07d5a;">-R${(input.discountAmount ?? 0).toFixed(2)}</td>
        </tr>`
      : "";

    const bankingHtml =
      input.bankHolderName && input.bankName && input.accountNumber
        ? `<div style="background:#f5f0e8;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#8a857a;font-family:monospace;">Banking Details (deposit refund)</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:5px 0;color:#8a857a;width:40%;">Account Holder</td><td style="padding:5px 0;font-weight:500;">${escapeHtml(input.bankHolderName)}</td></tr>
              <tr><td style="padding:5px 0;color:#8a857a;">Bank</td><td style="padding:5px 0;font-weight:500;">${escapeHtml(input.bankName)}</td></tr>
              <tr><td style="padding:5px 0;color:#8a857a;">Account Number</td><td style="padding:5px 0;font-weight:500;font-family:monospace;">${escapeHtml(input.accountNumber)}</td></tr>
              ${input.branchCode ? `<tr><td style="padding:5px 0;color:#8a857a;">Branch Code</td><td style="padding:5px 0;font-weight:500;font-family:monospace;">${escapeHtml(input.branchCode)}</td></tr>` : ""}
            </table>
          </div>`
        : "";

    const idDocHtml = input.idDocumentUrl
      ? `<p style="margin:0 0 20px;font-size:14px;">
          <a href="${escapeHtml(input.idDocumentUrl)}" style="color:#a87d36;font-weight:500;">View ID Document →</a>
        </p>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'Inter',Arial,sans-serif;color:#0e0d0b;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e8e2d6;">

    <div style="background:#0e0d0b;padding:28px 32px;position:relative;">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#c8984a;"></div>
      <p style="margin:0 0 4px;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#c8984a;">Kyalami Studio — Admin Alert</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:300;color:#faf7f2;letter-spacing:-0.01em;">New Booking Confirmed</h1>
    </div>

    <div style="padding:32px;">

      <div style="background:#f5f0e8;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
        <h3 style="margin:0 0 12px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#8a857a;font-family:monospace;">Client</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:5px 0;color:#8a857a;width:35%;">Name</td><td style="padding:5px 0;font-weight:500;">${escapeHtml(input.clientName)}</td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;">Email</td><td style="padding:5px 0;"><a href="mailto:${escapeHtml(input.clientEmail)}" style="color:#a87d36;">${escapeHtml(input.clientEmail)}</a></td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;">Phone</td><td style="padding:5px 0;"><a href="tel:${escapeHtml(input.clientPhone)}" style="color:#a87d36;">${escapeHtml(input.clientPhone)}</a></td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;">Shoot Type</td><td style="padding:5px 0;">${escapeHtml(input.shootType)}</td></tr>
        </table>
      </div>

      <div style="background:#f5f0e8;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
        <h3 style="margin:0 0 12px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#8a857a;font-family:monospace;">Booking</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:5px 0;color:#8a857a;width:35%;">Date</td><td style="padding:5px 0;font-weight:500;">${escapeHtml(input.bookingDate)}</td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;">Time</td><td style="padding:5px 0;font-weight:500;">${escapeHtml(input.startTime)} – ${escapeHtml(input.endTime)}</td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;">Package</td><td style="padding:5px 0;">${escapeHtml(formatPackage(input.packageType))}</td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;">Duration</td><td style="padding:5px 0;">${escapeHtml(formatDuration(input.durationType))}</td></tr>
          <tr><td style="padding:5px 0;color:#8a857a;vertical-align:top;">Add-ons</td><td style="padding:5px 0;"><ul style="margin:0;padding-left:18px;">${addOnsHtml}</ul></td></tr>
        </table>
      </div>

      <div style="background:#0e0d0b;border-radius:8px;padding:20px 24px;margin-bottom:20px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#c8984a;"></div>
        <h3 style="margin:0 0 12px;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#c8984a;font-family:monospace;">Payment</h3>
        <table style="width:100%;border-collapse:collapse;color:#faf7f2;font-size:14px;">
          <tr><td style="padding:5px 0;opacity:0.7;">Subtotal</td><td style="padding:5px 0;text-align:right;">R${input.subtotal.toFixed(2)}</td></tr>
          <tr><td style="padding:5px 0;color:#c8984a;">Deposit</td><td style="padding:5px 0;text-align:right;color:#c8984a;">R${input.depositAmount.toFixed(2)}</td></tr>
          ${promoHtml}
          <tr style="border-top:1px solid rgba(255,255,255,0.15);">
            <td style="padding:12px 0 4px;font-family:Georgia,serif;font-size:18px;color:#c8984a;">Total Received</td>
            <td style="padding:12px 0 4px;text-align:right;font-family:Georgia,serif;font-size:18px;color:#c8984a;">R${paidTotal.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      ${bankingHtml}
      ${idDocHtml}

      <div style="text-align:center;margin-top:8px;">
        <a href="${siteUrl}/admin/bookings" style="display:inline-block;padding:12px 28px;background:#0e0d0b;color:#faf7f2;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;letter-spacing:0.02em;">
          View in Dashboard →
        </a>
      </div>
    </div>

    <div style="background:#f5f0e8;padding:16px 32px;border-top:1px solid #e8e2d6;text-align:center;">
      <p style="margin:0;font-size:11px;color:#8a857a;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;">
        Booking ID: ${escapeHtml(input.bookingId)}
      </p>
    </div>

  </div>
</body>
</html>`;

    await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      subject: `New Booking — ${input.clientName} · ${input.bookingDate} at ${input.startTime}`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("sendAdminNotification failed:", message);
    return { success: false, error: message };
  }
}
