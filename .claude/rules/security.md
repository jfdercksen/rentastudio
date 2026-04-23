---
paths:
  - "src/app/api/**"
  - "src/middleware.ts"
  - "src/lib/supabase/**"
  - "src/lib/payfast/**"
  - "src/app/(admin)/**"
---

# Security Rules — Kyalami Studio

Applies to: API routes, middleware, Supabase utilities, PayFast utilities, admin routes.

## Secret Management

These environment variables must NEVER appear in any file that could be bundled for the browser:
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `RESEND_API_KEY`

Safe browser variables (prefixed with `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

If you are writing a `'use client'` component and you need Supabase — use the browser client with the anon key. RLS enforces access. Never use the service role key client-side.

## API Route Security

Every API route that handles sensitive operations MUST:
1. Validate input with Zod before any database operations
2. Return consistent error shapes: `{ error: string, code: string }`
3. Never include stack traces or internal details in error responses
4. Log errors server-side with `console.error` (never `console.log`)

Admin-only API routes MUST:
1. Call `supabase.auth.getUser()` server-side as the first operation
2. Return 401 immediately if no authenticated user

## PayFast ITN Security (non-negotiable)

The ITN handler at `src/app/api/payfast/itn/route.ts` must perform these checks IN ORDER:
1. IP whitelist verification (before any DB work)
2. Signature rebuild and comparison
3. `payment_status === 'COMPLETE'` check
4. Booking lookup and amount verification
5. Status update with `.eq('status', 'pending')` guard

The handler always returns HTTP 200 to PayFast, even on rejection. Non-200 causes retries.

## Supabase Client Usage

| Client | File | Use for |
|---|---|---|
| Browser | `src/lib/supabase/client.ts` | Client components, user-facing reads |
| Server | `src/lib/supabase/server.ts` | Server components, admin pages, auth |
| Admin | `src/lib/supabase/admin.ts` | ITN handler, service role operations |

Never use the admin client in client-side code. Never use the browser client for admin operations.

## File Upload Security

ID document uploads in the booking form:
- Validate file type server-side (accept: image/*, application/pdf only)
- Enforce max file size: 5MB
- Generate UUID filename (never use client-provided filename)
- Upload to `id-documents` private Supabase Storage bucket
- Never generate or return public URLs for ID documents

## Data Exposure Rules

Public API routes must never return:
- `account_number`, `branch_code`, `bank_name`, `bank_holder_name`
- `id_document_url`
- `payfast_payment_id`
- Any column from `auth.users`
