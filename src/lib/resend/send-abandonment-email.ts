import { Resend } from "resend";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface AbandonmentEmailInput {
  clientName: string;
  clientEmail: string;
  bookingDetails: {
    date?: string;
    startTime?: string;
    packageType?: string;
    durationType?: string;
  };
  emailNumber: 1 | 2 | 3;
  bookingUrl: string;
}

const SUBJECTS: Record<number, string> = {
  1: "Complete Your Studio Booking",
  2: "Your Studio Booking Is Still Waiting",
  3: "Need Help Completing Your Booking?",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPackage(p?: string): string {
  if (p === "studio_only") return "Studio Only";
  if (p === "all_inclusive") return "All-Inclusive";
  return p ?? "";
}

function formatDuration(d?: string): string {
  if (d === "hourly") return "Hourly";
  if (d === "half_day") return "Half Day (4 hours)";
  if (d === "full_day") return "Full Day";
  return d ?? "";
}

function buildEmail1(name: string, details: AbandonmentEmailInput["bookingDetails"], bookingUrl: string): string {
  const hasDetails = details.date || details.packageType;
  const detailsBlock = hasDetails
    ? `<div style="background:#f5f0e8;border-radius:8px;padding:20px 24px;margin:24px 0;font-size:14px;color:#3a3a34;">
        ${details.date ? `<div style="margin-bottom:8px;"><span style="color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Date</span><br><strong>${escapeHtml(formatDate(details.date))}</strong></div>` : ""}
        ${details.startTime ? `<div style="margin-bottom:8px;"><span style="color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Time</span><br><strong>${escapeHtml(details.startTime)}</strong></div>` : ""}
        ${details.packageType ? `<div style="margin-bottom:8px;"><span style="color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Package</span><br><strong>${escapeHtml(formatPackage(details.packageType))}</strong></div>` : ""}
        ${details.durationType ? `<div><span style="color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Duration</span><br><strong>${escapeHtml(formatDuration(details.durationType))}</strong></div>` : ""}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'Inter',Arial,sans-serif;color:#0e0d0b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e2d6;">
    <div style="background:#0e0d0b;padding:32px;text-align:center;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:300;color:#faf7f2;letter-spacing:-0.02em;">
        Complete Your Booking
      </h1>
      <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#c8984a;font-family:monospace;">
        StudioBooking.co.za
      </p>
    </div>
    <div style="padding:40px 32px;">
      <p style="font-size:16px;color:#3a3a34;margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
      <p style="font-size:15px;color:#3a3a34;line-height:1.6;margin:0 0 16px;">
        It looks like you started a booking with us but didn't quite finish. We've saved your details — it only takes a minute to complete.
      </p>
      ${detailsBlock}
      <p style="font-size:14px;color:#3a3a34;line-height:1.6;margin:0 0 28px;">
        Your selected time slot is still available, but it won't be held indefinitely. Complete your booking now to secure your studio session.
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;background:#c8984a;color:#0e0d0b;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.01em;">
          Complete My Booking →
        </a>
      </div>
      <p style="font-size:13px;color:#8a857a;line-height:1.6;">
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
}

function buildEmail2(name: string, details: AbandonmentEmailInput["bookingDetails"], bookingUrl: string): string {
  const hasDetails = details.date || details.packageType;
  const urgencyNote = hasDetails && details.date
    ? `<div style="background:#fff3e0;border-left:3px solid #c8984a;border-radius:4px;padding:16px 20px;margin:24px 0;font-size:14px;color:#3a3a34;line-height:1.6;">
        <strong style="color:#a87d36;">Your selected slot on ${escapeHtml(formatDate(details.date))} may not stay available much longer.</strong> Once it's gone, we can't guarantee the same time.
      </div>`
    : `<div style="background:#fff3e0;border-left:3px solid #c8984a;border-radius:4px;padding:16px 20px;margin:24px 0;font-size:14px;color:#3a3a34;line-height:1.6;">
        <strong style="color:#a87d36;">Studio slots fill up quickly.</strong> We can't hold your selected time indefinitely — complete your booking today to lock it in.
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'Inter',Arial,sans-serif;color:#0e0d0b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e2d6;">
    <div style="background:#0e0d0b;padding:32px;text-align:center;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:300;color:#faf7f2;letter-spacing:-0.02em;">
        Your Booking Is Still Waiting
      </h1>
      <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#c8984a;font-family:monospace;">
        StudioBooking.co.za
      </p>
    </div>
    <div style="padding:40px 32px;">
      <p style="font-size:16px;color:#3a3a34;margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
      <p style="font-size:15px;color:#3a3a34;line-height:1.6;margin:0 0 4px;">
        Just a friendly reminder — your StudioBooking.co.za booking is still incomplete.
      </p>
      ${urgencyNote}
      <p style="font-size:14px;color:#3a3a34;line-height:1.6;margin:0 0 28px;">
        Don't let another creator snap up your time slot. Complete your booking in under 2 minutes and you're confirmed.
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;background:#c8984a;color:#0e0d0b;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.01em;">
          Finish My Booking →
        </a>
      </div>
      <p style="font-size:13px;color:#8a857a;line-height:1.6;">
        Need help? Call <strong style="color:#0e0d0b;">082 990 2219</strong> or email <a href="mailto:bookings@kyalamistudio.co.za" style="color:#a87d36;">bookings@kyalamistudio.co.za</a>
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
}

function buildEmail3(name: string, bookingUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:'Inter',Arial,sans-serif;color:#0e0d0b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e2d6;">
    <div style="background:#0e0d0b;padding:32px;text-align:center;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:300;color:#faf7f2;letter-spacing:-0.02em;">
        Need Help Completing Your Booking?
      </h1>
      <p style="margin:8px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#c8984a;font-family:monospace;">
        StudioBooking.co.za
      </p>
    </div>
    <div style="padding:40px 32px;">
      <p style="font-size:16px;color:#3a3a34;margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
      <p style="font-size:15px;color:#3a3a34;line-height:1.6;margin:0 0 16px;">
        We noticed your booking was never completed. If you ran into any issues or have questions, we'd love to help you get sorted.
      </p>
      <div style="background:#f5f0e8;border-radius:8px;padding:24px;margin:24px 0;">
        <p style="font-size:15px;font-weight:600;color:#0e0d0b;margin:0 0 16px;">Get in touch directly:</p>
        <table style="border-collapse:collapse;font-size:14px;color:#3a3a34;">
          <tr>
            <td style="padding:6px 16px 6px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;">Phone</td>
            <td style="padding:6px 0;"><a href="tel:+27829902219" style="color:#0e0d0b;font-weight:500;text-decoration:none;">082 990 2219</a></td>
          </tr>
          <tr>
            <td style="padding:6px 16px 6px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td>
            <td style="padding:6px 0;"><a href="mailto:bookings@kyalamistudio.co.za" style="color:#a87d36;">bookings@kyalamistudio.co.za</a></td>
          </tr>
          <tr>
            <td style="padding:6px 16px 6px 0;color:#8a857a;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">WhatsApp</td>
            <td style="padding:6px 0;"><a href="https://wa.me/27829902219" style="color:#a87d36;">Message us on WhatsApp</a></td>
          </tr>
        </table>
      </div>
      <p style="font-size:14px;color:#3a3a34;line-height:1.6;margin:0 0 28px;">
        Or if you're ready, you can still complete your booking online:
      </p>
      <div style="text-align:center;margin-bottom:16px;">
        <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;background:#0e0d0b;color:#faf7f2;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.01em;">
          Complete Booking Online →
        </a>
      </div>
    </div>
    <div style="background:#f5f0e8;padding:20px 32px;border-top:1px solid #e8e2d6;text-align:center;">
      <p style="margin:0;font-size:11px;color:#8a857a;font-family:monospace;letter-spacing:0.08em;text-transform:uppercase;">
        StudioBooking.co.za · Kyalami Estates, Johannesburg
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendAbandonmentEmail(
  input: AbandonmentEmailInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = SUBJECTS[input.emailNumber];

    let html: string;
    if (input.emailNumber === 1) {
      html = buildEmail1(input.clientName, input.bookingDetails, input.bookingUrl);
    } else if (input.emailNumber === 2) {
      html = buildEmail2(input.clientName, input.bookingDetails, input.bookingUrl);
    } else {
      html = buildEmail3(input.clientName, input.bookingUrl);
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "StudioBooking.co.za <bookings@kyalamistudio.co.za>";
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: input.clientEmail,
      subject,
      html,
    });

    if (error) {
      console.error(`sendAbandonmentEmail (email ${input.emailNumber}) failed:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`sendAbandonmentEmail (email ${input.emailNumber}) failed:`, message);
    return { success: false, error: message };
  }
}
