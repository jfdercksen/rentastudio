# Implementation Workflow — Kyalami Studio
## Ai Dynamic Advisory · Solo build with Claude Code
## Target: Sunday 27 April 2026

This is your step-by-step build guide. Every task tells you exactly what to write, which skill to invoke, which agent to spawn, and when. Follow it in sequence. Do not skip steps.

Read `BUILD_STATUS.md` at the start of every session to know where you are.
Update `BUILD_STATUS.md` at the end of every session before closing.

---

## How This Guide Works

Every task follows this structure:

```
TASK N.N — Task Name
BRANCH: feature/task-name
PRODUCES: [what files/output this task creates]

BEFORE YOU START
  [ ] prerequisite check

STEPS
  1. Do this first
  2. Then do this

AGENTS TO SPAWN
  → WHEN: [trigger]
  → COMMAND: [exact text to paste into Claude Code]
  → WHY: [what it checks]

SKILLS TO USE
  → INVOKE: /skill-name [args]
  → WHY: [what it produces]

BUILD CHECK (run before every commit)
  npm run build && npm run type-check

COMMIT
  git add [files] && git commit -m "feat/chore: [description]"

DONE WHEN
  [ ] all verification items pass
```

---

## The 7-Step Build Rule

Apply this to EVERY task. No exceptions.

```
1. WRITE    → Implement the feature
2. REVIEW   → Spawn @code-reviewer (always)
3. QA UNIT  → Spawn @qa-unit (always — even for UI-only tasks)
4. QA VISUAL → Spawn @qa-visual (frontend tasks only)
5. FIX      → Apply all findings from steps 2–4
6. BUILD    → npm run build && npm run type-check (must pass)
7. SHIP     → git add [files] && git commit -m "feat: ..."
```

Spawn `@code-reviewer` + `@qa-unit` + `@qa-visual` in a single message when all three apply — they run in parallel.

---

## Agent Quick Reference

| Agent | Trigger phrase to use | When to spawn |
|---|---|---|
| `@code-reviewer` | "Use the @code-reviewer agent to review [file]" | After every implementation |
| `@code-auditor` | "Use the @code-auditor agent to adversarially audit [file]" | After ITN handler, auth, RLS, and any security-critical code |
| `@qa-unit` | "Use the @qa-unit agent to generate and run tests for [file]" | After every implementation |
| `@qa-visual` | "Use the @qa-visual agent to screenshot [route] at 375px, 768px, 1280px" | After every frontend component |
| `@research` | "Use the @research agent to look up [topic] in official docs" | Before implementing anything unfamiliar |
| `@payfast-agent` | "Use the @payfast-agent to review [file]" | Any time you touch PayFast code |
| `@supabase-agent` | "Use the @supabase-agent to review [file or migration]" | Any time you touch schema, RLS, or storage |
| `@devops-agent` | "Use the @devops-agent to help with [deployment issue]" | Vercel, Cloudflare DNS, env vars |

---

## Skill Quick Reference

| Skill | Command | When to use |
|---|---|---|
| `/audit` | `/audit` | Start of Phase 3 and Phase 4 |
| `/security-check` | `/security-check` | Before every production deploy |
| `/add-component` | `/add-component [Name] [public\|admin]` | Before writing any new React component |
| `/add-route` | `/add-route [path] [public\|admin]` | Before writing any new page |
| `/add-api-route` | `/add-api-route [path]` | Before writing any new API route handler |
| `/add-supabase-table` | `/add-supabase-table [name]` | When adding a new database table |
| `/add-rls-policy` | `/add-rls-policy [table] [operation]` | When adding RLS to a table |
| `/add-email-template` | `/add-email-template [name]` | Before writing any Resend email |
| `/payfast-webhook` | `/payfast-webhook` | Before implementing the ITN handler |
| `/screenshot-compare` | `/screenshot-compare [route]` | Visual regression check after UI changes |
| `/visualise` | `/visualise` | When you need to see the codebase structure |
| `/restore-session` | `/restore-session` | First thing in every new chat session |

---

## Three-Environment Workflow

| Environment | Branch | URL | Purpose |
|---|---|---|---|
| Local | `feature/*` | `localhost:3000` | Development |
| Staging | `staging` | Vercel preview URL (auto-generated) | Review before production |
| Production | `main` | `kyalamistudio.co.za` | Live bookings |

**Daily git flow — follow this every day:**
```bash
# Start of day: create feature branch
git checkout -b feature/[task-name]

# Develop and test locally
npm run dev

# Before committing — always run this
npm run build && npm run type-check

# Commit
git add [specific files — never git add .]
git commit -m "feat: [clear description]"

# Push to create Vercel preview URL
git push origin feature/[task-name]

# After review — merge to staging
git checkout staging
git merge feature/[task-name]
git push origin staging
# Vercel deploys automatically → review the staging preview URL

# After sign-off — merge to main (production)
git checkout main
git merge staging
git push origin main
```

**Never push to `main` without staging review first.**

---

## Pre-Build Checklist

Complete ALL of these before writing a single line of code. Come back when every box is checked.

### Accounts — Create on Day 1
- [ ] **Vercel** — vercel.com — create account, upgrade to Pro ($20/month)
- [ ] **Supabase** — supabase.com — create account, create new project (choose Frankfurt region for lowest SA latency)
- [ ] **PayFast** — payfast.io — create merchant account, note: merchant ID, merchant key. Set your passphrase in account settings. Sandbox is available immediately; production approval takes 24–48h. Start this on Day 1.
- [ ] **Resend** — resend.com — create account, generate API key, verify your sending domain
- [ ] **Cloudflare** — cloudflare.com — create account, add your domain, copy the nameservers Cloudflare gives you
- [ ] **GitHub** — create a repo for this project (private)
- [ ] **Domain registrar** — log in, replace the current nameservers with Cloudflare's nameservers. Wait up to 1 hour for propagation.

### Credentials to Collect
Paste these into `.env.local` once collected. Never commit this file.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase → Project Settings → API
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase → Project Settings → API
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API (keep secret)
- [ ] `PAYFAST_MERCHANT_ID` — PayFast account dashboard
- [ ] `PAYFAST_MERCHANT_KEY` — PayFast account dashboard
- [ ] `PAYFAST_PASSPHRASE` — Set this yourself in PayFast account settings, then note it
- [ ] `RESEND_API_KEY` — Resend dashboard → API Keys

### Assets — Collect Before Phase 1 Starts
- [ ] Minimum 5 studio gallery images (JPEG or WebP, landscape, high quality)
- [ ] All final prices confirmed (Studio Only hourly/half-day/full-day weekday + weekend, All-Inclusive same, all add-on prices)
- [ ] Final Terms & Conditions text
- [ ] Studio address and contact phone number for footer

---

## PHASE 0 — Foundation and Environment Setup
**Day 1 · Tuesday 22 April 2026**
**Goal: Running Next.js app connected to Supabase, deployed on Vercel, domain resolving.**

---

### Task 0.1 — Scaffold Next.js Project
**BRANCH:** `feature/phase-0-scaffold`
**PRODUCES:** Working Next.js 15 app with all dependencies installed

#### Before You Start
- [ ] Pre-build checklist above is fully complete
- [ ] You are in the `C:\Users\darli\Downloads\Studio Bookings` directory in your terminal

#### Steps

**Step 1 — Scaffold the app into the current directory:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```
When prompted "The directory is not empty. Continue?" → type `y` and press Enter.

**Step 2 — Install all required dependencies:**
```bash
npm install @supabase/supabase-js @supabase/ssr resend zod react-hook-form @hookform/resolvers
```

**Step 3 — Initialise shadcn/ui:**
```bash
npx shadcn@latest init
```
Choose: Default style, Slate base colour, yes to CSS variables.

**Step 4 — Install shadcn components you'll need:**
```bash
npx shadcn@latest add button card dialog input label select textarea accordion badge separator
```

**Step 5 — Verify the app starts:**
```bash
npm run dev
```
Open `http://localhost:3000` — you should see the default Next.js page.

**Step 6 — Delete the default content:**
Clear `src/app/page.tsx` to just a basic placeholder div.
Clear `src/app/globals.css` back to just the Tailwind directives.

> **PASTE INTO CLAUDE CODE — Step 6:**
> ```
> Replace src/app/page.tsx with a minimal placeholder:
> export default function HomePage() {
>   return <div className="min-h-screen">Kyalami Studio — coming soon</div>
> }
>
> Replace src/app/globals.css with only the Tailwind directives (no other content):
> @import "tailwindcss";
>
> Do not add any other styles yet. Do not modify any other files.
> ```

#### Agents to Spawn
After completing the steps above:

> **PASTE INTO CLAUDE CODE — Post-scaffold review:**
> ```
> Use the @code-reviewer agent to review the scaffolded project structure. Confirm:
> - src/ directory exists with app/ inside it
> - tailwind.config.ts is present with correct content
> - All packages appear in package.json: @supabase/supabase-js, @supabase/ssr, resend, zod, react-hook-form, @hookform/resolvers
> - components.json exists (shadcn init completed)
> - No TypeScript errors in any scaffolded file
> - .gitignore includes .env.local
> ```

#### Build Check
```bash
npm run build && npm run type-check
```
Both must pass with zero errors before committing.

#### Commit
```bash
git init
git add package.json package-lock.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs src/ public/ components.json
git commit -m "chore: scaffold Next.js 15 project with Tailwind, shadcn, Supabase, Zod"
```

#### Done When
- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:3000` loads in browser
- [ ] `npm run build` passes
- [ ] `package.json` exists with all dependencies listed

---

### Task 0.2 — Configure Brand Tokens
**BRANCH:** `feature/phase-0-brand`
**PRODUCES:** `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx` with brand colours and fonts

#### Steps

**Step 1 — Read design-rules.md first:**
```
Read design-rules.md before writing any CSS. All brand values come from there.
```

**Step 2 — Add brand colours to `tailwind.config.ts`:**

Extend the theme with these tokens from `design-rules.md`:
- `brand-charcoal` — `#1C1C1C`
- `brand-cream` — `#F5F0E8`
- `brand-gold` — `#C9A84C`
- `brand-warm-grey` — `#9E9E9E`
- `brand-dark-overlay` — `rgba(0,0,0,0.65)`

**Step 3 — Load fonts in `src/app/layout.tsx`:**
```typescript
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' })
```

Apply all three variables to the `<html>` element.

**Step 4 — Set CSS custom properties in `globals.css`:**
Map all Tailwind brand tokens to CSS variables. Set `body` background to `bg-brand-cream`, default text to `text-brand-charcoal`.

> **PASTE INTO CLAUDE CODE — Task 0.2 full implementation:**
> ```
> Read design-rules.md now before writing anything.
>
> Then implement all of the following:
>
> 1. Update tailwind.config.ts — extend the theme.colors with:
>    brand-charcoal: '#1C1C1C'
>    brand-cream: '#F5F0E8'
>    brand-gold: '#C9A84C'
>    brand-warm-grey: '#9E9E9E'
>    Also extend theme.fontFamily with:
>    display: ['var(--font-display)', 'serif']
>    body: ['var(--font-body)', 'sans-serif']
>    mono: ['var(--font-mono)', 'monospace']
>
> 2. Update src/app/layout.tsx:
>    - Import Fraunces, Inter, IBM_Plex_Mono from 'next/font/google'
>    - Fraunces: subsets ['latin'], weight ['300','400'], variable '--font-display'
>    - Inter: subsets ['latin'], weight ['400','500'], variable '--font-body'
>    - IBM_Plex_Mono: subsets ['latin'], weight ['400'], variable '--font-mono'
>    - Apply all three font variables to the <html> className
>    - Set <body> className to 'bg-brand-cream text-brand-charcoal font-body antialiased'
>    - Add Metadata export: title template '%s | Kyalami Studio', default 'Kyalami Studio — Show up and shoot', description 'Professional content creation studio in Kyalami Estates, Johannesburg.'
>
> 3. Update src/app/globals.css:
>    - Keep the Tailwind import
>    - Add CSS custom properties under :root matching each brand token hex value
>
> Follow code-style.md: Tailwind utilities only, no custom class names, no hardcoded hex values in components.
> ```

#### Agents to Spawn
After implementation — run in parallel in a single message:

> **PASTE INTO CLAUDE CODE — Task 0.2 review:**
> ```
> Spawn @code-reviewer and @qa-visual in parallel.
>
> @code-reviewer: Review src/app/layout.tsx, tailwind.config.ts, and src/app/globals.css.
> Confirm: fonts are loaded via next/font/google (NOT a CDN link tag), all three font variables are applied to the html element, brand tokens in tailwind.config match design-rules.md exactly, Metadata type is imported from 'next' and used correctly, body has bg-brand-cream set, no custom CSS class names exist (Tailwind utilities only per code-style.md).
>
> @qa-visual: Screenshot http://localhost:3000 at 375px, 768px, and 1280px. Confirm the page background is cream (#F5F0E8), no horizontal scroll at 375px, and no layout errors.
> ```

#### Build Check
```bash
npm run build && npm run type-check
```

#### Commit
```bash
git add src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "chore: configure brand tokens, fonts, and global styles"
```

#### Done When
- [ ] All three fonts load (visible in browser DevTools → Network → Font)
- [ ] Page background is cream `#F5F0E8`
- [ ] `npm run build` passes

---

### Task 0.3 — Set Up Supabase Project
**BRANCH:** `feature/phase-0-supabase`
**PRODUCES:** Live Supabase project with all tables, RLS policies, storage buckets, and seed data

#### Steps

**Step 1 — Create the migration SQL file:**

Create `supabase/migrations/001_initial_schema.sql` with the full schema.

> **PASTE INTO CLAUDE CODE — Task 0.3 Step 1: Generate migration SQL:**
> ```
> Create the file supabase/migrations/001_initial_schema.sql with the complete Supabase schema for Kyalami Studio.
>
> Read CLAUDE.md (the schema reference section) before writing anything.
>
> Requirements:
> - UUID primary keys (gen_random_uuid()) on all tables
> - created_at TIMESTAMPTZ DEFAULT now() on all tables
> - updated_at TIMESTAMPTZ DEFAULT now() on tables that need it
> - RLS ENABLED on every table (ALTER TABLE x ENABLE ROW LEVEL SECURITY)
>
> Tables and columns:
>
> bookings: id uuid pk, created_at, client_name text, client_email text, client_phone text, booking_date date, start_time time, end_time time, package_type text, duration_type text, is_weekday boolean, add_ons jsonb default '[]', subtotal numeric(10,2), deposit_amount numeric(10,2) default 750, payfast_payment_id text, payfast_amount_gross numeric(10,2), status text default 'pending', shoot_type text, id_document_url text, bank_holder_name text, bank_name text, account_number text, branch_code text, notes text
>
> pricing: id uuid pk, package_type text not null, duration_type text not null, is_weekday boolean not null, price_rands numeric(10,2) not null, UNIQUE(package_type, duration_type, is_weekday)
>
> add_ons: id uuid pk, created_at, name text not null, description text, price_rands numeric(10,2) not null, is_active boolean default true
>
> blocked_dates: id uuid pk, created_at, start_date date not null, end_date date not null, reason text
>
> site_content: id uuid pk, key text UNIQUE not null, value text not null, updated_at timestamptz default now()
>
> gallery_images: id uuid pk, created_at, url text not null, display_order integer not null default 0, alt_text text not null
>
> RLS policies:
> - pricing: SELECT public, all mutations service role only
> - add_ons: SELECT public, all mutations service role only
> - site_content: SELECT public, all mutations service role only
> - gallery_images: SELECT public, all mutations service role only
> - blocked_dates: SELECT public, all mutations service role only
> - bookings: INSERT public (anyone can book), SELECT/UPDATE service role only
>
> Do not include any seed data in this file. Only schema and RLS.
> Follow database.md rules.
> ```

