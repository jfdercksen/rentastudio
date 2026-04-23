# Technical Defaults — Kyalami Studio

All rules below are specific to this project's stack. Follow them without deviation.
Docs: https://nextjs.org/docs | https://supabase.com/docs | https://payfast.io/integration

---

## Next.js 15 App Router Rules

- All pages use the App Router. Never use `pages/` directory.
- `async` Server Components are the default. Use `'use client'` only when needed (interactivity, browser APIs, useState/useEffect).
- Params and searchParams in page components are Promises in Next.js 15. Always `await` them: `const { id } = await params`
- Metadata: every public page exports a `generateMetadata` function or a static `metadata` object.
- Loading states: use `loading.tsx` files in route segments, not manual loading state in components.
- Error boundaries: use `error.tsx` files, not try/catch rendering null.
- Layouts in `(admin)` route group handle auth checking. Individual admin pages do not re-check auth.

---

## TypeScript Rules

- Strict mode is required. `"strict": true` in tsconfig.json.
- No `any` types. Use `unknown` and narrow, or generate proper types.
- Database types come from `src/types/database.ts` (generated from Supabase schema). Never hand-write DB types.
- Regenerate types after every schema change: `npx supabase gen types typescript --project-id [id] > src/types/database.ts`
- Zod schemas live in `src/lib/validations/`. All API inputs and PayFast ITN payloads are validated with Zod.

---

## Supabase Rules

- Never use the service role key in client-side code. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Browser client (`src/lib/supabase/client.ts`) uses anon key. RLS enforces access.
- Server client (`src/lib/supabase/server.ts`) uses cookie-based session. Use for authenticated server actions.
- Admin client (`src/lib/supabase/admin.ts`) uses service role key. Use only in API routes that require bypass of RLS (ITN handler, admin operations).
- Never modify the database schema without a migration file in `supabase/migrations/`. Direct table edits in Supabase Studio are only for exploration — always capture changes as SQL.
- RLS must be enabled on every table. Verify with: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
- Realtime is not needed for this app. Do not enable Realtime subscriptions — they consume Supabase free tier limits.

---

## Authentication Rules

- Supabase Auth is the only auth system. Do not build custom auth.
- Admin session is checked server-side in the `(admin)` layout using `supabase.auth.getUser()`. Never trust client-side session state for access control.
- The 4 admin users are seeded via SQL or Supabase dashboard. Admin users are identified by their presence in the `auth.users` table — no separate roles table needed at launch.
- Password reset is handled by Supabase Auth's built-in flow. Do not build a custom password reset.

---

## PayFast Rules

- The PayFast passphrase is used in MD5 signature generation. It must match exactly what is set in your PayFast account settings (case-sensitive).
- `PAYFAST_SANDBOX=true` during development. Switch to `false` only in production environment variables.
- PayFast sandbox URL: `https://sandbox.payfast.co.za/eng/process`
- PayFast production URL: `https://www.payfast.co.za/eng/process`
- Never hardcode either URL. Use: `process.env.PAYFAST_SANDBOX === 'true' ? SANDBOX_URL : PROD_URL`
- The ITN handler at `/api/payfast/itn` must:
  1. Verify the request IP against PayFast's published IP list
  2. Rebuild the signature and compare with `signature` field
  3. Verify `payment_status === 'COMPLETE'`
  4. Verify `amount_gross` matches the booking total
  5. Use a database transaction with `SELECT FOR UPDATE` to prevent double-confirmation
- Always test ITN in sandbox before touching production credentials.
- PayFast IPs to whitelist (as of 2026): `41.74.179.194`, `41.74.179.195`, `197.189.216.74`, `197.189.216.75`. Fetch the current list from https://payfast.io/integration before going live.

---

## Email Rules (Resend)

- Resend free tier: 3,000 emails/month, 100/day limit. This is sufficient for a studio booking system.
- All email sending happens server-side only. Never call Resend from a client component.
- Confirmation email fires inside the ITN handler after `status = confirmed` is set. Not on booking creation.
- If Resend fails, log the error but do not fail the ITN handler — the booking is already confirmed. Retry email separately.
- Email template lives in `src/lib/resend/send-confirmation.ts`. No React Email renderer needed at launch — use HTML string template.

---

## API Route Rules

- Every API route validates its input with a Zod schema before touching the database.
- All API routes return consistent error shapes: `{ error: string, code: string }`
- HTTP status codes: 200 success, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 server error.
- The `/api/payfast/itn` route must always return 200 OK to PayFast, even on validation failure. Returning non-200 causes PayFast to retry the ITN up to 10 times.
- The `/api/health` route returns `{ status: 'ok', timestamp: string }`. Used by Vercel Cron to keep Supabase alive.
- Never log sensitive data (PayFast passphrase, Supabase service role key, client banking details) to console or monitoring.

---

## Styling Rules

- Tailwind CSS only. No inline styles except for dynamic values (e.g. calculated positions).
- Brand tokens are configured in `tailwind.config.ts` under `theme.extend.colors`:
  - `brand-cream: '#F5F0E8'`
  - `brand-gold: '#C8A96E'`
  - `brand-emerald: '#2D6A4F'`
  - `brand-terracotta: '#C4622D'`
  - `brand-charcoal: '#1A1A1A'`
- Font variables configured in `app/layout.tsx` using `next/font/google`:
  - `fraunces` → CSS var `--font-fraunces` → Tailwind class `font-display`
  - `inter` → CSS var `--font-inter` → Tailwind class `font-body`
  - `ibm-plex-mono` → CSS var `--font-mono` → Tailwind class `font-mono`
- shadcn/ui components are in `src/components/ui/`. Do not modify them directly — extend via wrapper components.
- Mobile-first. All responsive classes use `sm:`, `md:`, `lg:` prefixes on top of mobile base styles.

---

## Security Rules

- `SUPABASE_SERVICE_ROLE_KEY`, `PAYFAST_*`, `RESEND_API_KEY` must never appear in any file that could be bundled for the browser (components, client hooks, utils imported by client components).
- Client banking details (account number, branch code) are stored in the `bookings` table and are admin-only via RLS. They are never returned by public API routes.
- ID document files in Supabase Storage must be in a private bucket. Never generate public URLs for ID documents.
- All admin API routes check `supabase.auth.getUser()` server-side before processing.
- The PayFast ITN endpoint is not behind auth — it's verified by signature and IP, not session.

---

## Code Quality Rules

- Run `npm run build` and `npm run type-check` before every commit.
- `/tmp/kyalami-tests-passed` must exist before `git commit` runs (the PreToolUse hook enforces this). Create it after a successful build: `touch /tmp/kyalami-tests-passed`
- ESLint errors are blocking. Warnings are acceptable but should be noted in KNOWN_ISSUES.md.
- Prettier formats on every file save (PostToolUse hook handles this automatically).

---

## Deployment Rules

- Never push directly to `main`. Always go through staging branch and Vercel preview first.
- Production environment variables are set in Vercel dashboard, not in code.
- Never commit `.env.local`. It is in `.gitignore`. Update `.env.example` for documentation.
- After deploying to production, verify: booking form loads, PayFast redirect works, admin login works, `/api/health` returns 200.
