---
name: add-email-template
description: Create a Resend email template for Kyalami Studio. Use when adding transactional emails — booking confirmation, cancellation notice, reschedule notification.
argument-hint: [template-name: confirmation|cancellation|reschedule]
allowed-tools: Read, Write, Edit, Bash
---

# Add Email Template — Kyalami Studio

Creating email template: $ARGUMENTS

## Resend Setup for This Project

- Free tier: 3,000 emails/month, 100/day
- Template location: `src/lib/resend/[template-name].ts`
- All email sending is server-side only
- Confirmation email fires inside the ITN handler after booking confirmed
- If Resend fails, log error but do NOT fail the booking confirmation

## Booking Confirmation Template

Create `src/lib/resend/send-confirmation.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationData {
  clientName: string
  clientEmail: string
  bookingDate: string        // e.g. "Wednesday, 30 April 2026"
  startTime: string          // e.g. "09:00"
  endTime: string            // e.g. "13:00"
  packageType: string        // e.g. "All-Inclusive"
  durationType: string       // e.g. "Half Day"
  addOns: Array<{ name: string; price: number }>
  subtotal: number
  depositAmount: number
  totalAmount: number
  bookingId: string
}

export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
  const addOnsHtml = data.addOns.length > 0
    ? data.addOns.map(a => `<tr><td style="padding: 8px 0; font-family: 'IBM Plex Mono', monospace; font-size: 14px;">${a.name}</td><td style="padding: 8px 0; font-family: 'IBM Plex Mono', monospace; font-size: 14px; text-align: right;">R ${a.price.toFixed(2)}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding: 8px 0; color: #8B8B8B; font-size: 14px;">No add-ons selected</td></tr>'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking Confirmed — Kyalami Studio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F0E8; font-family: 'Inter', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 300; color: #1A1A1A; letter-spacing: -0.02em; margin: 0;">
        Kyalami Studio
      </h1>
      <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #C8A96E; margin: 8px 0 0 0;">
        Booking Confirmed
      </p>
    </div>

    <!-- Confirmation box -->
    <div style="background: #FFFFFF; border: 1px solid rgba(200,169,110,0.3); padding: 32px; margin-bottom: 24px;">
      <p style="color: #1A1A1A; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Hi ${data.clientName},
      </p>
      <p style="color: #1A1A1A; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Your studio session is confirmed. We look forward to seeing you.
      </p>

      <!-- Booking details -->
      <div style="border-top: 1px solid rgba(200,169,110,0.3); padding-top: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #8B8B8B; font-size: 14px; width: 40%;">Date</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 500;">${data.bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8B8B8B; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 500;">${data.startTime} – ${data.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8B8B8B; font-size: 14px;">Package</td>
            <td style="padding: 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 500;">${data.packageType} · ${data.durationType}</td>
          </tr>
        </table>
      </div>

      <!-- Add-ons -->
      ${data.addOns.length > 0 ? `
      <div style="border-top: 1px solid rgba(200,169,110,0.3); padding-top: 24px; margin-top: 8px;">
        <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8B8B8B; margin: 0 0 12px 0;">Equipment Add-ons</p>
        <table style="width: 100%; border-collapse: collapse;">
          ${addOnsHtml}
        </table>
      </div>
      ` : ''}

      <!-- Payment summary -->
      <div style="border-top: 1px solid rgba(200,169,110,0.3); padding-top: 24px; margin-top: 8px;">
        <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8B8B8B; margin: 0 0 12px 0;">Payment Summary</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #8B8B8B; font-size: 14px;">Session fee</td>
            <td style="padding: 4px 0; color: #1A1A1A; font-size: 14px; text-align: right;">R ${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #8B8B8B; font-size: 14px;">Refundable deposit</td>
            <td style="padding: 4px 0; color: #1A1A1A; font-size: 14px; text-align: right;">R ${data.depositAmount.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 1px solid rgba(200,169,110,0.3);">
            <td style="padding: 12px 0 4px 0; color: #1A1A1A; font-size: 15px; font-weight: 600;">Total paid</td>
            <td style="padding: 12px 0 4px 0; color: #C8A96E; font-size: 18px; font-family: 'Courier New', monospace; text-align: right; font-weight: 600;">R ${data.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Cancellation policy -->
    <div style="background: #FFFFFF; border: 1px solid rgba(200,169,110,0.3); padding: 24px; margin-bottom: 24px;">
      <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8B8B8B; margin: 0 0 12px 0;">Cancellation Policy</p>
      <p style="color: #1A1A1A; font-size: 14px; line-height: 1.7; margin: 0;">
        Free cancellation up to 48 hours before your session. Within 48 hours, a 50% cancellation fee applies. No-shows are non-refundable. Refundable deposit returned within 3–5 business days after your session, subject to no damages.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px;">
      <p style="color: #8B8B8B; font-size: 13px; margin: 0 0 4px 0;">Kyalami Estates, Johannesburg</p>
      <p style="color: #8B8B8B; font-size: 12px; margin: 0;">
        Booking reference: <span style="font-family: 'Courier New', monospace; color: #C8A96E;">${data.bookingId.slice(0, 8).toUpperCase()}</span>
      </p>
    </div>

  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'Kyalami Studio <bookings@resend.dev>',
    to: data.clientEmail,
    subject: `Booking confirmed — ${data.bookingDate}`,
    html,
  })

  if (error) {
    console.error('Resend error (booking confirmed, email failed):', error)
    // Do NOT throw — booking is confirmed, email failure is non-blocking
  }
}
```

## Rules

- All email sending is server-side only — never import Resend in client components
- Confirmation fires after booking is confirmed, not at booking creation
- Email failures must NOT fail the ITN handler — catch and log only
- Update `from` field after custom domain is configured post-launch
- Booking reference in email: first 8 characters of UUID, uppercase