**Step 2 — Spawn supabase-agent to verify the migration before running it:**

> **PASTE INTO CLAUDE CODE — Task 0.3 Step 2: Pre-flight SQL review:**
> ```
> Use the @supabase-agent to review supabase/migrations/001_initial_schema.sql before I run it in Supabase.
> Verify:
> - All 6 tables from CLAUDE.md are present: bookings, pricing, add_ons, blocked_dates, site_content, gallery_images
> - Every table has ALTER TABLE x ENABLE ROW LEVEL SECURITY
> - pricing, add_ons, site_content, gallery_images, blocked_dates: SELECT policy is public (FOR ALL using (true))
> - bookings: INSERT policy is public, SELECT/UPDATE policies are service role only
> - No SQL syntax errors
> - UUID primary keys using gen_random_uuid()
> - created_at timestamps have DEFAULT now()
> ```

**Step 3 — Run the migration in Supabase:**
1. Go to Supabase dashboard → SQL Editor
2. Paste the contents of `001_initial_schema.sql`
3. Click Run

**Step 4 — Create seed data SQL file and run it:**

Create `supabase/seed.sql` with default pricing, add-ons, and site_content rows.

> **PASTE INTO CLAUDE CODE — Task 0.3 Step 4: Generate seed SQL:**
> ```
> Create the file supabase/seed.sql with all default data for Kyalami Studio.
>
> Include INSERT statements for:
>
> 1. pricing table — all combinations of:
>    package_type: 'studio_only' and 'all_inclusive'
>    duration_type: 'hourly', 'half_day', 'full_day'
>    is_weekday: true and false
>    That is 12 rows total. Use placeholder prices:
>    studio_only hourly weekday: 550, weekend: 650
>    studio_only half_day weekday: 1800, weekend: 2200
>    studio_only full_day weekday: 3200, weekend: 3800
>    all_inclusive hourly weekday: 850, weekend: 950
>    all_inclusive half_day weekday: 2800, weekend: 3200
>    all_inclusive full_day weekday: 4800, weekend: 5500
>
> 2. add_ons table — at least 6 items:
>    Ring light (R150), Extra backdrop (R200), Teleprompter (R300), Wireless mic set (R250), Extra HDMI monitor (R150), Green screen (R350)
>    All is_active = true
>
> 3. site_content table — INSERT OR IGNORE rows for keys:
>    'space_description': 'A professional content creation studio designed for creators who mean business.'
>    'amenities': '["High-speed fibre WiFi","Air conditioning","Private change room","On-site parking","Kitchenette access","Natural light option"]'
>    'faq_items': '[{"question":"How do I book?","answer":"Complete the online booking form and pay the deposit to secure your session."},{"question":"What is the deposit?","answer":"A refundable R750 deposit is required to secure your booking."},{"question":"Can I cancel?","answer":"Cancellations with 48 hours notice receive a full deposit refund."}]'
>    'terms_conditions': 'Full terms and conditions to be provided by the studio owner. Replace this placeholder before launch.'
>    'footer_address': 'Kyalami Estates, Johannesburg, South Africa'
>    'footer_phone': '+27 00 000 0000'
>
> Use ON CONFLICT DO NOTHING so this is safe to re-run.
> ```

Run in Supabase SQL Editor after creating the file.

**Step 5 — Create Storage buckets in Supabase dashboard:**
- `gallery` — Public bucket, allow image MIME types only
- `id-documents` — Private bucket, no public access

**Step 6 — Add 4 admin users:**
Supabase dashboard → Authentication → Users → Invite user (×4 email addresses)

#### Agents to Spawn
```
Use the @supabase-agent to verify the Supabase project after setup.
Connect via MCP and confirm:
1. All 6 tables exist
2. RLS is enabled on every table
3. Seed data is present (at least one pricing row per package type)
4. Both storage buckets exist with correct access policies
5. Run: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
   Every table must show rowsecurity = true
```

#### Done When
- [ ] All 6 tables exist in Supabase
- [ ] RLS is ON for every table (confirmed via MCP or Supabase dashboard)
- [ ] Pricing seed data is in the `pricing` table
- [ ] `gallery` and `id-documents` buckets exist
- [ ] 4 admin users exist in Supabase Auth

---

### Task 0.4 — Connect Supabase to Next.js
**BRANCH:** `feature/phase-0-supabase-client`
**PRODUCES:** Three Supabase client files, middleware, `.env.local`, `.env.example`

#### Steps

**Step 1 — Create the three client files:**

> **PASTE INTO CLAUDE CODE — Task 0.4 Step 1: Create Supabase client files:**
> ```
> Create the following three files for Supabase in Kyalami Studio. Follow security.md rules — SUPABASE_SERVICE_ROLE_KEY must never appear in client.ts.
>
> File 1: src/lib/supabase/client.ts
> Browser-only Supabase client using createBrowserClient from @supabase/ssr.
> Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
> Typed with Database from @/types/database.
> Named export: createClient()
>
> File 2: src/lib/supabase/server.ts
> Server-side Supabase client using createServerClient from @supabase/ssr.
> Must read and write cookies using Next.js cookies() from 'next/headers'.
> Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
> Typed with Database from @/types/database.
> Named export: createServerClient() — must be async.
> Follow this exact pattern from the official Supabase Next.js SSR docs.
>
> File 3: src/lib/supabase/admin.ts
> Service role client using createClient from @supabase/supabase-js (NOT @supabase/ssr).
> Uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
> Typed with Database from @/types/database.
> Named export: createAdminClient()
> This file must NEVER be imported by any component — only API route handlers.
>
> All three files: no console.log, no any types, explicit return types, named exports only (no default exports).
> ```

**Step 2 — Create `src/middleware.ts`:**

> **PASTE INTO CLAUDE CODE — Task 0.4 Step 2: Create middleware:**
> ```
> Create src/middleware.ts for Kyalami Studio.
>
> This is the Supabase session refresh middleware. It must:
> - Import createServerClient from @supabase/ssr
> - Use NextRequest and NextResponse from next/server
> - Create a Supabase client that reads from request cookies and writes to response cookies
> - Call supabase.auth.getUser() to refresh the session on every request
> - Return the response with updated cookies
> - Export a config matcher that excludes _next/static, _next/image, favicon.ico, and public image files
>
> Follow the official Supabase Next.js middleware pattern exactly.
> The matcher must include all routes that need auth checking, including /dashboard routes.
> ```

**Step 3 — Generate TypeScript types from Supabase:**
```bash
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] --schema public > src/types/database.ts
```
Replace `[YOUR_PROJECT_ID]` with your actual project ID from the Supabase dashboard URL.

**Step 4 — Create `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
PAYFAST_MERCHANT_ID=[your-merchant-id]
PAYFAST_MERCHANT_KEY=[your-merchant-key]
PAYFAST_PASSPHRASE=[your-passphrase]
PAYFAST_SANDBOX=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=[your-resend-key]
NEXT_PUBLIC_ADMIN_EMAIL=[your-admin-email]
```

**Step 5 — Create `.env.example`** (same keys, no values — commit this file):
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_SANDBOX=true
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

