---
paths:
  - "src/app/api/payfast/**"
  - "src/lib/payfast/**"
  - "src/components/public/booking/**"
  - "src/app/(public)/booking/**"
---

# Payment Rules — Kyalami Studio

Applies to: PayFast integration files, booking form components, booking API routes.

## PayFast Environment

Always use environment-conditional URLs:
```typescript
const PAYFAST_URL = process.env.PAYFAST_SANDBOX === 'true'
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process'
```

Never hardcode either URL.

## Signature Rules

- Parameters must be sorted alphabetically before building the query string
- Empty values are excluded from the signature
- The `signature` field itself is excluded from the signature calculation
- The passphrase is URL-encoded and appended AFTER the query string
- The final string is MD5-hashed — no other hash algorithm
- Any deviation from this order produces an incorrect signature

## Booking Total Calculation

```
Total = Package price + Sum(selected add-ons) + R750 breakage deposit

The R750 deposit is ALWAYS included. No exceptions.
The booking total in the database must match the PayFast amount_gross exactly.
```

## ITN Handler Rules

1. Always return HTTP 200, even when rejecting. Non-200 causes PayFast to retry up to 10 times.
2. IP verification runs FIRST, before any database work.
3. Signature is rebuilt from the ITN payload — never trust the `signature` field in the payload alone.
4. Amount comparison uses string-formatted values: `parseFloat(gross).toFixed(2) === expected.toFixed(2)`
5. The update query includes `.eq('status', 'pending')` — if a booking is already confirmed, the second ITN does nothing (idempotent).
6. Resend email failure does NOT fail the handler — use `.catch(e => console.error(e))`.

## Booking Status Flow

```
pending    → Created when client submits booking form (before payment)
confirmed  → Set only inside ITN handler after all verifications pass
cancelled  → Set by admin in dashboard
no_show    → Set by admin in dashboard
```

No other code may transition a booking to `confirmed`. The return_url page is cosmetic only.

## What the Return URL Must NOT Do

The `/booking/confirmed` page:
- May display a "Thank you" message
- May read the `m_payment_id` from URL params to show booking details
- Must NOT set booking status to confirmed
- Must NOT send a confirmation email
- Must NOT be used as proof of payment

All of the above happen exclusively in the ITN handler.
