---
name: payfast-webhook
description: Implement or review the PayFast ITN webhook handler for Kyalami Studio. Use when building or debugging the payment confirmation flow.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
disable-model-invocation: true
---

# PayFast Webhook — Kyalami Studio

## Live Context

Current ITN handler: !`cat src/app/api/payfast/itn/route.ts 2>/dev/null || echo "ITN handler not created yet"`
Current signature util: !`cat src/lib/payfast/signature.ts 2>/dev/null || echo "Signature util not created yet"`

## Implementation

### Step 1: Signature Utility (`src/lib/payfast/signature.ts`)

```typescript
import crypto from 'crypto'

export function buildPayFastSignature(
  data: Record<string, string>,
  passphrase: string
): string {
  // 1. Remove empty values and the signature field itself
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => k !== 'signature' && v !== '' && v != null)
  )

  // 2. Sort keys alphabetically
  const sorted = Object.keys(filtered).sort().reduce<Record<string, string>>((acc, key) => {
    acc[key] = filtered[key]
    return acc
  }, {})

  // 3. Build query string
  const queryString = new URLSearchParams(sorted).toString()

  // 4. Append passphrase
  const withPassphrase = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase)}`
    : queryString

  // 5. MD5 hash
  return crypto.createHash('md5').update(withPassphrase).digest('hex')
}

export function buildPayFastPayload(booking: {
  id: string
  clientName: string
  clientEmail: string
  totalAmount: number
  packageType: string
}, siteUrl: string): Record<string, string> {
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true'

  return {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${siteUrl}/booking/confirmed`,
    cancel_url: `${siteUrl}/booking`,
    notify_url: `${siteUrl}/api/payfast/itn`,
    name_first: booking.clientName.split(' ')[0],
    name_last: booking.clientName.split(' ').slice(1).join(' ') || ' ',
    email_address: booking.clientEmail,
    m_payment_id: booking.id,
    amount: booking.totalAmount.toFixed(2),
    item_name: `Kyalami Studio — ${booking.packageType}`,
    email_confirmation: '1',
    confirmation_address: booking.clientEmail,
  }
}
```

### Step 2: ITN Handler (`src/app/api/payfast/itn/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { buildPayFastSignature } from '@/lib/payfast/signature'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingConfirmation } from '@/lib/resend/send-confirmation'

const PAYFAST_IPS = [
  '41.74.179.194',
  '41.74.179.195',
  '197.189.216.74',
  '197.189.216.75',
  '127.0.0.1', // localhost for testing
]

export async function POST(request: NextRequest) {
  // Always return 200 to PayFast — non-200 triggers retries up to 10x
  const fail = (reason: string) => {
    console.error(`PayFast ITN rejected: ${reason}`)
    return new NextResponse('OK', { status: 200 })
  }

  try {
    // 1. IP verification
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0'

    const isSandbox = process.env.PAYFAST_SANDBOX === 'true'
    if (!isSandbox && !PAYFAST_IPS.includes(ip)) {
      return fail(`Invalid IP: ${ip}`)
    }

    // 2. Parse body
    const body = await request.text()
    const params = Object.fromEntries(new URLSearchParams(body).entries())

    // 3. Signature verification
    const expectedSignature = buildPayFastSignature(params, process.env.PAYFAST_PASSPHRASE!)
    if (params.signature !== expectedSignature) {
      return fail('Signature mismatch')
    }

    // 4. Payment status check
    if (params.payment_status !== 'COMPLETE') {
      console.log(`PayFast ITN non-complete status: ${params.payment_status} for booking ${params.m_payment_id}`)
      return new NextResponse('OK', { status: 200 })
    }

    // 5. Look up the booking
    const supabase = createAdminClient()
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.m_payment_id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !booking) {
      return fail(`Booking not found or not pending: ${params.m_payment_id}`)
    }

    // 6. Amount verification (compare as strings to avoid float issues)
    const expectedAmount = booking.total_amount.toFixed(2)
    const receivedAmount = parseFloat(params.amount_gross).toFixed(2)
    if (expectedAmount !== receivedAmount) {
      return fail(`Amount mismatch. Expected: ${expectedAmount}, got: ${receivedAmount}`)
    }

    // 7. Confirm booking (with conflict protection via unique constraint)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payfast_payment_id: params.pf_payment_id,
        payfast_amount_gross: params.amount_gross,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', params.m_payment_id)
      .eq('status', 'pending') // Only update if still pending (prevents double-confirm)

    if (updateError) {
      return fail(`Failed to confirm booking: ${updateError.message}`)
    }

    // 8. Send confirmation email (non-blocking)
    sendBookingConfirmation({
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      bookingDate: new Date(booking.booking_date).toLocaleDateString('en-ZA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      startTime: booking.start_time,
      endTime: booking.end_time,
      packageType: booking.package_type === 'studio_only' ? 'Studio Only' : 'All-Inclusive',
      durationType: booking.duration_type,
      addOns: booking.add_ons as Array<{ name: string; price: number }>,
      subtotal: booking.subtotal,
      depositAmount: booking.deposit_amount,
      totalAmount: booking.total_amount,
      bookingId: booking.id,
    }).catch(e => console.error('Email send failed (non-blocking):', e))

    console.log(`Booking confirmed: ${params.m_payment_id}`)
    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('ITN handler unexpected error:', error)
    return new NextResponse('OK', { status: 200 }) // Always 200 to PayFast
  }
}
```

## Verification Checklist After Implementation

- [ ] IP check runs FIRST before any database operations
- [ ] Signature rebuilt from params (not trusting params.signature directly)
- [ ] Amount compared as formatted strings, not floats
- [ ] Update uses `.eq('status', 'pending')` to prevent double-confirm
- [ ] Returns 200 even on failure
- [ ] Email failure does not fail the handler (`.catch()` used)
- [ ] Tested in sandbox with a real PayFast sandbox payment