**Step 6 — Add `.env.local` to `.gitignore`** (verify it's already listed — it should be from Next.js scaffold).

**Step 7 — Verify the connection works:**

> **PASTE INTO CLAUDE CODE — Task 0.4 Step 7: Connection test:**
> ```
> Add a temporary Supabase connection test to src/app/page.tsx to verify the database is reachable.
>
> Add this to the top of the default export function (Server Component):
>   import { createServerClient } from '@/lib/supabase/server'
>   const supabase = await createServerClient()
>   const { data, error } = await supabase.from('pricing').select('*').limit(1)
>   console.error('Supabase connection test:', data ? 'OK' : 'FAILED', error?.message)
>
> Run npm run dev and check the terminal. If data is returned, the connection works.
> After confirming it works, remove the test code and import from page.tsx immediately.
> Do not commit the test code.
> ```

#### Agents to Spawn

> **PASTE INTO CLAUDE CODE — Task 0.4 review:**
> ```
> Use the @code-reviewer agent to review these four files:
> - src/lib/supabase/client.ts
> - src/lib/supabase/server.ts
> - src/lib/supabase/admin.ts
> - src/middleware.ts
>
> Confirm:
> - SUPABASE_SERVICE_ROLE_KEY does NOT appear in client.ts
> - SUPABASE_SERVICE_ROLE_KEY is only in admin.ts
> - client.ts uses NEXT_PUBLIC_ keys only
> - admin.ts has no imports from any component file going the other direction
> - Middleware correctly sets and reads cookies for Supabase session refresh
> - All files use the Database generic type from src/types/database.ts
> - No any types, no default exports, explicit return types on all functions
> ```

#### Build Check
```bash
npm run build && npm run type-check
```

#### Commit
```bash
git add src/lib/supabase/ src/middleware.ts src/types/database.ts .env.example
git commit -m "chore: connect Supabase — browser, server, and admin clients + middleware"
```

Note: `.env.local` must NOT be in this commit. Verify with `git status` first.

#### Done When
- [ ] `npm run build` passes
- [ ] Supabase connection confirmed (pricing table query returns data)
- [ ] `.env.local` is NOT tracked by git (`git status` must not show it)
- [ ] `src/types/database.ts` is generated and reflects the live schema

---

### Task 0.5 — Create Vercel Project and Deploy
**BRANCH:** Push `main` after this task
**PRODUCES:** Live Vercel deployment on production URL with all env vars configured

#### Steps

**Step 1 — Push the project to GitHub:**
```bash
git remote add origin https://github.com/[your-username]/[your-repo].git
git branch -M main
git push -u origin main
```

**Step 2 — Create Vercel project:**
1. vercel.com → New Project → Import from GitHub
2. Select your repo
3. Framework: Next.js (auto-detected)
4. Build command: `npm run build` (default)
5. Output directory: `.next` (default)
6. Do NOT deploy yet — add env vars first

**Step 3 — Add environment variables in Vercel:**
Go to Project Settings → Environment Variables. Add ALL variables from `.env.example`:

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | your key | Production, Preview, Development |
| `PAYFAST_MERCHANT_ID` | your ID | Production, Preview, Development |
| `PAYFAST_MERCHANT_KEY` | your key | Production, Preview, Development |
| `PAYFAST_PASSPHRASE` | your passphrase | Production, Preview, Development |
| `PAYFAST_SANDBOX` | `true` | Preview, Development |
| `PAYFAST_SANDBOX` | `false` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://[your-vercel-url].vercel.app` | Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://kyalamistudio.co.za` | Production |
| `RESEND_API_KEY` | your key | Production, Preview, Development |
| `NEXT_PUBLIC_ADMIN_EMAIL` | admin email | Production, Preview, Development |

**Step 4 — Deploy:**
Click Deploy. First deploy may take 2–3 minutes.

**Step 5 — Add custom domain:**
Project Settings → Domains → Add `kyalamistudio.co.za`
Vercel will give you a CNAME record to add in Cloudflare.

#### Agents to Spawn

> **PASTE INTO CLAUDE CODE — Task 0.5 Vercel verification:**
> ```
> Use the @devops-agent to verify the Vercel deployment for Kyalami Studio.
> Confirm:
> 1. Build completed with zero errors in the Vercel dashboard
> 2. All NEXT_PUBLIC_ variables are set for Production, Preview, and Development environments
> 3. SUPABASE_SERVICE_ROLE_KEY, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, and RESEND_API_KEY are set as server-only (not NEXT_PUBLIC_)
> 4. PAYFAST_SANDBOX is 'true' for Preview/Development and 'false' for Production
> 5. NEXT_PUBLIC_SITE_URL is set correctly for each environment
> 6. Custom domain kyalamistudio.co.za is added in Vercel project domains
> If any env var is missing or misconfigured, list exactly which ones and what the correct value should be.
> ```

#### Done When
- [ ] Vercel deployment succeeds (no build errors)
- [ ] Site loads on Vercel auto-generated URL
- [ ] All environment variables are added to Vercel
- [ ] Custom domain added in Vercel (DNS step follows in Task 0.6)

---

### Task 0.6 — Configure Cloudflare DNS
**BRANCH:** No code changes — infrastructure only
**PRODUCES:** Domain resolving to Vercel with HTTPS

#### Steps

**Step 1 — In Cloudflare, add the CNAME record Vercel gave you:**
- Type: `CNAME`
- Name: `@` (or `kyalamistudio.co.za`)
- Target: the value Vercel gave you (usually `cname.vercel-dns.com`)
- Proxy status: **DNS only (grey cloud)** — not proxied. Vercel handles SSL, not Cloudflare.

**Step 2 — Wait for SSL to provision:**
In Vercel → Project → Domains — wait until the domain shows a green checkmark. Usually under 5 minutes.

**Step 3 — Verify:**
Navigate to `https://kyalamistudio.co.za` in your browser. Should show the site with a valid SSL certificate.

#### Agents to Spawn
```
Use the @devops-agent to verify the Cloudflare and Vercel DNS configuration.
Confirm:
1. CNAME record is correctly set to DNS-only (not proxied)
2. SSL certificate is provisioned in Vercel
3. Domain resolves correctly (no redirect loops)
4. www subdomain redirects to root (or is correctly handled)
```

#### Done When
- [ ] `https://kyalamistudio.co.za` loads the site
- [ ] SSL certificate is valid (green padlock in browser)
- [ ] No redirect loops

---

### Task 0.7 — Health API and Vercel Cron
**BRANCH:** `feature/phase-0-health`
**PRODUCES:** `/api/health` route, `vercel.json` with cron schedule

#### Steps

**Step 1 — Use the skill to scaffold the route:**

Invoke in Claude Code:
```
/add-api-route health
```

**Step 2 — Implement the health check:**

> **PASTE INTO CLAUDE CODE — Task 0.7 Step 2: Implement health route:**
> ```
> Implement src/app/api/health/route.ts for Kyalami Studio.
>
> Requirements:
> - Named export: GET function with explicit return type Promise<NextResponse>
> - Import createServerClient from @/lib/supabase/server
> - Import NextResponse from next/server
> - Await createServerClient() to get the Supabase client
> - Query: supabase.from('site_content').select('id').limit(1)
> - If error: return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
> - If OK: return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
> - No console.log — use console.error only if there is an error
> - No any types
> - Follow api.md rules
> ```

**Step 3 — Create `vercel.json` in the project root:**
```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Step 4 — Test locally:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 0.7 review:**
> ```
> Spawn @code-reviewer and @qa-unit in parallel.
>
> @code-reviewer: Review src/app/api/health/route.ts and vercel.json.
> Confirm: GET function has explicit Promise<NextResponse> return type, createServerClient is awaited correctly, error path returns 500 with message, success path returns 200 with timestamp, no console.log in production code, vercel.json cron schedule is valid.
>
> @qa-unit: Generate and run a unit test for the health API route.
> Test 1: Supabase returns data successfully — expect 200 response with status 'ok' and a timestamp string.
> Test 2: Supabase returns an error — expect 500 response with status 'error' and message field.
> The Supabase client must be mocked — never make real database calls in tests (see testing.md).
> ```

#### Build Check
```bash
npm run build && npm run type-check
```

#### Commit
```bash
git add src/app/api/health/route.ts vercel.json
git commit -m "feat: add /api/health keep-alive route and Vercel cron"
```

#### Done When
- [ ] `GET /api/health` returns `{"status":"ok"}` locally
- [ ] `vercel.json` is committed and pushed
- [ ] Vercel cron job is visible in Vercel dashboard → Cron Jobs after deploy

---

### Phase 0 Sign-off Checklist

Before merging to `main` and moving to Phase 1, verify every item:

- [ ] `npm run dev` starts without errors locally
- [ ] `npm run build` passes with zero errors
- [ ] `npm run type-check` passes with zero TypeScript errors
- [ ] All 6 Supabase tables exist with RLS enabled (confirmed via `@supabase-agent`)
- [ ] Seed data present in `pricing`, `add_ons`, `site_content` tables
- [ ] 4 admin users exist in Supabase Auth
- [ ] Vercel deployment is live and successful
- [ ] Custom domain resolves with HTTPS
- [ ] `/api/health` returns 200 on production URL
- [ ] `.env.local` is NOT committed to git
- [ ] Vercel Cron job visible in dashboard

Update `BUILD_STATUS.md` then commit:
```bash
git add BUILD_STATUS.md
git commit -m "chore: Phase 0 complete — foundation ready"
git checkout staging && git merge main && git push origin staging
git checkout main && git push origin main
```

---

## PHASE 1 — Public Site UI
**Day 2 · Wednesday 23 April 2026**
**Goal: All public sections built, matching the design reference, mobile-first, data live from Supabase.**

Reference for every component in this phase: `design-rules.md`

---

### Task 1.1 — Root Layout and Global Styles
**BRANCH:** `feature/phase-1-layout`
**PRODUCES:** `src/app/layout.tsx`, `src/app/globals.css`

#### Steps

**Step 1 — Read both reference files:**
```
Read design-rules.md and technical-defaults.md before writing any layout or CSS.
```

**Step 2 — Finalise `src/app/layout.tsx`:**

> **PASTE INTO CLAUDE CODE — Task 1.1 Step 2: Finalise root layout:**
> ```
> Read design-rules.md before making any changes.
>
> Update src/app/layout.tsx with the following:
>
> Fonts — import from 'next/font/google':
>   Fraunces: subsets ['latin'], weight ['300','400'], variable '--font-display'
>   Inter: subsets ['latin'], weight ['400','500'], variable '--font-body'
>   IBM_Plex_Mono: subsets ['latin'], weight ['400'], variable '--font-mono'
>
> Apply all three font variables to the <html> className alongside lang="en".
> Set <body> className to: 'bg-brand-cream text-brand-charcoal font-body antialiased min-h-screen'
>
> Metadata export (typed as Metadata from 'next'):
>   title: { template: '%s | Kyalami Studio', default: 'Kyalami Studio — Show up and shoot' }
>   description: 'Professional content creation studio in Kyalami Estates, Johannesburg. Book your session online.'
>   openGraph: { title, description, locale: 'en_ZA', type: 'website' }
>   robots: { index: true, follow: true }
>
> Layout must be a Server Component (no 'use client').
> No hardcoded hex colours. No custom CSS class names. Tailwind utilities only.
> ```

**Step 3 — Finalise `src/app/globals.css`:**

> **PASTE INTO CLAUDE CODE — Task 1.1 Step 3: Finalise global CSS:**
> ```
> Update src/app/globals.css.
>
> Contents must be exactly:
> 1. The Tailwind import directive
> 2. A :root block with CSS custom properties for each brand token:
>    --brand-charcoal: #1C1C1C
>    --brand-cream: #F5F0E8
>    --brand-gold: #C9A84C
>    --brand-warm-grey: #9E9E9E
> 3. No other CSS rules. No custom class names. No hardcoded colours in components.
>
> All visual styling is done with Tailwind utilities referencing the brand tokens defined in tailwind.config.ts.
> ```

#### Agents to Spawn

> **PASTE INTO CLAUDE CODE — Task 1.1 review:**
> ```
> Use the @code-reviewer agent to review src/app/layout.tsx and src/app/globals.css.
> Confirm:
> - Fonts loaded via next/font/google — NOT a <link> tag to Google Fonts CDN
> - All three font variables applied to the html element className
> - Metadata exported with correct Metadata type from 'next'
> - Body has bg-brand-cream, text-brand-charcoal, font-body set via Tailwind utilities
> - globals.css has no custom class names — only CSS variables in :root and Tailwind directive
> - No hardcoded hex values anywhere in component code
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: finalise root layout, fonts, and global brand styles"
```

---

### Task 1.2 — Hero Section
**BRANCH:** `feature/phase-1-hero`
**PRODUCES:** `src/components/public/Hero.tsx`

#### Steps

**Step 1 — Scaffold with the skill:**
```
/add-component Hero public
```

**Step 2 — Implement the component:**

> **PASTE INTO CLAUDE CODE — Task 1.2 Step 2: Implement Hero:**
> ```
> Read design-rules.md before implementing.
>
> Implement src/components/public/Hero.tsx.
>
> Requirements:
> - 'use client' NOT needed — this is a Server Component (no interactivity)
> - Default export: Hero() with no props
> - Full-viewport height: className uses min-h-screen
> - Background: relative positioned div with a studio placeholder image (use /images/hero-placeholder.jpg for now) via next/image with fill and object-cover
> - Dark overlay: absolute inset-0 div with bg-black/65 (the brand dark overlay)
> - All text is relative z-10 and centred on mobile, left-aligned on md: and above
> - Headline: <h1> using font-display (Fraunces) text-white, text-4xl md:text-6xl font-light: "Where your vision becomes reality"
> - Subtext: <p> using font-mono (IBM Plex Mono) text-brand-gold text-sm md:text-base: "Kyalami Estates, Johannesburg · Show up and shoot"
> - CTA: <a href="/booking"> styled as a button — border border-brand-gold text-white px-8 py-3 font-mono text-sm hover:bg-brand-gold hover:text-brand-charcoal transition-colors: "Book Your Session"
> - Mobile layout: flex flex-col items-center justify-center text-center gap-6 px-6
> - Desktop layout: md:items-start md:text-left md:px-24
> - No hardcoded colours. No custom class names. No console.log.
> ```

**Step 3 — Add to homepage:**

> **PASTE INTO CLAUDE CODE — Task 1.2 Step 3: Add Hero to homepage:**
> ```
> Create src/app/(public)/page.tsx if it doesn't exist yet.
>
> Import Hero from '@/components/public/Hero' and render it as the first element:
>
> export default function HomePage() {
>   return (
>     <>
>       <Hero />
>     </>
>   )
> }
>
> This is a Server Component. Do not add 'use client'.
> We will add the remaining sections in later tasks — just Hero for now.
> ```

#### Agents to Spawn (parallel — send in one message)

> **PASTE INTO CLAUDE CODE — Task 1.2 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review src/components/public/Hero.tsx.
> Confirm: no hardcoded hex colours (CSS vars and Tailwind brand tokens only), next/image used with fill and correct alt text, CTA links to /booking using <a> not <button>, component has no props, no 'use client' directive, Tailwind utilities only (no custom class names).
>
> @qa-unit: Generate and run a render test for Hero.tsx.
> Test 1: Hero renders without crashing.
> Test 2: An element with href='/booking' and text 'Book Your Session' is present.
> Test 3: The headline text 'Where your vision becomes reality' is in the document.
>
> @qa-visual: Screenshot http://localhost:3000 at 375px, 768px, and 1280px.
> Confirm: hero fills the full viewport height, text is legible over the dark overlay, CTA button is visible, no horizontal scroll at 375px, layout changes correctly from centred to left-aligned at the md breakpoint.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/components/public/Hero.tsx src/app/(public)/page.tsx
git commit -m "feat: Hero section — full-viewport with CTA"
```

---

### Task 1.3 — The Space Section (Gallery)
**BRANCH:** `feature/phase-1-gallery`
**PRODUCES:** `src/components/public/TheSpace.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-component TheSpace public
```

**Step 2 — Implement:**

> **PASTE INTO CLAUDE CODE — Task 1.3 Step 2: Implement TheSpace:**
> ```
> Read design-rules.md before implementing.
>
> Implement src/components/public/TheSpace.tsx.
>
> Props interface:
>   galleryImages: Array<{ id: string; url: string; alt_text: string; display_order: number }>
>   content: Record<string, string>
>
> Requirements:
> - Server Component (no 'use client')
> - Section heading <h2>: font-display text-brand-charcoal text-3xl md:text-5xl font-light: "The Space"
> - Description paragraph: content['space_description'] — if missing, show a fallback string
> - Gallery grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
> - Each image: relative aspect-square container with next/image fill objectFit='cover', alt from alt_text
> - sizes prop on each image: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
> - Empty state: if galleryImages is empty or length 0, render 6 placeholder tiles with bg-brand-warm-grey/20 and the same aspect-square class
> - Section padding: py-24 px-6 md:px-24
> - No hardcoded colours. No custom class names. No console.log.
> ```

**Step 3 — Wire data at the page level:**

> **PASTE INTO CLAUDE CODE — Task 1.3 Step 3: Wire gallery data in page.tsx:**
> ```
> Update src/app/(public)/page.tsx to fetch gallery images server-side and pass them to TheSpace.
>
> Add at the top of the Server Component function:
>   import { createServerClient } from '@/lib/supabase/server'
>   import TheSpace from '@/components/public/TheSpace'
>
>   const supabase = await createServerClient()
>   const { data: galleryImages } = await supabase
>     .from('gallery_images')
>     .select('id, url, alt_text, display_order')
>     .order('display_order', { ascending: true })
>
> Pass to the component: <TheSpace galleryImages={galleryImages ?? []} content={{}} />
>
> We will wire the full content object in Task 1.7 when assembling the whole page.
> For now just pass an empty content object.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 1.3 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review src/components/public/TheSpace.tsx and the data fetch in src/app/(public)/page.tsx.
> Confirm: next/image has correct sizes prop, every image uses alt_text from the database (not hardcoded), empty state renders 6 placeholder tiles (not a crash), fetch is server-side in page.tsx (NOT a useEffect in the component), component is a Server Component.
>
> @qa-unit: Generate render tests for TheSpace.tsx.
> Test 1: galleryImages=[] — renders 6 placeholder tiles, no crash.
> Test 2: galleryImages=[{id:'1',url:'/test.jpg',alt_text:'Test',display_order:0}] — renders exactly 1 image element.
> Test 3: The section heading 'The Space' is present in the document.
>
> @qa-visual: Screenshot http://localhost:3000 at 375px, 768px, and 1280px.
> Confirm: gallery grid is 1-col at 375px, 2-col at 768px, 3-col at 1280px, images maintain aspect-square ratio, placeholder tiles show at correct size if no images.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/components/public/TheSpace.tsx src/app/(public)/page.tsx
git commit -m "feat: TheSpace gallery section with Supabase-sourced images"
```

---

### Task 1.4 — Pricing Section
**BRANCH:** `feature/phase-1-pricing`
**PRODUCES:** `src/components/public/Pricing.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-component Pricing public
```

**Step 2 — Implement:**

> **PASTE INTO CLAUDE CODE — Task 1.4 Step 2: Implement Pricing:**
> ```
> Read design-rules.md before implementing.
>
> Implement src/components/public/Pricing.tsx.
>
> Props interface:
>   pricing: Array<{ id: string; package_type: string; duration_type: string; is_weekday: boolean; price_rands: number }>
>
> Requirements:
> - 'use client' directive — this component has interactive toggles
> - State: isWeekday (boolean, default true), durationType (string, default 'hourly')
> - Section heading <h2>: font-display text-3xl md:text-5xl font-light: "Pricing"
> - Weekday/Weekend toggle: two buttons, active state has bg-brand-gold text-brand-charcoal, inactive has border border-brand-gold text-brand-gold
> - Duration tabs: Hourly | Half Day | Full Day — same active/inactive pattern
> - Two package cards side by side (stacked on mobile, side by side on md+):
>   Card 1: "Studio Only" — filter pricing where package_type='studio_only', duration_type=durationType, is_weekday=isWeekday
>   Card 2: "All-Inclusive" — same filter but package_type='all_inclusive'
> - Each card: card heading in font-display, price in font-mono text-brand-gold text-2xl, "Book This Package" <a href="/booking"> button
> - If no matching price row found: show "Contact for pricing"
> - Starting price caption below heading in font-mono text-brand-gold text-sm: compute the cheapest hourly weekday studio_only price from the pricing prop
> - Empty pricing array: render both cards with "Contact for pricing" — no crash
> - Section padding: py-24 px-6 md:px-24 bg-brand-charcoal text-white (dark section)
> - No hardcoded prices anywhere. All prices from the pricing prop.
> ```

**Step 3 — Wire data at page level:**

> **PASTE INTO CLAUDE CODE — Task 1.4 Step 3: Wire pricing data in page.tsx:**
> ```
> Update src/app/(public)/page.tsx to fetch all pricing rows and pass them to Pricing.
>
> Add to the server-side data fetches:
>   const { data: pricing } = await supabase.from('pricing').select('*')
>
> Import Pricing from '@/components/public/Pricing' and add to the JSX:
>   <Pricing pricing={pricing ?? []} />
>
> Add this below the TheSpace component in the render order.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 1.4 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review src/components/public/Pricing.tsx.
> Confirm: 'use client' is present (component has state), price filtering logic correctly matches all three fields (package_type, duration_type, is_weekday), starting price is computed from props not hardcoded, "Contact for pricing" shown when no matching row exists, no re-fetch of pricing data inside the component (must use the prop).
>
> @qa-unit: Generate tests for the price filtering logic.
> Test 1: isWeekday=true, durationType='hourly' — finds the correct studio_only and all_inclusive prices.
> Test 2: Toggle isWeekday to false — prices update to weekend values.
> Test 3: durationType='full_day' — prices update to full-day values.
> Test 4: pricing=[] — component renders without crashing, shows 'Contact for pricing'.
>
> @qa-visual: Screenshot http://localhost:3000 at 375px, 768px, and 1280px.
> Confirm: cards are stacked on mobile, side by side on desktop, toggle buttons are tap-target sized on mobile, dark section background is correct, prices are readable in gold.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/components/public/Pricing.tsx src/app/(public)/page.tsx
git commit -m "feat: Pricing section with live DB prices and weekday/weekend toggle"
```

---

### Task 1.5 — Equipment Add-ons Section
**BRANCH:** `feature/phase-1-equipment`
**PRODUCES:** `src/components/public/Equipment.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-component Equipment public
```

**Step 2 — Implement:**

> **PASTE INTO CLAUDE CODE — Task 1.5 Step 2: Implement Equipment:**
> ```
> Read design-rules.md before implementing.
>
> Implement src/components/public/Equipment.tsx.
>
> Props interface:
>   addOns: Array<{ id: string; name: string; description: string | null; price_rands: number; is_active: boolean }>
>
> Requirements:
> - Server Component (no 'use client')
> - Section heading <h2>: font-display text-3xl md:text-5xl font-light: "Equipment Add-ons"
> - Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
> - Each card: border border-brand-warm-grey/30 rounded-lg p-6 flex flex-col gap-3
>   - Name: font-display text-lg text-brand-charcoal
>   - Description: text-brand-warm-grey text-sm (if null, render nothing)
>   - Price: font-mono text-brand-gold text-xl: "R[price] / session"
> - Empty state: if addOns is empty, render a paragraph "Equipment packages available on request."
> - Section padding: py-24 px-6 md:px-24 bg-brand-cream
> - The is_active filter is done in the Supabase query (server-side), not in this component. Render all items passed in the prop.
> - No hardcoded colours. No custom class names. No console.log.
> ```

**Step 3 — Wire data at page level:**

> **PASTE INTO CLAUDE CODE — Task 1.5 Step 3: Wire add-ons data in page.tsx:**
> ```
> Update src/app/(public)/page.tsx to fetch active add-ons and pass them to Equipment.
>
> Add to the server-side data fetches:
>   const { data: addOns } = await supabase
>     .from('add_ons')
>     .select('id, name, description, price_rands, is_active')
>     .eq('is_active', true)
>
> Import Equipment from '@/components/public/Equipment' and add below Pricing in the JSX:
>   <Equipment addOns={addOns ?? []} />
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 1.5 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review src/components/public/Equipment.tsx.
> Confirm: is_active filter is in the Supabase query in page.tsx NOT in this component, empty state renders a paragraph not a crash, description is conditionally rendered (null-safe), price is formatted as 'R[amount] / session', component is a Server Component with no 'use client'.
>
> @qa-unit: Generate render tests.
> Test 1: addOns=[] — renders the empty state message, no crash.
> Test 2: addOns=[{id:'1',name:'Ring light',description:'Professional ring light',price_rands:150,is_active:true}] — renders the card with correct name and price.
> Test 3: add-on with description=null — renders card without crashing.
>
> @qa-visual: Screenshot http://localhost:3000 at 375px, 768px, and 1280px.
> Confirm: 1-col at 375px, 2-col at 768px, 4-col at 1280px, cards have consistent height, prices are gold.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/components/public/Equipment.tsx src/app/(public)/page.tsx
git commit -m "feat: Equipment add-ons section with live DB data"
```

---

### Task 1.6 — Amenities, FAQ, Footer, T&C
**BRANCH:** `feature/phase-1-content-sections`
**PRODUCES:** `Amenities.tsx`, `FAQ.tsx`, `Footer.tsx`, `TermsModal.tsx`

Build all four in sequence. Each follows the same 7-step workflow.

#### Amenities.tsx

Scaffold first: `/add-component Amenities public`

> **PASTE INTO CLAUDE CODE — Task 1.6: Implement Amenities:**
> ```
> Implement src/components/public/Amenities.tsx.
> Props: content: Record<string, string>
> - Server Component (no 'use client')
> - Parse content['amenities'] as JSON — wrap in try/catch, fallback to empty array
> - Section heading <h2> font-display text-3xl md:text-5xl font-light: "What's Included"
> - Grid: grid grid-cols-2 md:grid-cols-4 gap-4
> - Each item: flex items-center gap-2, span text-brand-gold "✓", then amenity text
> - Empty array: render section heading but no grid
> - Padding: py-24 px-6 md:px-24 bg-brand-cream
> - No hardcoded content. No custom class names. No any types.
> ```

#### FAQ.tsx

Scaffold first: `/add-component FAQ public`

> **PASTE INTO CLAUDE CODE — Task 1.6: Implement FAQ:**
> ```
> Implement src/components/public/FAQ.tsx.
> Props: content: Record<string, string>
> - Server Component (no 'use client')
> - Parse content['faq_items'] as JSON array of {question:string, answer:string} — try/catch, fallback []
> - Import Accordion, AccordionContent, AccordionItem, AccordionTrigger from '@/components/ui/accordion'
> - Section heading <h2> font-display text-3xl md:text-5xl font-light text-white: "Frequently Asked"
> - Accordion type="single" collapsible className="w-full max-w-3xl mx-auto"
> - Each item: AccordionItem value={`item-${index}`}, trigger shows question, content shows answer in text-brand-warm-grey
> - Empty array: render heading only, no accordion
> - Padding: py-24 px-6 md:px-24 bg-brand-charcoal text-white
> - No hardcoded FAQ content. No any types.
> ```

#### Footer.tsx

Scaffold first: `/add-component Footer public`

> **PASTE INTO CLAUDE CODE — Task 1.6: Implement Footer:**
> ```
> Implement src/components/public/Footer.tsx.
> Props: content: Record<string, string>
> - 'use client' — needs termsOpen state (boolean, default false)
> - Import TermsModal from '@/components/public/TermsModal'
> - bg-brand-charcoal text-white py-16 px-6 md:px-24
> - Three columns on md+ (flex flex-col md:flex-row gap-12 justify-between):
>   Col 1: "Kyalami Studio" font-display text-xl, tagline font-mono text-brand-gold text-sm "Show up and shoot"
>   Col 2: content['footer_address'] and content['footer_phone'] in font-mono text-sm, each on its own line
>   Col 3: <a href="/privacy" className="hover:text-brand-gold">Privacy Policy</a>, <button onClick={() => setTermsOpen(true)} className="hover:text-brand-gold">Terms & Conditions</button>
> - Bottom border-t border-brand-warm-grey/20 mt-12 pt-6: copyright "© {new Date().getFullYear()} Kyalami Studio. All rights reserved."
> - Render <TermsModal open={termsOpen} onOpenChange={setTermsOpen} content={content} /> at end
> - No hardcoded addresses. No any types.
> ```

#### TermsModal.tsx

Scaffold first: `/add-component TermsModal public`

> **PASTE INTO CLAUDE CODE — Task 1.6: Implement TermsModal:**
> ```
> Implement src/components/public/TermsModal.tsx.
> Props interface: { open: boolean; onOpenChange: (open: boolean) => void; content: Record<string, string> }
> - 'use client' directive
> - Import Dialog, DialogContent, DialogHeader, DialogTitle from '@/components/ui/dialog'
> - Dialog with open={open} onOpenChange={onOpenChange}
> - DialogContent: className="max-w-2xl max-h-[80vh] overflow-y-auto"
> - DialogHeader with DialogTitle font-display: "Terms & Conditions"
> - Body: <div className="whitespace-pre-wrap text-sm text-brand-warm-grey mt-4">{content['terms_conditions'] ?? 'Terms and conditions not yet available.'}</div>
> - No hardcoded T&C text. No any types. Named export only.
> ```

#### Agents to Spawn — run after all four are complete (parallel)

> **PASTE INTO CLAUDE CODE — Task 1.6 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review Amenities.tsx, FAQ.tsx, Footer.tsx, and TermsModal.tsx.
> Confirm: JSON.parse in Amenities and FAQ is wrapped in try/catch, FAQ uses shadcn Accordion correctly, Footer has 'use client' for state, TermsModal has overflow-y-auto for mobile scrolling, copyright year uses new Date().getFullYear(), no hardcoded copy in any component.
>
> @qa-unit: Generate render tests.
> Test 1: Amenities content['amenities']='["WiFi","Parking"]' — renders 2 items.
> Test 2: Amenities with malformed JSON — renders empty, no crash.
> Test 3: FAQ with faq_items=[] — renders no accordion items, no crash.
> Test 4: TermsModal open=true — DialogContent renders with T&C text.
> Test 5: TermsModal content['terms_conditions'] missing — renders fallback text.
>
> @qa-visual: Screenshot http://localhost:3000 at 375px, 768px, and 1280px.
> Confirm: amenities grid readable at all sizes, FAQ accordion opens/closes, footer columns stack on mobile, T&C modal is scrollable on mobile with close button visible.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/components/public/Amenities.tsx src/components/public/FAQ.tsx src/components/public/Footer.tsx src/components/public/TermsModal.tsx
git commit -m "feat: Amenities, FAQ, Footer, and T&C modal with live Supabase content"
```

---

### Task 1.7 — Assemble Homepage
**BRANCH:** `feature/phase-1-homepage`
**PRODUCES:** `src/app/(public)/page.tsx` complete

#### Steps

**Step 1 — Wire all data fetches and assemble the page:**

> **PASTE INTO CLAUDE CODE — Task 1.7 Step 1: Assemble homepage:**
> ```
> Rewrite src/app/(public)/page.tsx as the fully assembled homepage.
>
> This must be a Server Component (no 'use client'). Import all section components:
>   Hero, TheSpace, Pricing, Equipment, Amenities, FAQ, Footer from '@/components/public/*'
>   createServerClient from '@/lib/supabase/server'
>
> Fetch all data in parallel using Promise.all:
>   supabase.from('pricing').select('*')
>   supabase.from('add_ons').select('*').eq('is_active', true)
>   supabase.from('gallery_images').select('*').order('display_order', { ascending: true })
>   supabase.from('site_content').select('key, value')
>
> Transform site_content into a lookup: Object.fromEntries((siteContent ?? []).map(r => [r.key, r.value]))
>
> Render in this exact order:
>   <Hero />
>   <TheSpace galleryImages={galleryImages ?? []} content={content} />
>   <Pricing pricing={pricing ?? []} />
>   <Equipment addOns={addOns ?? []} />
>   <Amenities content={content} />
>   <div id="booking" className="text-center py-24 font-mono text-brand-gold">
>     Booking engine — coming in Phase 2
>   </div>
>   <FAQ content={content} />
>   <Footer content={content} />
>
> All null cases handled with ?? []. No sequential awaits — only Promise.all.
> ```

**Step 2 — Add page metadata:**

> **PASTE INTO CLAUDE CODE — Task 1.7 Step 2: Add homepage metadata:**
> ```
> Add a named metadata export to src/app/(public)/page.tsx above the default export:
>
> export const metadata = {
>   title: 'Kyalami Studio — Show up and shoot',
>   description: 'Professional content creation studio in Kyalami Estates, Johannesburg. Book your session online.',
>   openGraph: {
>     title: 'Kyalami Studio — Show up and shoot',
>     description: 'Professional content creation studio in Kyalami Estates, Johannesburg.',
>     locale: 'en_ZA',
>     type: 'website',
>   },
> }
>
> Import Metadata type from 'next' and type the export correctly.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 1.7 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review src/app/(public)/page.tsx.
> Confirm: Promise.all used for all 4 fetches (NOT sequential awaits), all data guarded with ?? [], site_content correctly transformed to a Record<string,string> object, metadata export is present and typed as Metadata, page is a Server Component with no 'use client', all 7 section components are rendered in correct order.
>
> @qa-unit: Generate a test that mocks all 4 Supabase queries and confirms the page renders without crashing when all data returns empty arrays. Mock createServerClient to return a chainable mock for from().select().eq().order().
>
> @qa-visual: Full page screenshot at 375px, 768px, and 1280px.
> Confirm: all sections render in correct visual order (Hero → TheSpace → Pricing → Equipment → Amenities → placeholder → FAQ → Footer), no section is missing, no horizontal scroll at 375px, dark/light sections alternate correctly.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(public)/page.tsx
git commit -m "feat: assemble homepage with all public sections and parallel data fetching"
```

---

### Phase 1 Sign-off Checklist

- [ ] All sections render at 375px (no horizontal scroll)
- [ ] All sections render at 768px and 1280px correctly
- [ ] Gallery images load from Supabase Storage
- [ ] Pricing section shows live data — change a price in Supabase, refresh, see the change
- [ ] FAQ accordion opens and closes
- [ ] T&C modal opens, is scrollable on mobile, and closes correctly
- [ ] `@qa-visual` agent passes all 3 breakpoints
- [ ] `npm run build` passes with zero errors
- [ ] Pushed to `staging` branch and reviewed on Vercel preview URL

```bash
git checkout staging && git merge feature/phase-1-homepage && git push origin staging
```

Update `BUILD_STATUS.md` and commit.

---

## PHASE 2 — Booking Engine + PayFast ITN
**Day 3 · Thursday 24 April 2026**
**Goal: Full booking flow — date selection → packages → payment → ITN confirmation. This is the most critical phase.**

---

### Task 2.1 — Domain Types and Zod Schemas
**BRANCH:** `feature/phase-2-types`
**PRODUCES:** `src/types/booking.ts`, `src/types/payfast.ts`, `src/lib/validations/booking.ts`, `src/lib/validations/itn.ts`

#### Steps

**Step 1 — Regenerate Supabase TypeScript types** (always do this before a new phase):
```bash
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] --schema public > src/types/database.ts
```

**Step 2 — Create domain types:**

`src/types/booking.ts`:
```typescript
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show'
export type PackageType = 'studio_only' | 'all_inclusive'
export type DurationType = 'hourly' | 'half_day' | 'full_day'

