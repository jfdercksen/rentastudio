# Kyalami Studio — Claude Code Project
## Ai Dynamic Advisory

---

## 🚀 Session Startup — Read This First

Every new chat session must follow this sequence before doing anything else:

**Step 1 — Read project state:**
```bash
cat BUILD_STATUS.md
cat DECISIONS.md
cat KNOWN_ISSUES.md
```

**Step 2 — Ask the developer:**
> "According to BUILD_STATUS.md we are on [phase and task].
> Confirm:
> 1. Is this still correct?
> 2. Any blockers not in KNOWN_ISSUES.md?
> 3. What do you want to work on today?"

**Step 3 — Wait for answer before doing anything.**

**Step 4 — Load the relevant phase from IMPLEMENTATION_WORKFLOW.md:**
```bash
grep -n "## PHASE" IMPLEMENTATION_WORKFLOW.md
```

---

## Project Identity

| Field | Value |
|---|---|
| **App name** | Kyalami Studio |
| **Agency** | Ai Dynamic Advisory |
| **Type** | Content/creative studio booking platform |
| **Location** | Kyalami Estates, Johannesburg, South Africa |
| **Target users** | Content creators, YouTubers, corporate video clients |
| **Tagline** | Show up and shoot |
| **Production URL** | TBC — domain to be configured via Cloudflare |
| **Staging URL** | Vercel preview URL (auto-generated per branch) |
| **Admin dashboard** | /dashboard (Supabase Auth protected, 4 users) |

---

## Tech Stack

| Layer | Tool | Version | Docs |
|---|---|---|---|
| Framework | Next.js | 15 App Router | https://nextjs.org/docs |
| Database | Supabase | Latest | https://supabase.com/docs |
| Auth | Supabase Auth | — | https://supabase.com/docs/guides/auth |
| Storage | Supabase Storage | — | https://supabase.com/docs/guides/storage |
| Hosting | Vercel Pro | — | https://vercel.com/docs |
| Payment | PayFast Standard | — | https://payfast.io/integration |
| CDN / Security | Cloudflare | Free | https://developers.cloudflare.com |
| Email | Resend | Free tier | https://resend.com/docs |
| Styling | Tailwind CSS | v4 | https://tailwindcss.com/docs |
| Components | shadcn/ui | Latest | https://ui.shadcn.com |
| Validation | Zod + React Hook Form | Latest | https://zod.dev |
| Language | TypeScript | 5.x strict | https://typescriptlang.org |

---

## File Structure

