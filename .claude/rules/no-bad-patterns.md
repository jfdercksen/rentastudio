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

*Add new patterns below as they are discovered during the build.*