export interface TimeSlot {
  start: string  // HH:MM format
  end: string
  available: boolean
}

export interface BookingFormState {
  date: string | null
  timeSlot: TimeSlot | null
  packageType: PackageType | null
  durationType: DurationType | null
  addOnIds: string[]
  clientName: string
  clientEmail: string
  clientPhone: string
  shootType: string
  idDocumentFile: File | null
  bankHolderName: string
  bankName: string
  accountNumber: string
  branchCode: string
  termsAccepted: boolean
}
```

**Step 3 — Create Zod validation schemas:**

`src/lib/validations/booking.ts` — full booking submission schema with all fields validated
`src/lib/validations/itn.ts` — PayFast ITN payload schema

#### Agents to Spawn
```
Use the @code-reviewer agent to review src/types/booking.ts, src/types/payfast.ts, src/lib/validations/booking.ts, and src/lib/validations/itn.ts.
Confirm:
- No duplicate type definitions (Zod inference used: type X = z.infer<typeof XSchema>)
- All booking fields are present and correctly typed
- ITN schema covers all PayFast ITN fields including payment_status and m_payment_id
- No any types
```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/types/ src/lib/validations/
git commit -m "chore: booking and PayFast domain types + Zod validation schemas"
```

---

### Task 2.2 — Availability API
**BRANCH:** `feature/phase-2-availability`
**PRODUCES:** `src/app/api/availability/route.ts`

#### Steps

**Step 1 — Scaffold:**
```
/add-api-route availability
```

**Step 2 — Implement GET handler:**

> **PASTE INTO CLAUDE CODE — Task 2.2 Step 2: Implement availability API:**
> ```
> Implement src/app/api/availability/route.ts following api.md and security.md rules.
>
> Named export: GET(request: Request): Promise<NextResponse>
>
> Logic:
> 1. Read 'date' from URL search params. If missing or not matching /^\d{4}-\d{2}-\d{2}$/ → return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
> 2. Define studio operating hours constant: slots from 07:00 to 19:00 in 1-hour increments. Each slot: { start: 'HH:MM', end: 'HH:MM', available: true }
> 3. Use createServerClient (NOT admin) to query:
>    - bookings: select start_time, end_time where booking_date=date AND status IN ('pending','confirmed')
>    - blocked_dates: select id where start_date <= date AND end_date >= date
> 4. If any blocked_dates row found → mark ALL slots as available: false
> 5. Otherwise → for each booking row, mark any slot that overlaps the booking time as available: false
> 6. Return NextResponse.json({ date, slots: TimeSlot[] }, { status: 200 })
>
> Import TimeSlot type from '@/types/booking'.
> No service role key — this is a public endpoint using anon key with RLS.
> Explicit return type. No any types. No console.log.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 2.2 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @supabase-agent in parallel.
>
> @code-reviewer: Review src/app/api/availability/route.ts.
> Confirm: date regex validation rejects non-date strings, anon client used (not admin), response is typed correctly, all slot overlap logic is correct, explicit return type on GET.
>
> @qa-unit: Generate unit tests for the availability route. Mock the Supabase client.
> Test 1: Valid date, no bookings, no blocks → all slots available: true.
> Test 2: Valid date with a booking 09:00–10:00 → slot 09:00–10:00 is available: false, others true.
> Test 3: Date is fully blocked → all slots available: false.
> Test 4: date param missing → 400 response.
> Test 5: date param 'not-a-date' → 400 response.
>
> @supabase-agent: Review the Supabase queries in the availability route.
> Confirm: blocked_dates query correctly uses start_date <= date AND end_date >= date, booking overlap detection is logically sound, no raw SQL injection possible from the date param.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/api/availability/route.ts
git commit -m "feat: availability API — returns available time slots for a given date"
```