```
kyalami-studio/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Homepage (all sections)
│   │   │   ├── booking/
│   │   │   │   ├── page.tsx                # Booking form
│   │   │   │   └── confirmed/
│   │   │   │       └── page.tsx            # Post-payment confirmation
│   │   │   └── privacy/
│   │   │       └── page.tsx                # POPIA privacy policy
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                  # Auth guard for all admin routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx                # Admin login
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                # Dashboard overview
│   │   │       ├── bookings/
│   │   │       │   └── page.tsx            # Bookings table + detail modal
│   │   │       ├── pricing/
│   │   │       │   └── page.tsx            # Package + add-on price editor
│   │   │       ├── content/
│   │   │       │   └── page.tsx            # Site content editor (FAQ, T&C, amenities)
│   │   │       └── gallery/
│   │   │           └── page.tsx            # Image upload/manage
│   │   ├── api/
│   │   │   ├── payfast/
│   │   │   │   └── itn/
│   │   │   │       └── route.ts            # PayFast ITN webhook (CRITICAL)
│   │   │   ├── bookings/
│   │   │   │   └── route.ts                # Create/list bookings
│   │   │   ├── availability/
│   │   │   │   └── route.ts                # Available slots by date
│   │   │   └── health/
│   │   │       └── route.ts                # Supabase keep-alive ping
│   │   ├── layout.tsx                      # Root layout with fonts
│   │   └── globals.css                     # Tailwind + brand CSS vars
│   ├── components/
│   │   ├── public/
│   │   │   ├── Hero.tsx
│   │   │   ├── TheSpace.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Equipment.tsx
│   │   │   ├── Amenities.tsx
│   │   │   ├── BookingSection.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── TermsModal.tsx
│   │   │   └── booking/
│   │   │       ├── BookingForm.tsx          # Master form with state
│   │   │       ├── DatePicker.tsx           # Availability calendar
│   │   │       ├── TimePicker.tsx           # Available slots
│   │   │       ├── PackageSelector.tsx      # Studio Only / All-Inclusive
│   │   │       ├── AddOnSelector.tsx        # Equipment add-ons
│   │   │       ├── ClientDetailsForm.tsx    # Name, email, phone, ID upload
│   │   │       ├── BankingDetailsForm.tsx   # Bank details for deposit refund
│   │   │       └── PaymentSummary.tsx       # Running total + PayFast submit
│   │   ├── admin/
│   │   │   ├── BookingsTable.tsx
│   │   │   ├── BookingDetailModal.tsx
│   │   │   ├── PricingEditor.tsx
│   │   │   ├── GalleryManager.tsx
│   │   │   └── ContentEditor.tsx
│   │   └── ui/                             # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Browser Supabase client
│   │   │   ├── server.ts                   # Server Supabase client
│   │   │   └── admin.ts                    # Service role client (admin ops only)
│   │   ├── payfast/
│   │   │   ├── signature.ts                # MD5 signature builder
│   │   │   └── itn-handler.ts              # ITN verification logic
│   │   ├── resend/
│   │   │   └── send-confirmation.ts        # Client booking confirmation email
│   │   └── validations/
│   │       ├── booking.ts                  # Zod booking schema
│   │       └── itn.ts                      # Zod ITN payload schema
│   ├── types/
│   │   ├── booking.ts
│   │   ├── database.ts                     # Supabase generated types
│   │   └── payfast.ts
│   └── middleware.ts                       # Supabase auth session refresh
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql                            # Admin user seed + default pricing
├── public/
│   └── images/                            # Studio gallery images
├── .claude/
│   ├── agents/                            # Specialist AI agents
│   ├── skills/                            # Slash command skills
│   ├── rules/                             # Path-scoped coding rules
│   └── hooks/
│       └── skill-evaluator.sh
├── CLAUDE.md
├── settings.json
├── .mcp.json
├── BUILD_STATUS.md
├── DECISIONS.md
├── KNOWN_ISSUES.md
├── technical-defaults.md
├── design-rules.md
├── workflow.md
└── IMPLEMENTATION_WORKFLOW.md
```

---

## Route Map

| Route | File | Purpose | Auth Required |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` | Homepage — all public sections | No |
| `/booking` | `app/(public)/booking/page.tsx` | Booking form | No |
| `/booking/confirmed` | `app/(public)/booking/confirmed/page.tsx` | Post-payment confirmation | No |
| `/privacy` | `app/(public)/privacy/page.tsx` | POPIA privacy policy | No |
| `/login` | `app/(admin)/login/page.tsx` | Admin login | No |
| `/dashboard` | `app/(admin)/dashboard/page.tsx` | Dashboard overview | Admin |
| `/dashboard/bookings` | `app/(admin)/dashboard/bookings/page.tsx` | Bookings management | Admin |
| `/dashboard/pricing` | `app/(admin)/dashboard/pricing/page.tsx` | Price editor | Admin |
| `/dashboard/content` | `app/(admin)/dashboard/content/page.tsx` | Content editor | Admin |
| `/dashboard/gallery` | `app/(admin)/dashboard/gallery/page.tsx` | Gallery manager | Admin |
| `/api/payfast/itn` | `app/api/payfast/itn/route.ts` | PayFast ITN webhook | Signature verified |
| `/api/bookings` | `app/api/bookings/route.ts` | Create/list bookings | No / Admin |
| `/api/availability` | `app/api/availability/route.ts` | Available slots by date | No |
| `/api/health` | `app/api/health/route.ts` | Supabase keep-alive | No |

---

## Environment Variables

Create `.env.local` for local development. Never commit this file. Reference `.env.example` for all required keys.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Safe for browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Safe for browser (RLS enforced)
SUPABASE_SERVICE_ROLE_KEY=          # SERVER ONLY — never expose to browser

# PayFast
PAYFAST_MERCHANT_ID=                # Server only
PAYFAST_MERCHANT_KEY=               # Server only
PAYFAST_PASSPHRASE=                 # Server only
PAYFAST_SANDBOX=true                # Set to false in production
NEXT_PUBLIC_SITE_URL=               # Full URL e.g. https://kyalamistudio.co.za

# Resend
RESEND_API_KEY=                     # Server only

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=            # The primary admin email shown in UI
```

