# No Bad Patterns — Kyalami Studio

This file grows with every session. Never repeat a mistake that's already recorded here.

When you find a bug or bad pattern, add it immediately:
```
### [Pattern Name]
**Found in:** [file path]
**What went wrong:** [description]
**Correct pattern:** [what to do instead]
**Date added:** [date]
```

---

## Template (replace with real entries as they are discovered)

### Float comparison for PayFast amounts
**Found in:** `src/app/api/payfast/itn/route.ts` (potential)
**What went wrong:** Using `===` or `==` to compare floating point currency amounts leads to false mismatches due to floating point precision (e.g. `3250.00 !== 3250.0000000001`)
**Correct pattern:** Format both amounts to 2 decimal places as strings before comparing: `parseFloat(received).toFixed(2) === expected.toFixed(2)`
**Date added:** April 2026

---

### Params not awaited in Next.js 15
**Found in:** Any `page.tsx` or `layout.tsx` with params
**What went wrong:** In Next.js 15, `params` and `searchParams` are Promises. Accessing them without `await` returns the Promise object, not the values.
**Correct pattern:** `const { id } = await params` — always await before destructuring
**Date added:** April 2026

---

### SUPABASE_SERVICE_ROLE_KEY in client component
**Found in:** (preventive)
**What went wrong:** Using the service role key in a client component exposes it to the browser, allowing anyone to bypass RLS and access all data.
**Correct pattern:** Service role key only in `src/lib/supabase/admin.ts`. Use only in API route handlers, never in components.
**Date added:** April 2026

---

### pfEncode does not match PHP urlencode for special characters
**Found in:** `src/lib/payfast/signature.ts`
**What went wrong:** `encodeURIComponent` does not encode `!`, `~`, `*`, `'`, `(`, `)`. PHP `urlencode()` encodes all six. If any field value (e.g. a client name with an apostrophe) contains these chars, our signature string differs from PayFast's recomputed one, producing a 400 "signature mismatch" error.
**Correct pattern:** After `encodeURIComponent`, apply `.replace(/[!'()*~]/g, (c) => \`%\${c.charCodeAt(0).toString(16).toUpperCase()}\`)` so the output matches PHP `urlencode()` exactly.
**Date added:** May 2026

---

### PayFast passphrase mismatch between env and merchant account
**Found in:** `src/app/api/bookings/route.ts` (operational, not code)
**What went wrong:** `PAYFAST_PASSPHRASE` set in Vercel env but the PayFast merchant account has a different passphrase (or no passphrase at all), or vice versa. Both sides hash a different string, so signatures never match. This produces an identical 400 error to every other signature bug, making it hard to distinguish.
**Correct pattern:** Log into PayFast merchant dashboard → Settings → Merchant Account Information and verify the passphrase matches the Vercel env var exactly (case-sensitive, no trailing whitespace). If PayFast has no passphrase configured, `PAYFAST_PASSPHRASE` must be absent or empty in Vercel.
**Date added:** May 2026

---

### Availability API using anon client against RLS-protected bookings table
**Found in:** `src/app/api/availability/route.ts`
**What went wrong:** Used `createClient()` (server anon key) to query the `bookings` table. The `bookings` table has RLS enabled with SELECT only permitted for `service_role`. Anon queries return 0 rows, so every time slot appears available — users can select taken slots and only hit a conflict at final form submission.
**Correct pattern:** Use `createAdminClient()` (service role) in all server-side API routes that need to read the `bookings` table. The admin client is safe in server-only route handlers because it never reaches the browser.
**Date added:** May 2026