---

### Task 2.3 — PayFast Signature Utility
**BRANCH:** `feature/phase-2-payfast-signature`
**PRODUCES:** `src/lib/payfast/signature.ts`

#### Steps

**Step 1 — Use the skill:**
```
/payfast-webhook
```
This skill generates the signature utility file. Review the output carefully.

**Step 2 — Implement `src/lib/payfast/signature.ts`:**

> **PASTE INTO CLAUDE CODE — Task 2.3 Step 2: Implement PayFast signature:**
> ```
> Read payments.md and no-bad-patterns.md before implementing.
>
> Implement src/lib/payfast/signature.ts with these named exports:
>
> buildPayFastSignature(params: Record<string, string>, passphrase?: string): string
> - Remove the 'signature' key from params if present
> - Sort remaining keys alphabetically
> - Build query string: key=encodeURIComponent(value) joined with '&'
> - If passphrase is provided and not empty: append '&passphrase=' + encodeURIComponent(passphrase)
> - Return crypto MD5 hash of the resulting string as lowercase hex
> - Use the 'crypto' module from Node.js (import { createHash } from 'crypto')
> - NO float comparison anywhere in this file
>
> buildPayFastPayload(booking: BookingPayfastInput, signature: string): Record<string, string>
> - Accept a typed input object (create BookingPayfastInput interface in src/types/payfast.ts)
> - Return all PayFast required fields as string values
> - amount must be formatted with .toFixed(2) — string, not number
> - All env vars read from process.env — this is server-only code
>
> Follow no-bad-patterns.md: amount comparison must always use string toFixed(2), never float ===.
> No console.log. No any types. Named exports only.
> ```

#### Agents to Spawn (parallel — MANDATORY for any PayFast code)

> **PASTE INTO CLAUDE CODE — Task 2.3 review:**
> ```
> Spawn @payfast-agent, @code-reviewer, and @qa-unit in parallel.
>
> @payfast-agent: Review src/lib/payfast/signature.ts. This is payment-critical code.
> Verify: keys are sorted alphabetically before building the string, encodeURIComponent is used on values (not escape() or encodeURI()), passphrase is appended AFTER the other params with '&passphrase=', MD5 output is lowercase hex, no float comparison anywhere.
>
> @code-reviewer: Review src/lib/payfast/signature.ts and src/types/payfast.ts.
> Confirm: PAYFAST_PASSPHRASE read from process.env only (server-only), no console.log, no any types, named exports only (no default export), BookingPayfastInput interface is complete.
>
> @qa-unit: Generate unit tests for buildPayFastSignature().
> Test 1: Known params without passphrase → known MD5 output (compute expected manually).
> Test 2: Same params with passphrase → different known MD5 output.
> Test 3: 'signature' key in params is excluded from the hash input.
> Test 4: Keys are sorted before hashing (swap order of input, same output).
> These tests must all pass before any sandbox testing begins.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/lib/payfast/signature.ts
git commit -m "feat: PayFast MD5 signature builder with URL encoding and passphrase support"
```

---

### Task 2.4 — Bookings Creation API
**BRANCH:** `feature/phase-2-bookings-api`
**PRODUCES:** `src/app/api/bookings/route.ts`

#### Steps

**Step 1 — Scaffold:**
```
/add-api-route bookings
```

**Step 2 — Implement POST handler:**

> **PASTE INTO CLAUDE CODE — Task 2.4 Step 2: Implement bookings API:**
> ```
> Read payments.md, security.md, api.md, and no-bad-patterns.md before implementing.
>
> Implement src/app/api/bookings/route.ts.
> Named export: POST(request: Request): Promise<NextResponse>
>
> Steps in order:
> 1. Parse request.json() — wrap in try/catch, return 400 on parse error
> 2. Validate with BookingSchema from src/lib/validations/booking.ts
>    If invalid: return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 })
> 3. Re-verify slot availability: query bookings table for status IN ('pending','confirmed') on the requested date/time overlap. If conflict: return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
> 4. If ID document provided (base64 string): use createAdminClient() to upload to 'id-documents' bucket. Path: `${bookingId}/id-document`. Get public URL back.
> 5. Use createAdminClient() to INSERT into bookings with status='pending', payfast_payment_id=bookingId (the UUID we generate), deposit_amount=750, and all other fields from the validated payload.
> 6. Build PayFast payload object:
>    merchant_id: process.env.PAYFAST_MERCHANT_ID
>    merchant_key: process.env.PAYFAST_MERCHANT_KEY
>    return_url: process.env.NEXT_PUBLIC_SITE_URL + '/booking/confirmed'
>    cancel_url: process.env.NEXT_PUBLIC_SITE_URL + '/booking'
>    notify_url: process.env.NEXT_PUBLIC_SITE_URL + '/api/payfast/itn'
>    m_payment_id: booking.id (UUID)
>    amount: (subtotal + 750).toFixed(2) as string — this is the deposit + package price
>    item_name: 'Kyalami Studio — ' + packageType + ' ' + bookingDate
>    email_address: clientEmail
>    name_first: clientName.split(' ')[0]
>    name_last: clientName.split(' ').slice(1).join(' ')
> 7. Generate signature using buildPayFastSignature(payfastPayload, process.env.PAYFAST_PASSPHRASE)
> 8. Return NextResponse.json({ bookingId: booking.id, payfastUrl: 'https://sandbox.payfast.co.za/eng/process', payfastPayload: { ...payfastPayload, signature } }, { status: 201 })
>    Note: when PAYFAST_SANDBOX=false, use 'https://www.payfast.co.za/eng/process'
>
> All PayFast env vars server-only. No NEXT_PUBLIC_ for merchant credentials.
> No any types. No console.log. Explicit return type.
> ```

#### Agents to Spawn (parallel — MANDATORY)

> **PASTE INTO CLAUDE CODE — Task 2.4 review:**
> ```
> Spawn @payfast-agent, @code-reviewer, @qa-unit, and @supabase-agent in parallel.
>
> @payfast-agent: Review src/app/api/bookings/route.ts.
> Verify: notify_url points to /api/payfast/itn, amount includes deposit (subtotal + 750) formatted to exactly 2 decimal places as a string, m_payment_id is set to the booking UUID, PayFast URL switches between sandbox and production based on PAYFAST_SANDBOX env var.
>
> @code-reviewer: Review the bookings route.
> Confirm: Zod validation runs before any database write, ID document upload uses admin client (not anon), status is explicitly 'pending' in the INSERT, all PAYFAST_* vars are process.env (server-only, no NEXT_PUBLIC_), no any types, explicit return type.
>
> @qa-unit: Generate unit tests. Mock createAdminClient and buildPayFastSignature.
> Test 1: Valid payload → 201 with bookingId and payfastPayload.
> Test 2: Missing required field (clientName) → 400 with validation error.
> Test 3: Slot no longer available → 409.
> Test 4: Supabase INSERT error → 500 (do not expose raw error message to client).
>
> @supabase-agent: Review the Supabase operations.
> Confirm: availability re-check query correctly detects time overlaps, INSERT uses admin client, id-documents bucket path follows a consistent pattern (bookingId/filename), no raw user input used as bucket path without sanitisation.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/api/bookings/route.ts
git commit -m "feat: bookings API — creates pending booking and returns PayFast payload"
```

---

### Task 2.5 — PayFast ITN Handler
**BRANCH:** `feature/phase-2-itn`
**PRODUCES:** `src/app/api/payfast/itn/route.ts`, `src/lib/payfast/itn-handler.ts`

This is the most critical code in the entire project. Follow every step exactly.

#### Steps

**Step 1 — Use the skill:**
```
/payfast-webhook
```

**Step 2 — Implement following the exact ITN flow from CLAUDE.md:**

> **PASTE INTO CLAUDE CODE — Task 2.5 Step 2: Implement ITN handler:**
> ```
> Read payments.md, security.md, and no-bad-patterns.md before implementing.
>
> Implement two files:
>
> FILE 1: src/lib/payfast/itn-handler.ts
> Named export: handleITN(request: Request): Promise<Response>
>
> Implement in this EXACT order — no deviation allowed:
> Step 1: Get client IP from request headers (x-forwarded-for or x-real-ip). Check against whitelist:
>   ['41.74.179.194','41.74.179.195','41.74.179.196','41.74.179.197',
>    '196.33.227.224','196.33.227.225','196.33.227.226','196.33.227.227',
>    '196.33.227.228','196.33.227.229','196.33.227.230','196.33.227.231']
>   If not in whitelist: console.error('ITN: blocked IP', ip) then return new Response('OK', {status:200})
> Step 2: Parse request body as URL-encoded form (await request.text(), then URLSearchParams)
> Step 3: Validate with ITNPayloadSchema from src/lib/validations/itn.ts — if invalid: console.error then return 200
> Step 4: Rebuild signature using buildPayFastSignature() from signature.ts (exclude 'signature' field from params)
> Step 5: Compare rebuilt signature to received payload.signature — if mismatch: console.error then return 200
> Step 6: Check payload.payment_status === 'COMPLETE' — if not: console.error then return 200
> Step 7: Use createAdminClient() to fetch booking where payfast_payment_id = payload.m_payment_id AND status = 'pending' — if not found: console.error then return 200
> Step 8: Compare parseFloat(payload.amount_gross).toFixed(2) === booking.subtotal.toFixed(2) — if mismatch: console.error then return 200
> Step 9: UPDATE booking SET status='confirmed', payfast_amount_gross=amount WHERE id=booking.id AND status='pending'
> Step 10: Call sendConfirmationEmail() — wrap in try/catch — email failure must NOT prevent returning 200
> Step 11: Return new Response('OK', { status: 200 })
>
> FILE 2: src/app/api/payfast/itn/route.ts
> Named export: POST(request: Request): Promise<Response>
> Simply calls and returns handleITN(request)
> Add export const runtime = 'nodejs'
>
> CRITICAL: The handler must ALWAYS return 200. Never 4xx or 5xx.
> All failures are logged with console.error then 200 is returned.
> No any types. No sensitive data (keys, card numbers) in logs.
> ```

#### Agents to Spawn (ALL of them — parallel)

> **PASTE INTO CLAUDE CODE — Task 2.5 review (MANDATORY — do not skip):**
> ```
> Spawn @payfast-agent, @code-reviewer, @code-auditor, @qa-unit, and @supabase-agent in parallel. This is the most critical code in the project.
>
> @payfast-agent: Review src/app/api/payfast/itn/route.ts and src/lib/payfast/itn-handler.ts.
> Verify every step matches the ITN flow in CLAUDE.md in the correct order. Check: IP whitelist is checked FIRST before any parsing, signature comparison uses a rebuilt signature (not trusting the received one), amount comparison uses parseFloat().toFixed(2) string comparison (not float ===), handler always returns 200 (no 4xx or 5xx anywhere), passphrase is included in signature rebuild.
>
> @code-auditor: Adversarially audit the ITN handler. Specifically try to find:
> - Race condition: two simultaneous ITN calls for same booking — can booking confirm twice?
> - Signature bypass: can any input skip signature validation?
> - Amount manipulation: can a smaller payment confirm a larger booking?
> - Status attack: can a 'confirmed' booking be set back to 'pending' then re-confirmed?
> - IP spoofing: can X-Forwarded-For header be manipulated to bypass IP check?
> Report every finding with severity.
>
> @code-reviewer: Review both files for code quality. Confirm: explicit return types, no any types, every failure path uses console.error not console.log, no payment credentials or card data are logged, admin client used for DB writes.
>
> @qa-unit: Generate comprehensive unit tests for handleITN(). Mock Supabase and sendConfirmationEmail.
> Test 1: Valid ITN, whitelisted IP, correct signature, COMPLETE status, matching amount → booking confirmed, 200 returned.
> Test 2: Non-whitelisted IP → returns 200, booking NOT confirmed.
> Test 3: Invalid signature → returns 200, booking NOT confirmed.
> Test 4: payment_status='CANCELLED' → returns 200, booking NOT confirmed.
> Test 5: amount_gross mismatch → returns 200, booking NOT confirmed.
> Test 6: booking not found → returns 200, no crash.
> Test 7: booking already confirmed (status='confirmed') → returns 200, no error.
> Test 8: email fails to send → still returns 200, booking still confirmed.
>
> @supabase-agent: Review the Supabase UPDATE in the ITN handler.
> Confirm: admin client used, WHERE clause includes both id AND status='pending' (prevents confirming already-confirmed bookings), UPDATE is not a separate SELECT then UPDATE (must be atomic).
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/api/payfast/itn/route.ts src/lib/payfast/itn-handler.ts
git commit -m "feat: PayFast ITN handler with IP whitelist, signature verify, and booking confirmation"
```

---

### Task 2.6 — Confirmation Email
**BRANCH:** `feature/phase-2-email`
**PRODUCES:** `src/lib/resend/send-confirmation.ts`

#### Steps

**Step 1 — Scaffold the email template:**
```
/add-email-template booking-confirmation
```

**Step 2 — Implement `src/lib/resend/send-confirmation.ts`:**

> **PASTE INTO CLAUDE CODE — Task 2.6 Step 2: Implement confirmation email:**
> ```
> Implement src/lib/resend/send-confirmation.ts.
>
> Interface for input (create in same file or src/types/booking.ts):
>   interface ConfirmationEmailInput {
>     clientName: string
>     clientEmail: string
>     bookingDate: string
>     startTime: string
>     endTime: string
>     packageType: string
>     durationType: string
>     addOns: string[]
>     subtotal: number
>     depositAmount: number
>   }
>
> Named export: sendConfirmationEmail(input: ConfirmationEmailInput): Promise<{ success: boolean; error?: string }>
>
> Implementation:
> - Import Resend from 'resend'
> - Instantiate: new Resend(process.env.RESEND_API_KEY)
> - Build HTML email string with these sections:
>   - Heading: "Booking Confirmed — Kyalami Studio"
>   - Booking details: date, time (start–end), package, duration
>   - Add-ons list (if any)
>   - Total amount: R{subtotal.toFixed(2)}
>   - Deposit note: "R{depositAmount.toFixed(2)} refundable deposit included"
>   - Contact: footer_address and footer_phone from site_content (hardcode placeholders for now)
> - from: 'Kyalami Studio <bookings@kyalamistudio.co.za>' (replace with verified Resend domain)
> - to: input.clientEmail
> - subject: `Booking Confirmed — ${input.bookingDate} at ${input.startTime}`
> - All client data inserted into HTML must be HTML-escaped: replace & < > " ' with entities
> - On error: return { success: false, error: error.message }
> - On success: return { success: true }
> - This function must never throw — catch all errors internally
> - RESEND_API_KEY from process.env only — never exposed to client
> - No console.log. No any types. Named export only.
> ```