**Browser safety rule:** Only `NEXT_PUBLIC_` vars are safe to use in client components. `SUPABASE_SERVICE_ROLE_KEY`, `PAYFAST_*`, and `RESEND_API_KEY` must never appear in any client-side code.

---

## Three-Environment Workflow

| Environment | Branch | URL | Purpose |
|---|---|---|---|
| Local | feature/* | localhost:3000 | Development |
| Staging | staging | Auto Vercel preview URL | Review before production |
| Production | main | kyalamistudio.co.za | Live site |

**Daily development flow:**
```bash
# Start new feature
git checkout -b feature/booking-form

# Develop locally
npm run dev

# When ready for review
git push origin feature/booking-form
# → Vercel auto-creates preview URL for this branch

# After review, merge to staging
git checkout staging
git merge feature/booking-form
git push origin staging
# → Vercel deploys to staging preview URL

# After client sign-off, merge to main
git checkout main
git merge staging
git push origin main
# → Vercel deploys to production
```

**Local dev commands:**
```bash
npm run dev          # Start dev server
npm run build        # Production build (run before committing)
npm run type-check   # TypeScript check (npx tsc --noEmit)
npm run lint         # ESLint
```

**Never push directly to main without staging review.**

---

## GitHub Secrets Required

Configure in Vercel dashboard under Project Settings → Environment Variables:

| Secret | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Supabase service role key |
| `PAYFAST_MERCHANT_ID` | All | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | All | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | All | PayFast passphrase |
| `PAYFAST_SANDBOX` | Staging | `true` |
| `PAYFAST_SANDBOX` | Production | `false` |
| `NEXT_PUBLIC_SITE_URL` | Staging | Vercel preview URL |
| `NEXT_PUBLIC_SITE_URL` | Production | https://kyalamistudio.co.za |
| `RESEND_API_KEY` | All | Resend API key |

---

## Build Workflow — 7 Steps

Follow this sequence for every feature:

1. **Write** — implement the feature
2. **Review** — spawn `@code-reviewer` (persistent memory, knows this codebase)
3. **QA Unit** — spawn `@qa-unit` (generates and runs Vitest tests)
4. **QA Visual** — spawn `@qa-visual` (screenshots at 375px, 768px, 1280px — frontend changes only)
5. **Fix** — apply all findings from steps 2–4
6. **Build check** — `npm run build && npm run type-check`
7. **Ship** — only after all pass: `git add [files] && git commit -m "feat: ..."`

Spawn `@code-reviewer`, `@qa-unit`, and `@qa-visual` in parallel when they cover independent concerns.

After every significant feature: spawn `@code-auditor` for adversarial review. It assumes your code is wrong and tries to break it.

**Touch PayFast ITN code?** Always spawn `@payfast-agent` for review. ITN bugs = lost revenue.
**Touch Supabase schema or RLS?** Always spawn `@supabase-agent` for review. RLS bugs = data leaks.

---

## Compound Learning Rule

When you find a bug, a bad pattern, or a mistake — add it immediately to `.claude/rules/no-bad-patterns.md` with:
- File path where it was found
- What went wrong
- The correct pattern

This file grows with every session. Never repeat a mistake that's already in it.

---

## Agents

| Agent | File | Purpose |
|---|---|---|
| `@code-reviewer` | `.claude/agents/code-reviewer.md` | Persistent memory code review — gets smarter every session |
| `@code-auditor` | `.claude/agents/code-auditor.md` | Adversarial review using Opus — assumes code is wrong |
| `@qa-unit` | `.claude/agents/qa-unit.md` | Generates and runs Vitest unit tests |
| `@qa-visual` | `.claude/agents/qa-visual.md` | Screenshots and responsive layout checks |
| `@research` | `.claude/agents/research.md` | Fetches official docs before implementing unfamiliar patterns |
| `@payfast-agent` | `.claude/agents/payfast-agent.md` | PayFast ITN, signature, sandbox → production flows |
| `@supabase-agent` | `.claude/agents/supabase-agent.md` | Supabase schema, RLS policies, migrations |
| `@devops-agent` | `.claude/agents/devops-agent.md` | Vercel deployment, Cloudflare DNS, environment setup |

---

## Skills

| Skill | Command | Purpose |
|---|---|---|
| Audit | `/audit` | 9-category parallel codebase health check |
| Visualise | `/visualise` | Interactive HTML codebase tree |
| Restore session | `/restore-session` | Recover context from previous session |
| Security check | `/security-check` | Scan for vulnerabilities, exposed secrets, missing RLS |
| Add component | `/add-component` | Creates typed React component with brand styles |
| Add route | `/add-route` | Adds new App Router page with metadata |
| Add API route | `/add-api-route` | Adds validated API route handler |
| Add Supabase table | `/add-supabase-table` | Creates table with migration and RLS policies |
| Add RLS policy | `/add-rls-policy` | Adds Row Level Security policy |
| Add email template | `/add-email-template` | Creates Resend email template |
| PayFast webhook | `/payfast-webhook` | Implements PayFast ITN handler |
| Screenshot compare | `/screenshot-compare` | Visual regression at 3 breakpoints |

---

## Rules Directory

| File | Loads for | Topic |
|---|---|---|
| `code-style.md` | All files | Naming, structure, TypeScript conventions |
| `security.md` | `src/app/api/**`, `src/middleware.ts`, `**/auth/**` | API security, RLS, secrets |
| `testing.md` | `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts` | Test conventions, mock requirements |
| `no-bad-patterns.md` | All files | Compound learning — grows every session |
| `database.md` | `supabase/**`, `**/migrations/**`, `src/lib/supabase/**` | Schema, migrations, RLS rules |
| `payments.md` | `src/app/api/payfast/**`, `src/lib/payfast/**`, `**/booking/**` | PayFast rules, ITN security |
| `api.md` | `src/app/api/**` | API route conventions, validation, error handling |

---

## MCP Connections

### Supabase MCP
Direct database access from Claude Code — read schema, run queries, manage migrations.
```bash
# Setup: add to .mcp.json (already configured)
# Requires: SUPABASE_ACCESS_TOKEN in environment
```

### GitHub MCP
Create issues, review PRs, manage releases from Claude Code.
```bash
# Setup: add to .mcp.json (already configured)
# Requires: GITHUB_PERSONAL_ACCESS_TOKEN in environment
```

---

## Common Tasks

### Add a new page
```
/add-route [route-name]
# e.g. /add-route faq → creates src/app/(public)/faq/page.tsx
```

### Add a new component
```
/add-component [ComponentName]
# e.g. /add-component PricingCard → creates src/components/public/PricingCard.tsx
```

### Add a new API route
```
/add-api-route [route-name]
# e.g. /add-api-route bookings/cancel → creates src/app/api/bookings/cancel/route.ts
```

### Add a new database table
```
/add-supabase-table [table-name]
# Creates migration SQL + TypeScript types + RLS policies
```

### Run full audit
```
/audit
# 9-category health check, returns score and top 3 priorities
```

### Recover session context
```
/restore-session
# Reads previous session files and git history
```

---

## Supabase Database Schema (Reference)

```sql
-- Core tables
bookings         -- id, created_at, client_name, client_email, client_phone,
                 -- booking_date, start_time, end_time, package_type, duration_type,
                 -- is_weekday, add_ons (jsonb), subtotal, deposit_amount,
                 -- payfast_payment_id, payfast_amount_gross, status, shoot_type,
                 -- id_document_url, bank_holder_name, bank_name, account_number,
                 -- branch_code, notes

pricing          -- id, package_type, duration_type, is_weekday, price_rands
add_ons          -- id, name, description, price_rands, is_active
blocked_dates    -- id, start_date, end_date, reason
site_content     -- id, key, value, updated_at  (amenities, FAQ, T&C, descriptions)
gallery_images   -- id, url, display_order, alt_text, created_at
admin_users      -- managed via Supabase Auth (4 users, all equal access)
```

---

## PayFast ITN Flow (Critical — Do Not Deviate)

```
1. User submits booking form
2. POST /api/bookings → creates booking with status='pending'
3. API returns signed PayFast payload
4. Browser POSTs form to https://www.payfast.co.za/eng/process
5. User pays on PayFast
6. PayFast POSTs ITN to /api/payfast/itn (server-to-server)
7. ITN handler:
   a. Verify PayFast IP whitelist
   b. Validate MD5 signature
   c. Check payment_status = 'COMPLETE'
   d. Verify m_payment_id matches a pending booking
   e. Verify amount_gross matches expected total
   f. SELECT FOR UPDATE on booking row (prevent race conditions)
   g. Set status = 'confirmed'
   h. Send Resend confirmation email
   i. Return 200 OK
8. PayFast redirects browser to return_url (/booking/confirmed)
```

**The return_url step (8) is cosmetic. Booking is only confirmed in step 7g.**
