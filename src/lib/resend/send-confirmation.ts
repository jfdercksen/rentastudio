import { Resend } from "resend";
import type { ConfirmationEmailInput } from "@/types/booking";

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

export async function sendConfirmationEmail(
  input: ConfirmationEmailInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const total = input.finalTotal != null ? input.finalTotal : input.subtotal + input.depositAmount;

    const addOnsHtml =
      input.addOns.length > 0
        ? `<ul style="margin:8px 0 0;padding-left:20px;color:#3a3a34;font-size:14px;">
            ${input.addOns.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
          </ul>`
        : `<p style="color:#8a857a;font-size:14px;margin:4px 0 0;">None</p>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'Inter',Arial,sans-serif;color:#0e0d0b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e2d6;">
    <div style="background:#0e0d0b;padding:32px;text-align:center;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:300;color:#faf7f2;letter-spacing:-0.02em;">
        Booking Confirmed
      </h1>
      <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#c8984a;font-family:monospace;">
        StudioBooking.co.za
      </p>
    </div>

    <div style="padding:40px 32px;">
      <p style="font-size:16px;color:#3a3a34;margin:0 0 32px;">
        Hi ${escapeHtml(input.clientName)}, your studio booking is confirmed. See you on the day!
      </p>

      <div style="background:#f5f0e8;border-radius:8px;padding:28px;margin-bottom:28px;">
        <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:20px;font-weight:400;color:#0e0d0b;">Booking Details</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;width:40%;">Date</td><td style="padding:8px 0;font-weight:500;">${escapeHtml(input.bookingDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Time</td><td style="padding:8px 0;font-weight:500;">${escapeHtml(input.startTime)} – ${escapeHtml(input.endTime)}</td></tr>
          <tr><td style="padding:8px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Package</td><td style="padding:8px 0;font-weight:500;">${escapeHtml(formatPackage(input.packageType))}</td></tr>
          <tr><td style="padding:8px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Duration</td><td style="padding:8px 0;font-weight:500;">${escapeHtml(formatDuration(input.durationType))}</td></tr>
        </table>

        <div style="margin-top:16px;border-top:1px solid #e8e2d6;padding-top:16px;">
          <p style="margin:0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Add-ons</p>
          ${addOnsHtml}
        </div>
      </div>

      <div style="background:#0e0d0b;border-radius:8px;padding:24px;margin-bottom:28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#c8984a;"></div>
        <table style="width:100%;border-collapse:collapse;color:#faf7f2;font-size:14px;">
          <tr><td style="padding:6px 0;opacity:0.7;">Package subtotal</td><td style="padding:6px 0;text-align:right;">R${(input.subtotal).toFixed(2)}</td></tr>
          <tr><td style="padding:6px 0;color:#c8984a;">Deposit (refundable)</td><td style="padding:6px 0;text-align:right;color:#c8984a;">R${(input.depositAmount).toFixed(2)}</td></tr>
          <tr style="border-top:1px solid rgba(255,255,255,0.15);">
            <td style="padding:14px 0 6px;font-family:Georgia,serif;font-size:20px;color:#c8984a;">Total Paid</td>
            <td style="padding:14px 0 6px;text-align:right;font-family:Georgia,serif;font-size:20px;color:#c8984a;">R${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#e8efea;border-left:3px solid #2f5f3f;border-radius:4px;padding:16px 20px;margin-bottom:28px;font-size:13px;color:#3a3a34;line-height:1.6;">
        <strong style="color:#2f5f3f;">Deposit refund:</strong> Your R${(input.depositAmount).toFixed(2)} breakage deposit will be refunded to your bank account within 48–72 hours after the session, once the studio has been inspected.
      </div>

      ${input.manageUrl ? `<div style="text-align:center;margin-bottom:28px;">
        <a href="${input.manageUrl}" style="display:inline-block;background:#c8984a;color:#0e0d0b;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.01em;">
          Manage My Booking →
        </a>
        <p style="font-size:12px;color:#8a857a;margin:8px 0 0;">Change date, time, or add extras through your booking portal.</p>
      </div>` : ""}

      <p style="font-size:13px;color:#8a857a;line-height:1.6;">
        Please bring your original ID on arrival. The full address will be shared via WhatsApp before your session.<br><br>
        Questions? Call us on <strong style="color:#0e0d0b;">082 990 2219</strong> or email <a href="mailto:bookings@kyalamistudio.co.za" style="color:#a87d36;">bookings@kyalamistudio.co.za</a>
      </p>
    </div>

    <div style="background:#f5f0e8;padding:20px 32px;border-top:1px solid #e8e2d6;text-align:center;">
      <p style="margin:0;font-size:11px;color:#8a857a;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;">
        StudioBooking.co.za · Kyalami Estates, Johannesburg
      </p>
    </div>
  </div>
</body>
</html>`;

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "StudioBooking.co.za <bookings@kyalamistudio.co.za>";
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: input.clientEmail,
      subject: `Booking Confirmed — ${input.bookingDate} at ${input.startTime}`,
      html,
    });

    if (error) {
      console.error("sendConfirmationEmail failed:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("sendConfirmationEmail failed:", message);
    return { success: false, error: message };
  }
}