#### Agents to Spawn

> **PASTE INTO CLAUDE CODE — Task 2.6 review:**
> ```
> Use the @code-reviewer agent to review src/lib/resend/send-confirmation.ts.
> Confirm:
> - RESEND_API_KEY read from process.env (server-only, never NEXT_PUBLIC_)
> - from address uses a verified Resend sending domain (not a random address)
> - All client name, email, and booking data is HTML-escaped before inserting into the email body
> - Function returns { success: boolean, error?: string } — never throws
> - try/catch wraps the entire Resend send call
> - No console.log — use console.error on failures only
> - No any types
> - Named export only
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/lib/resend/send-confirmation.ts
git commit -m "feat: booking confirmation email via Resend"
```

---

### Task 2.7 — Booking Form Components
**BRANCH:** `feature/phase-2-booking-form`
**PRODUCES:** All booking form components in `src/components/public/booking/`

Build each component in sequence. Scaffold first, then implement.

#### DatePicker
```
/add-component DatePicker public
```
- Calendar UI showing available and unavailable dates
- On date selection: call `GET /api/availability?date=YYYY-MM-DD`
- Show loading state while fetching
- Disabled dates: past dates, blocked dates (marked unavailable by API)
- Highlight selected date

#### TimePicker
```
/add-component TimePicker public
```
- Shows available time slots returned from availability API
- Slot buttons: available = selectable, unavailable = disabled + strikethrough
- Shows the selected duration implied by `durationType`

#### PackageSelector
```
/add-component PackageSelector public
```
- Two cards: Studio Only vs All-Inclusive
- Duration radio buttons: Hourly / Half Day / Full Day
- Shows price for the selected combination
- Prices from `pricing` prop (passed down from BookingForm)

#### AddOnSelector

Scaffold: `/add-component AddOnSelector public`

> **PASTE INTO CLAUDE CODE — Task 2.7: Implement AddOnSelector:**
> ```
> Implement src/components/public/booking/AddOnSelector.tsx.
> Props: addOns: AddOnItem[], selectedIds: string[], onChange: (ids: string[]) => void
> - 'use client'
> - Render each add-on as a checkbox card: name, description, price
> - Checked when id is in selectedIds
> - On change: call onChange with updated array (add or remove id)
> - Running subtotal displayed below: "Add-ons: R{total}"
> ```

#### ClientDetailsForm

Scaffold: `/add-component ClientDetailsForm public`

> **PASTE INTO CLAUDE CODE — Task 2.7: Implement ClientDetailsForm:**
> ```
> Implement src/components/public/booking/ClientDetailsForm.tsx.
> Props: value: ClientDetails, onChange: (v: ClientDetails) => void
> - 'use client'
> - Use React Hook Form with Zod resolver
> - Fields: clientName (text, required), clientEmail (email, required), clientPhone (tel, required), shootType (select: Commercial | YouTube | Corporate | Personal, required)
> - ID document: <input type="file" accept="image/*,.pdf"> — on change store File in state and call onChange with the file
> - shadcn Input, Label, Select components
> - Show validation errors inline under each field
> - Call onChange prop whenever form values change (use watch())
> ```

#### BankingDetailsForm

Scaffold: `/add-component BankingDetailsForm public`

> **PASTE INTO CLAUDE CODE — Task 2.7: Implement BankingDetailsForm:**
> ```
> Implement src/components/public/booking/BankingDetailsForm.tsx.
> Props: value: BankingDetails, onChange: (v: BankingDetails) => void
> - 'use client'
> - Use React Hook Form with Zod resolver
> - Fields: bankHolderName (text, required), bankName (select: FNB | Standard Bank | Nedbank | Absa | Capitec | TymeBank, required), accountNumber (text, required, digits only), branchCode (text, required)
> - Show validation errors inline
> - Note text: "Banking details are required for your refundable R750 deposit"
> - Call onChange whenever values change
> ```

#### PaymentSummary

Scaffold: `/add-component PaymentSummary public`

> **PASTE INTO CLAUDE CODE — Task 2.7: Implement PaymentSummary:**
> ```
> Implement src/components/public/booking/PaymentSummary.tsx.
> Props: packagePrice: number, addOnsTotal: number, termsAccepted: boolean, onTermsChange: (v: boolean) => void, onSubmit: () => void, isSubmitting: boolean
> - 'use client'
> - Display breakdown:
>   Package: R{packagePrice.toFixed(2)}
>   Add-ons: R{addOnsTotal.toFixed(2)}
>   Deposit (refundable): R750.00
>   TOTAL: R{(packagePrice + addOnsTotal + 750).toFixed(2)} in font-mono text-brand-gold text-2xl
> - T&C checkbox: <input type="checkbox"> checked={termsAccepted} onChange label: "I agree to the Terms & Conditions"
> - Submit button: disabled when !termsAccepted || isSubmitting
>   Text: isSubmitting ? 'Processing...' : 'Proceed to Payment'
>   Style: bg-brand-gold text-brand-charcoal disabled:opacity-50
> - R750 deposit is ALWAYS in the total. It is never optional or configurable.
> ```

#### BookingForm (Master Component)

Scaffold: `/add-component BookingForm public`

> **PASTE INTO CLAUDE CODE — Task 2.7: Implement BookingForm:**
> ```
> Implement src/components/public/booking/BookingForm.tsx.
> Props: pricing: PricingRow[], addOns: AddOnItem[]
> - 'use client'
> - Steps: 1=Date, 2=Package, 3=Details, 4=Payment (use step: number in useState, default 1)
> - State follows BookingFormState interface from src/types/booking.ts
> - Progress bar: 4 steps shown at top, current step highlighted in brand-gold
>
> Step 1: Render <DatePicker> and <TimePicker>. Next button enabled when date and timeSlot are set.
> Step 2: Render <PackageSelector pricing={pricing}>. Next when packageType and durationType set.
> Step 3: Render <AddOnSelector addOns={addOns}> + <ClientDetailsForm> + <BankingDetailsForm>. Next when all required fields valid.
> Step 4: Render <PaymentSummary> with calculated totals.
>
> Total calculation:
>   packagePrice = find in pricing where package_type, duration_type, is_weekday match selected values
>   addOnsTotal = sum of price_rands for selected add-on IDs
>   total = packagePrice + addOnsTotal + 750 (deposit always fixed)
>
> On PaymentSummary submit:
>   1. Set isSubmitting = true
>   2. POST to /api/bookings with full booking state (use fetch, not a library)
>   3. If response OK: receive { bookingId, payfastUrl, payfastPayload }
>   4. Create a <form> element dynamically: action=payfastUrl method="POST"
>   5. For each key in payfastPayload: create <input type="hidden" name=key value=value>
>   6. Append form to document.body, call form.submit()
>   7. If error: set isSubmitting=false, show error message inline
>
> This form submit causes a full browser redirect to PayFast. It must NOT use fetch for the PayFast redirect.
> No any types. No console.log.
> ```

#### Agents to Spawn — after all booking components are complete (parallel)

> **PASTE INTO CLAUDE CODE — Task 2.7 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @qa-visual in parallel.
>
> @code-reviewer: Review all files in src/components/public/booking/.
> Confirm: BookingForm manages step progression correctly (no skipping steps), all sub-components are pure (props in, callbacks out — no internal fetches), PayFast submission uses a dynamically created HTML form that is submitted (NOT fetch to PayFast URL), R750 deposit is hardcoded in PaymentSummary and BookingForm total calculation (never user-configurable), T&C checkbox must be true before submit button is enabled, no any types.
>
> @qa-unit: Generate tests for BookingForm.
> Test 1: Step 1 renders DatePicker, next button disabled until date and timeSlot set.
> Test 2: Total calculation: packagePrice=850, addOnsTotal=150, deposit=750 → total=1750.
> Test 3: Submit is blocked when termsAccepted=false.
> Test 4: On submit, fetch is called with correct endpoint /api/bookings.
> Test 5: After successful API response, a form is created and submitted to payfastUrl.
>
> @qa-visual: Screenshot http://localhost:3000/booking at 375px, 768px, and 1280px.
> Confirm: progress indicator is visible at all breakpoints, step 1 renders correctly, form is usable on mobile (no horizontal scroll), inputs are large enough for touch at 375px.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/components/public/booking/
git commit -m "feat: multi-step booking form with date, package, details, and PayFast submit"
```

---

### Task 2.8 — Booking Page and Confirmation Page
**BRANCH:** `feature/phase-2-booking-pages`
**PRODUCES:** `src/app/(public)/booking/page.tsx`, `src/app/(public)/booking/confirmed/page.tsx`

#### Booking Page

Scaffold: `/add-route booking public`

> **PASTE INTO CLAUDE CODE — Task 2.8: Implement booking page:**
> ```
> Implement src/app/(public)/booking/page.tsx.
>
> This is a Server Component. It fetches data and passes it to BookingForm.
>
> Data to fetch using createServerClient:
>   const { data: pricing } = await supabase.from('pricing').select('*')
>   const { data: addOns } = await supabase.from('add_ons').select('*').eq('is_active', true)
>
> Import BookingForm from '@/components/public/booking/BookingForm'
>
> Render:
>   <main className="min-h-screen bg-brand-cream py-24 px-6 md:px-24">
>     <h1 className="font-display text-4xl md:text-5xl font-light text-brand-charcoal mb-12">Book Your Session</h1>
>     <BookingForm pricing={pricing ?? []} addOns={addOns ?? []} />
>   </main>
>
> Add metadata export:
>   title: 'Book Your Session'
>   description: 'Book your Kyalami Studio session online. Select your date, package, and add-ons.'
>
> No 'use client'. No inline fetches.
> ```

#### Confirmation Page

Scaffold: `/add-route booking/confirmed public`

> **PASTE INTO CLAUDE CODE — Task 2.8: Implement confirmation page:**
> ```
> Read no-bad-patterns.md before implementing (searchParams must be awaited in Next.js 15).
>
> Implement src/app/(public)/booking/confirmed/page.tsx.
>
> This is a Server Component.
> Props: { searchParams: Promise<{ m_payment_id?: string }> }
>
> Steps:
> 1. const params = await searchParams (MUST await — Next.js 15 requirement)
> 2. const paymentId = params.m_payment_id
> 3. If no paymentId: render error state "Booking not found. Please contact us."
> 4. Use createServerClient (NOT admin) to fetch: supabase.from('bookings').select('*').eq('payfast_payment_id', paymentId).single()
> 5. If not found (no data): render error state
> 6. If data.status === 'confirmed': render full confirmation UI with:
>    - "Booking Confirmed" heading in font-display
>    - Date, time, package, add-ons summary
>    - Total paid, deposit note
>    - "We look forward to your shoot" message
>    - Contact details
> 7. If data.status === 'pending': render processing state:
>    - "Payment Processing" heading
>    - "Your payment is being confirmed. This page will refresh automatically."
>    - <meta http-equiv="refresh" content="5"> in the <head> via Next.js metadata or inline script
>    - Do NOT show any booking details until status is confirmed
>
> CRITICAL: This page must NEVER write to the database. Read only. Status confirmation happens in the ITN handler.
> No any types. searchParams must be awaited.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 2.8 review:**
> ```
> Spawn @code-reviewer and @qa-unit in parallel.
>
> @code-reviewer: Review src/app/(public)/booking/page.tsx and src/app/(public)/booking/confirmed/page.tsx.
> Confirm: searchParams is awaited with const params = await searchParams (Next.js 15 — see no-bad-patterns.md), confirmation page has ZERO database writes (read only), pending state shows processing message NOT booking details, auto-refresh is present for pending state, both pages have metadata exports.
>
> @qa-unit: Generate tests for the confirmed page.
> Test 1: paymentId present, booking status='confirmed' → renders confirmation heading and booking details.
> Test 2: paymentId present, booking status='pending' → renders processing message, NOT booking details.
> Test 3: paymentId missing → renders error state with contact info.
> Test 4: Supabase returns no booking for paymentId → renders error state.
> Mock createServerClient for all tests.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(public)/booking/
git commit -m "feat: booking page and payment confirmation page"
```

---

### Task 2.9 — End-to-End Sandbox Test
**BRANCH:** Testing on `feature/phase-2-booking-form` (no new code)

#### Steps

**Step 1 — Set up local tunnel for ITN testing:**
```bash
npx localtunnel --port 3000
```
Note the tunnel URL (e.g. `https://abc123.loca.lt`).

**Step 2 — Update `.env.local`:**
```bash
NEXT_PUBLIC_SITE_URL=https://abc123.loca.lt
```
Restart `npm run dev`.

**Step 3 — Complete a full booking flow:**
1. Go to `http://localhost:3000/booking`
2. Select tomorrow's date
3. Select a time slot
4. Choose Studio Only, Hourly
5. Select one add-on
6. Fill in client details (use your real email for the confirmation test)
7. Fill in banking details
8. Accept T&C
9. Click "Proceed to Payment"
10. On PayFast sandbox page: use test card (details at https://payfast.io/documentation/sandbox/)
11. Complete payment

**Step 4 — Verify the ITN flow worked:**
- Check your terminal — should see ITN POST arriving from PayFast
- Check Supabase dashboard → bookings table — booking status should be `'confirmed'`
- Check your email — confirmation email should arrive

**Step 5 — Restore `.env.local`:**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Agents to Spawn if anything fails
```
Use the @payfast-agent to diagnose [describe the specific error].
```

#### Done When
- [ ] Booking status changes from `pending` to `confirmed` in Supabase after sandbox payment
- [ ] Confirmation email arrives at the test email address
- [ ] `/booking/confirmed` page shows correct booking details after payment

---

### Phase 2 Sign-off Checklist

- [ ] Availability calendar shows blocked and available dates correctly
- [ ] Full booking flow completes end-to-end: date → slots → package → add-ons → client details → banking → PayFast
- [ ] PayFast sandbox payment triggers ITN and booking confirms
- [ ] Confirmation email received
- [ ] Double-booking attempt correctly rejected (409 response)
- [ ] R750 deposit always in total (never missing)
- [ ] `@qa-unit` — all signature, ITN, and booking tests pass
- [ ] `@code-auditor` — no Critical or High issues on the ITN handler
- [ ] `npm run build` passes with zero errors
- [ ] Pushed to `staging` branch, reviewed on Vercel preview URL

```bash
git checkout staging && git merge feature/phase-2-booking-pages && git push origin staging
```

Update `BUILD_STATUS.md` and commit.

---

## PHASE 3 — Admin Dashboard
**Day 4 · Friday 25 April 2026**
**Goal: All admin screens working. Auth protected. Pricing and content editable. Bookings manageable.**

**Start this phase with:**
```
/audit
```
Review and address any Critical or High findings before building Phase 3.

---

### Task 3.1 — Admin Auth Layout and Login
**BRANCH:** `feature/phase-3-auth`
**PRODUCES:** `src/app/(admin)/layout.tsx`, `src/app/(admin)/login/page.tsx`

#### Steps

**Step 1 — Admin layout (auth guard):**

> **PASTE INTO CLAUDE CODE — Task 3.1 Step 1: Implement admin layout:**
> ```
> Read security.md before implementing.
>
> Implement src/app/(admin)/layout.tsx as a Server Component.
>
> Requirements:
> - Import redirect from 'next/navigation', createServerClient from '@/lib/supabase/server'
> - Call supabase.auth.getUser() — NOT getSession() (getSession can be spoofed from cookies)
> - If no user: redirect('/login') — server-side, not client-side router.push
> - Admin sidebar nav links: Dashboard (/dashboard), Bookings (/dashboard/bookings), Pricing (/dashboard/pricing), Gallery (/dashboard/gallery), Content (/dashboard/content)
> - Sidebar: bg-brand-charcoal text-white, fixed left, h-screen w-64 on desktop, hidden on mobile with hamburger menu
> - Active link: text-brand-gold
> - Sign out button: calls supabase.auth.signOut() then redirect('/login')
> - Main content area: ml-64 on desktop, p-8
> - No 'use client' on the layout itself — sidebar nav can be a separate Client Component
> ```

**Step 2 — Login page:**

Scaffold: `/add-route login admin`

> **PASTE INTO CLAUDE CODE — Task 3.1 Step 2: Implement login page:**
> ```
> Implement src/app/(admin)/login/page.tsx.
>
> Requirements:
> - 'use client' — needs form state and router
> - Use React Hook Form with Zod: z.object({ email: z.string().email(), password: z.string().min(1) })
> - Import createClient from '@/lib/supabase/client' (browser client)
> - On submit: await supabase.auth.signInWithPassword({ email, password })
> - On success: router.push('/dashboard')
> - On error: setError to the error.message from Supabase, display inline below the form (never alert())
> - Layout: full-screen centred, bg-brand-charcoal, white text
> - Studio name "Kyalami Studio" in font-display above the form
> - shadcn Input and Button components
> - Submit button text: isSubmitting ? 'Signing in...' : 'Sign In'
> - No 'forgot password' link needed (admin-only, 4 users)
> - Add metadata export: title: 'Admin Login'
> ```

#### Agents to Spawn (parallel — security critical)

> **PASTE INTO CLAUDE CODE — Task 3.1 review:**
> ```
> Spawn @code-reviewer, @code-auditor, and @qa-unit in parallel.
>
> @code-reviewer: Review src/app/(admin)/layout.tsx and src/app/(admin)/login/page.tsx.
> Confirm: layout uses getUser() NOT getSession(), redirect in layout is the Next.js server-side redirect (import from 'next/navigation'), layout is a Server Component (no 'use client'), login uses browser client (not server client), error is shown inline (never alert()), password field is type="password".
>
> @code-auditor: Adversarially test the auth guard.
> Verify: Can you access /dashboard without being logged in? (Should redirect to /login)
> Can you access /dashboard/bookings directly without auth? (Should redirect)
> Is there any client-side-only auth check that could be bypassed by disabling JS?
> Can you log in with an empty password?
>
> @qa-unit: Generate tests.
> Test 1: AdminLayout with no user → redirect('/login') is called.
> Test 2: AdminLayout with authenticated user → children rendered.
> Test 3: Login form submit with valid credentials → router.push('/dashboard') called.
> Test 4: Login form submit with invalid credentials → error message shown, no redirect.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(admin)/layout.tsx src/app/(admin)/login/page.tsx
git commit -m "feat: admin auth layout with server-side guard and login page"
```

---

### Task 3.2 — Bookings Management
**BRANCH:** `feature/phase-3-bookings`
**PRODUCES:** `src/app/(admin)/dashboard/bookings/page.tsx`, `src/components/admin/BookingsTable.tsx`, `src/components/admin/BookingDetailModal.tsx`

#### Steps

**Step 1 — Scaffold components:**
```
/add-component BookingsTable admin
/add-component BookingDetailModal admin
/add-route dashboard/bookings admin
```

**Step 2 — BookingsTable:**

> **PASTE INTO CLAUDE CODE — Task 3.2 Step 2: Implement BookingsTable:**
> ```
> Implement src/components/admin/BookingsTable.tsx.
> Props: bookings: BookingRow[], onSelect: (booking: BookingRow) => void
> - 'use client'
> - Status filter tabs at top: All | Confirmed | Pending | Cancelled | No-show
>   Client-side filter on the bookings prop — no re-fetch
> - Table columns: Date (formatted DD MMM YYYY), Time (start_time–end_time), Client Name, Package, Total (R{subtotal.toFixed(2)}), Status (Badge)
> - Status badge colours: confirmed=green, pending=yellow, cancelled=red, no_show=grey
> - Each row: cursor-pointer hover:bg-brand-cream, onClick calls onSelect(booking)
> - Empty state: "No bookings found" centred text
> - No any types
> ```

**Step 3 — BookingDetailModal:**

> **PASTE INTO CLAUDE CODE — Task 3.2 Step 3: Implement BookingDetailModal:**
> ```
> Implement src/components/admin/BookingDetailModal.tsx.
> Props: booking: BookingRow | null, open: boolean, onOpenChange: (open: boolean) => void, onStatusChange: (id: string, status: string) => void
> - 'use client'
> - shadcn Dialog, DialogContent, DialogHeader, DialogTitle
> - Sections inside:
>   1. Client Details: name, email, phone, shoot_type
>   2. Booking Details: date, start_time, end_time, package_type, duration_type, add_ons (parse JSON array)
>   3. Payment: subtotal, deposit_amount, payfast_payment_id
>   4. Banking Details (for deposit refund): bank_holder_name, bank_name, account_number, branch_code
>   5. ID Document: "Download ID Document" button — on click: fetch GET /api/admin/bookings/[id]/id-document to get a signed URL, then open in new tab. Never expose the raw Storage URL in the DOM.
>   6. Actions: "Mark No-show" button (yellow), "Cancel Booking" button (red) — both call onStatusChange after window.confirm()
> - If booking is null: render nothing (Dialog handles open=false)
> ```

**Step 4 — Create admin bookings API routes:**

Scaffold: `/add-api-route admin/bookings/[id]`

> **PASTE INTO CLAUDE CODE — Task 3.2 Step 4: Implement admin bookings API:**
> ```
> Create two API routes:
>
> 1. src/app/api/admin/bookings/[id]/route.ts
> Named export: PATCH(request, { params })
> - const { id } = await params (Next.js 15 — await params)
> - Verify admin: getUser() → if no user return 401
> - Parse body: { status }
> - Validate status is one of: 'no_show', 'cancelled' (no other values allowed)
> - Use createAdminClient() to UPDATE bookings SET status=status WHERE id=id
> - Return 200 on success
>
> 2. src/app/api/admin/bookings/[id]/id-document/route.ts
> Named export: GET(request, { params })
> - const { id } = await params
> - Verify admin: getUser() → if no user return 401
> - Use createAdminClient() to fetch booking: get id_document_url
> - If no url: return 404
> - Generate signed URL: supabase.storage.from('id-documents').createSignedUrl(path, 3600)
> - Return NextResponse.json({ signedUrl }) — 1 hour expiry
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 3.2 review:**
> ```
> Spawn @code-reviewer, @code-auditor, @qa-unit, and @supabase-agent in parallel.
>
> @code-reviewer: Review BookingsTable.tsx, BookingDetailModal.tsx, and all admin bookings API routes.
> Confirm: signed URL is generated via API (not in the component), signed URL expires in 3600 seconds, status PATCH only allows 'no_show' or 'cancelled' (not arbitrary strings), auth check on every API route, params is awaited (Next.js 15), no any types.
>
> @code-auditor: Adversarially test the bookings PATCH route.
> Can an unauthenticated user PATCH a booking status?
> Can the status be set to 'confirmed' via the PATCH (bypassing ITN)?
> Can a booking ID be enumerated to access other users' bookings?
>
> @qa-unit: Generate tests.
> Test 1: PATCH /api/admin/bookings/[id] with auth, status='cancelled' → 200.
> Test 2: PATCH without auth → 401.
> Test 3: PATCH with status='confirmed' → 400 (not in allowed list).
> Test 4: GET /api/admin/bookings/[id]/id-document with auth → returns signed URL.
> Test 5: GET id-document without auth → 401.
>
> @supabase-agent: Confirm admin client is used for the status UPDATE, signed URL generation uses createSignedUrl with 3600 expiry, and the id-document path extraction from id_document_url is correct.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(admin)/dashboard/bookings/ src/components/admin/BookingsTable.tsx src/components/admin/BookingDetailModal.tsx src/app/api/admin/
git commit -m "feat: admin bookings table with detail modal, status actions, and signed ID URLs"
```

---

### Task 3.3 — Pricing Editor
**BRANCH:** `feature/phase-3-pricing`
**PRODUCES:** `src/app/(admin)/dashboard/pricing/page.tsx`, `src/components/admin/PricingEditor.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-component PricingEditor admin
/add-route dashboard/pricing admin
```

**Step 2 — Implement PricingEditor:**

> **PASTE INTO CLAUDE CODE — Task 3.3 Step 2: Implement PricingEditor:**
> ```
> Implement src/components/admin/PricingEditor.tsx.
> Props: pricing: PricingRow[], addOns: AddOnItem[]
> - 'use client'
> - Group pricing rows by package_type. Show two sections: Studio Only, All-Inclusive
> - Each section: table with rows for each duration_type, columns for Weekday and Weekend prices
> - Each price cell: shows formatted "R{price}" — on click, replace with <input type="number" min="0" step="0.01"> pre-filled with current value
> - On blur or Enter: call PATCH /api/admin/pricing/[id] with { price_rands: newValue }
>   - Optimistic update: update local state immediately
>   - On API error: revert to original value and show error toast
> - Add-ons section below: list all add-ons with inline editable price and an Active/Inactive toggle (PATCH /api/admin/add-ons/[id])
> - No any types
> ```

**Step 3 — Create admin pricing API route:**

Scaffold: `/add-api-route admin/pricing/[id]`

> **PASTE INTO CLAUDE CODE — Task 3.3 Step 3: Implement pricing API:**
> ```
> Implement src/app/api/admin/pricing/[id]/route.ts.
> Named export: PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse>
>
> Steps:
> 1. Await params (Next.js 15 — see no-bad-patterns.md): const { id } = await params
> 2. Verify admin session: use createServerClient(), call supabase.auth.getUser(). If no user: return 401.
> 3. Parse request.json() to get { price_rands }
> 4. Validate: price_rands must be a number > 0. If not: return 400.
> 5. Use createAdminClient() to UPDATE pricing SET price_rands=price_rands WHERE id=id
> 6. Return 200 on success, 500 on DB error (do not expose raw error)
>
> Also create src/app/api/admin/add-ons/[id]/route.ts with same pattern for toggling is_active.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 3.3 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @supabase-agent in parallel.
>
> @code-reviewer: Review PricingEditor.tsx, src/app/api/admin/pricing/[id]/route.ts, src/app/api/admin/add-ons/[id]/route.ts.
> Confirm: auth check is on the API route (not just the UI), price validation rejects 0 and negative numbers, params is awaited in the route handler (Next.js 15), optimistic UI reverts on API error, no any types.
>
> @qa-unit: Test the pricing API route.
> Test 1: Authenticated user, valid price → 200.
> Test 2: Unauthenticated → 401.
> Test 3: price_rands = -50 → 400.
> Test 4: price_rands = 'abc' → 400.
>
> @supabase-agent: Confirm the pricing UPDATE uses admin client (RLS would block anon updates) and the WHERE clause uses the route param id correctly.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(admin)/dashboard/pricing/ src/components/admin/PricingEditor.tsx src/app/api/admin/pricing/
git commit -m "feat: admin pricing editor with inline edit and add-ons toggle"
```

---

### Task 3.4 — Gallery Manager
**BRANCH:** `feature/phase-3-gallery`
**PRODUCES:** `src/app/(admin)/dashboard/gallery/page.tsx`, `src/components/admin/GalleryManager.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-component GalleryManager admin
/add-route dashboard/gallery admin
```

**Step 2 — Implement:**

> **PASTE INTO CLAUDE CODE — Task 3.4 Step 2: Implement GalleryManager:**
> ```
> Implement src/components/admin/GalleryManager.tsx.
> Props: initialImages: GalleryImage[]
> - 'use client'
> - State: images (array of GalleryImage, initialised from prop)
> - Grid: same 3-col layout as public gallery, showing all images
> - Each image card: the image, an alt text input (inline editable, saves on blur via PATCH /api/admin/gallery/[id]), a delete button (with window.confirm() — on confirm: DELETE /api/admin/gallery/[id])
> - Upload section at top: <input type="file" accept="image/*" multiple onChange={handleUpload}>
>   handleUpload:
>   - Validate each file: must be image/*, must be < 5MB. Show error for invalid files.
>   - For each valid file: POST to /api/admin/gallery (multipart form) to upload to Supabase Storage gallery bucket and insert gallery_images row
>   - On success: add new image to local state
> - Drag to reorder: on drag end, PATCH /api/admin/gallery/reorder with new order array
> - No any types. No raw Storage URLs exposed in the DOM.
>
> Also implement the following API routes (scaffold each with /add-api-route):
> - POST /api/admin/gallery — upload file, insert row, return new image
> - PATCH /api/admin/gallery/[id] — update alt_text
> - DELETE /api/admin/gallery/[id] — remove from Storage + delete row
> - PATCH /api/admin/gallery/reorder — bulk update display_order
> All routes: verify admin session first, return 401 if not authenticated.
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 3.4 review:**
> ```
> Spawn @code-reviewer, @qa-unit, and @supabase-agent in parallel.
>
> @code-reviewer: Review GalleryManager.tsx and all gallery API routes.
> Confirm: file type validated before upload (image/* only), file size checked (reject >5MB), Storage upload uses admin client, DELETE removes from BOTH Storage AND gallery_images table (not just the table), auth check on every API route, no any types.
>
> @qa-unit: Generate tests.
> Test 1: Upload valid image → API called with file, new image added to state.
> Test 2: Upload >5MB file → error shown, no API call.
> Test 3: Upload non-image file → error shown, no API call.
> Test 4: DELETE /api/admin/gallery/[id] with auth → both Storage and DB operations called.
> Test 5: DELETE without auth → 401.
>
> @supabase-agent: Confirm gallery Storage bucket allows admin writes and public reads. Confirm the file path pattern for uploads is consistent (e.g. gallery/{uuid}.{ext}). Confirm delete removes the correct file path from Storage.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(admin)/dashboard/gallery/ src/components/admin/GalleryManager.tsx
git commit -m "feat: admin gallery manager with upload, reorder, delete, and alt text"
```

---

### Task 3.5 — Content Editor
**BRANCH:** `feature/phase-3-content`
**PRODUCES:** `src/app/(admin)/dashboard/content/page.tsx`, `src/components/admin/ContentEditor.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-component ContentEditor admin
/add-route dashboard/content admin
```

**Step 2 — Implement:**

> **PASTE INTO CLAUDE CODE — Task 3.5 Step 2: Implement ContentEditor:**
> ```
> Implement src/components/admin/ContentEditor.tsx.
> Props: initialContent: Record<string, string>
> - 'use client'
> - State: one useState per section, initialised from initialContent
>
> Section 1 — Amenities:
>   Textarea: one amenity per line. Save button → JSON.stringify(value.split('\n').filter(Boolean)) → POST /api/admin/content with { key: 'amenities', value: jsonString }
>
> Section 2 — FAQ:
>   List of {question, answer} pairs. Add row button. Remove button per row.
>   No row can be saved with empty question or answer.
>   Save button → JSON.stringify(faqArray) → POST /api/admin/content with { key: 'faq_items', value }
>
> Section 3 — Terms & Conditions:
>   Large <Textarea> (shadcn). Save button → POST /api/admin/content with { key: 'terms_conditions', value }
>
> Section 4 — Footer:
>   Two Input fields: address and phone. Single "Save Footer" button → two POST calls in sequence.
>
> Each save: show "Saving..." state, then "Saved" confirmation for 2 seconds, then revert to Save label.
> On error: show "Save failed" in red.
>
> Also create src/app/api/admin/content/route.ts:
> POST handler:
> - Verify admin session → 401 if not
> - Parse { key, value } from body
> - Validate key is in allowed list: ['amenities','faq_items','terms_conditions','footer_address','footer_phone','space_description']
> - Use createAdminClient() to UPSERT into site_content: { key, value, updated_at: new Date() } on conflict (key) do update
> - Return 200
> ```

#### Agents to Spawn (parallel)

> **PASTE INTO CLAUDE CODE — Task 3.5 review:**
> ```
> Spawn @code-reviewer and @qa-unit in parallel.
>
> @code-reviewer: Review ContentEditor.tsx and src/app/api/admin/content/route.ts.
> Confirm: save is per-section (not a single save-all button), key is validated against an allowlist on the API (cannot UPSERT arbitrary keys), auth check on the API route, FAQ rows with empty question/answer are filtered out before saving, no any types.
>
> @qa-unit: Generate tests.
> Test 1: POST /api/admin/content with auth, valid key → 200 with upsert called.
> Test 2: POST without auth → 401.
> Test 3: POST with key='password_reset' (not in allowlist) → 400.
> Test 4: ContentEditor amenities save → splits by newline and filters empty strings before stringifying.
> Test 5: ContentEditor FAQ save with empty question row → filters out that row before saving.
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(admin)/dashboard/content/ src/components/admin/ContentEditor.tsx
git commit -m "feat: admin content editor for amenities, FAQ, T&C, and footer"
```

---

### Task 3.6 — Dashboard Overview
**BRANCH:** `feature/phase-3-dashboard-home`
**PRODUCES:** `src/app/(admin)/dashboard/page.tsx`

#### Steps

**Step 1 — Scaffold:**
```
/add-route dashboard admin
```

**Step 2 — Implement:**
Server Component. Fetch in parallel:
```typescript
const [todayBookings, monthBookings, upcomingBookings] = await Promise.all([
  supabase.from('bookings').select('*').eq('booking_date', today).eq('status', 'confirmed'),
  supabase.from('bookings').select('subtotal').gte('booking_date', monthStart).lte('booking_date', monthEnd).eq('status', 'confirmed'),
  supabase.from('bookings').select('*').gte('booking_date', today).lte('booking_date', sevenDaysLater).eq('status', 'confirmed').order('booking_date'),
])
```

Display:
- Today's booking count (stat card)
- This month's confirmed bookings count (stat card)
- This month's gross revenue — sum of `subtotal` for confirmed bookings (stat card, R format)
- Upcoming bookings table (next 7 days)
- Quick links to Bookings, Pricing, Content, Gallery

> **PASTE INTO CLAUDE CODE — Task 3.6 Step 2: Implement dashboard overview:**
> ```
> Implement src/app/(admin)/dashboard/page.tsx as a Server Component.
>
> Auth is handled by the parent layout — do NOT duplicate the auth check here.
>
> Get today's date and compute:
>   today = new Date().toISOString().split('T')[0]
>   monthStart = today.slice(0,7) + '-01'
>   monthEnd = last day of current month (compute with Date())
>   sevenDaysLater = date 7 days from today
>
> Fetch with Promise.all using createServerClient (anon is fine — RLS handles access via Supabase Auth session):
>   supabase.from('bookings').select('id').eq('booking_date', today).eq('status', 'confirmed')
>   supabase.from('bookings').select('subtotal').gte('booking_date', monthStart).lte('booking_date', monthEnd).eq('status', 'confirmed')
>   supabase.from('bookings').select('client_name, booking_date, start_time, package_type, status').gte('booking_date', today).lte('booking_date', sevenDaysLater).eq('status', 'confirmed').order('booking_date')
>
> Revenue = monthBookings.reduce((sum, b) => sum + (b.subtotal ?? 0), 0)
>
> Render:
> - Page heading "Dashboard" in font-display
> - 3 stat cards (grid-cols-3 on desktop): Today's Bookings (count), This Month (count), Monthly Revenue (R{revenue.toFixed(2)})
> - Upcoming bookings table: Date, Time, Client, Package columns
> - Quick link cards to /dashboard/bookings, /dashboard/pricing, /dashboard/gallery, /dashboard/content
> - bg-brand-cream for the page, stat cards with white bg and border
> - No any types. No 'use client'.
> ```

#### Agents to Spawn

> **PASTE INTO CLAUDE CODE — Task 3.6 review:**
> ```
> Use the @code-reviewer agent to review src/app/(admin)/dashboard/page.tsx.
> Confirm: Promise.all used for parallel fetching, auth NOT duplicated here (layout handles it), revenue uses subtotal column (not a non-existent total_amount), page is a Server Component (no 'use client'), date computations are correct (no off-by-one errors in month range), empty states handled gracefully (no bookings = shows 0, not crash).
> ```

#### Build Check + Commit
```bash
npm run build && npm run type-check
git add src/app/(admin)/dashboard/page.tsx
git commit -m "feat: admin dashboard overview with today's bookings and monthly revenue"
```

---

### Phase 3 Sign-off Checklist

- [ ] All 4 admin accounts can log in
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Bookings table shows all bookings with correct status filters
- [ ] Booking detail modal opens with full client data
- [ ] No-show and cancel actions update booking status in Supabase
- [ ] ID document download generates a signed URL (not a direct Storage URL)
- [ ] Pricing editor updates a price → refresh public site → price is updated
- [ ] Gallery upload works, images appear on public homepage
- [ ] Gallery delete removes from both Storage and database
- [ ] Content editor: change an FAQ item → refresh public site → FAQ is updated
- [ ] `npm run build` passes with zero errors
- [ ] Deployed to `staging` branch and reviewed

```bash
git checkout staging && git merge feature/phase-3-dashboard-home && git push origin staging
```

---

## PHASE 4 — QA and Production Launch
**Day 5–6 · Saturday 26 – Sunday 27 April 2026**
**Goal: Comprehensive QA, switch to production PayFast, go live.**

---

### Task 4.1 — Full Codebase Audit
**BRANCH:** `feature/phase-4-qa`

Run both skills and address all findings:

> **PASTE INTO CLAUDE CODE — Task 4.1: Full audit:**
> ```
> /audit
> ```
> Resolve all Critical and High findings before continuing. Log Medium findings in KNOWN_ISSUES.md.

> **PASTE INTO CLAUDE CODE — Task 4.1: Security scan:**
> ```
> /security-check
> ```
> Resolve all Critical and High findings before continuing.

> **PASTE INTO CLAUDE CODE — Task 4.1: Final adversarial audit:**
> ```
> Use the @code-auditor agent to perform a final adversarial pre-production security review.
> Review these files, assuming each one is wrong until proven otherwise:
> - src/app/api/payfast/itn/route.ts
> - src/lib/payfast/itn-handler.ts
> - src/app/(admin)/layout.tsx
> - src/app/api/admin/bookings/[id]/route.ts
> - src/app/api/admin/bookings/[id]/id-document/route.ts
> - src/app/api/admin/pricing/[id]/route.ts
> - src/app/api/admin/gallery/route.ts
> - src/lib/payfast/signature.ts
>
> For each file report: severity (Critical/High/Medium/Low), description of the issue, file and line number, required fix.
> Do not stop at the first issue — check everything.
> ```

#### Done When
- [ ] `/audit` score: 8/9 or higher
- [ ] `/security-check` shows no Critical or High issues
- [ ] `@code-auditor` finds no Critical or High issues in payment and auth code

---

### Task 4.2 — End-to-End Final Test (Mobile + Desktop)
**BRANCH:** `feature/phase-4-qa`

Complete this full test sequence manually before switching to production PayFast:

**Mobile test (375px — simulate with browser DevTools):**
1. Browse the full public homepage — all sections visible, no horizontal scroll
2. Open FAQ — accordion works on touch
3. Open T&C modal — scrollable
4. Navigate to `/booking`
5. Complete the entire booking flow on mobile
6. Sandbox payment → confirm ITN fires → status becomes `confirmed`
7. Check confirmation email

**Desktop test (1280px):**
8. Repeat the booking flow on desktop
9. Log in to admin dashboard
10. Verify the two new bookings appear in the bookings table
11. Open booking detail modal — all fields visible
12. Test pricing editor — change a price, verify on public site
13. Test gallery manager — upload a new image, verify on public site
14. Test content editor — edit an FAQ item, verify on public site

**Spawn after completing:**

> **PASTE INTO CLAUDE CODE — Task 4.2: Final visual QA:**
> ```
> Use the @qa-visual agent to run a full visual regression of all pages at 375px, 768px, and 1280px.
>
> Pages to test:
> - / (homepage — all sections)
> - /booking (all 4 steps of the booking form)
> - /booking/confirmed (use a confirmed booking's m_payment_id in the URL)
> - /login
> - /dashboard
> - /dashboard/bookings
> - /dashboard/pricing
> - /dashboard/gallery
> - /dashboard/content
>
> For each page confirm: no horizontal scroll at 375px, text is readable, no overlapping elements, brand colours are correct, interactive elements are visible and usable on touch.
> Report any visual issues with pixel measurements.
> ```

---

### Task 4.3 — Switch to Production PayFast
**BRANCH:** `feature/phase-4-payfast-production`

**Do this ONLY after PayFast merchant account is fully verified (24-48h after Day 1 signup).**

**Step 1 — In Vercel dashboard:**
- Go to Project Settings → Environment Variables
- Find `PAYFAST_SANDBOX`
- For the `Production` environment only: change value from `true` to `false`
- Do NOT change Preview/Development environments

**Step 2 — Redeploy production:**
The environment variable change triggers a new deployment automatically in Vercel.

**Step 3 — Test with a real R1 payment:**
1. Go to the live production URL
2. Complete a booking
3. Use a real payment card (not sandbox)
4. Amount: the minimum will be determined by your pricing — use the cheapest slot
5. Verify ITN fires on the production URL
6. Verify booking confirms in Supabase
7. Verify confirmation email arrives
8. Refund the test payment via PayFast dashboard

#### Agents to Spawn (MANDATORY)

> **PASTE INTO CLAUDE CODE — Task 4.3: Verify production PayFast config:**
> ```
> Use the @payfast-agent to verify the production PayFast configuration before the live test payment.
> Confirm:
> - PAYFAST_SANDBOX env var is 'false' for the Production environment in Vercel (not Preview/Development)
> - In src/app/api/bookings/route.ts, the payfastUrl correctly switches to https://www.payfast.co.za/eng/process when PAYFAST_SANDBOX !== 'true'
> - notify_url in the booking payload points to https://kyalamistudio.co.za/api/payfast/itn (not localhost)
> - return_url points to https://kyalamistudio.co.za/booking/confirmed
> - IP whitelist in the ITN handler includes all production PayFast IPs (same list as sandbox)
> Report any issues before I proceed with the real payment test.
> ```

#### Done When
- [ ] Real card payment completes on production URL
- [ ] Booking confirms in Supabase (status = 'confirmed')
- [ ] Confirmation email received from correct sender address
- [ ] Test payment refunded via PayFast dashboard

---

### Task 4.4 — Production Deploy and Verification
**BRANCH:** Merge `staging` to `main`

```bash
git checkout main
git merge staging
git push origin main
```

Vercel auto-deploys to production. Wait ~2 minutes, then verify:

```bash
# Verify from your terminal
curl https://kyalamistudio.co.za/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Full production checklist:**
- [ ] `https://kyalamistudio.co.za` loads with HTTPS
- [ ] Homepage all sections render correctly
- [ ] `/booking` is accessible
- [ ] Admin login works with all 4 admin accounts
- [ ] `/api/health` returns 200
- [ ] Vercel Cron job visible in Vercel dashboard → Cron Jobs
- [ ] Cloudflare DNS: CNAME set to DNS-only (grey cloud)

---

### Task 4.5 — Hand-Off and Documentation
**BRANCH:** `main`

**Step 1 — Update BUILD_STATUS.md to Phase 4 complete.**

**Step 2 — Update KNOWN_ISSUES.md** with any deferred items that didn't make the launch.

**Step 3 — Document access for the studio team:**
Create a simple credentials document (NOT in the repo) with:
- Vercel dashboard URL and login
- Supabase dashboard URL and login
- PayFast merchant dashboard URL and login
- Resend dashboard URL and login
- Cloudflare account URL and login

**Step 4 — Final commit:**
```bash
git add BUILD_STATUS.md KNOWN_ISSUES.md
git commit -m "chore: Phase 4 complete — production live, handoff documented"
git push origin main
```

---

### Phase 4 Sign-off Checklist — All Must Pass

- [ ] `/audit` score: 8/9 or higher
- [ ] `/security-check` — no Critical or High issues
- [ ] Full booking flow completed with production PayFast credentials on live domain
- [ ] All 4 admin accounts tested on production
- [ ] `https://kyalamistudio.co.za` live with HTTPS
- [ ] Vercel Cron job scheduled and visible
- [ ] Cloudflare DNS active (grey cloud)
- [ ] Studio team has access credentials for all dashboards
- [ ] `KNOWN_ISSUES.md` updated with deferred items
- [ ] `BUILD_STATUS.md` updated to Phase 4 Complete

---

## Post-Launch — Phase 2 Preview

Out of scope for the initial launch. Each will be separately scoped and estimated.

| Feature | Estimated effort | Notes |
|---|---|---|
| Google Calendar sync | 3–4 hours | Service account setup + Google Cloud project |
| Client reschedule request portal | 4–6 hours | Token-based link, no login required |
| Admin reschedule approval flow | 2–3 hours | Depends on reschedule portal |
| Admin new-booking email alerts | 1 hour | Add to ITN handler after email |
| Monthly revenue CSV export | 2 hours | Admin dashboard enhancement |
| PayFast Onsite (embedded checkout) | 4–6 hours | Eliminates redirect to PayFast |
| Discount / promo codes | 3–4 hours | Admin-generated, applied at checkout |

---

## Quick Reference — Agent and Skill Lookup

| I need to... | Use this |
|---|---|
| Pick up where I left off | `/restore-session` |
| Review code I just wrote | `@code-reviewer` |
| Find hidden bugs and edge cases | `@code-auditor` |
| Generate and run unit tests | `@qa-unit` |
| Check visual layout at 3 breakpoints | `@qa-visual` |
| Check the whole codebase health | `/audit` |
| Find security vulnerabilities | `/security-check` |
| Look up official documentation | `@research` |
| Implement or review PayFast code | `@payfast-agent` + `/payfast-webhook` |
| Create or fix Supabase schema or RLS | `@supabase-agent` + `/add-supabase-table` |
| Configure Vercel or Cloudflare | `@devops-agent` |
| Add a new React component | `/add-component [Name] [public\|admin]` |
| Add a new page | `/add-route [path] [public\|admin]` |
| Add a new API route handler | `/add-api-route [path]` |
| Add a new database table | `/add-supabase-table [name]` |
| Add an RLS policy | `/add-rls-policy [table] [operation]` |
| Add an email template | `/add-email-template [name]` |
| See the codebase structure | `/visualise` |
| Run visual regression | `/screenshot-compare [route]` |
