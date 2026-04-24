# Build Status — Kyalami Studio

> Update at the END of every work session before closing Claude Code.
> This is the FIRST file Claude reads at the start of every new chat.

---

## Current State

| Field | Value |
|---|---|
| **Current Phase** | Phase 3 — Admin Dashboard |
| **Current Task** | Task 3.x — Phase 3 built, pending commit + build verification |
| **Current Branch** | main |
| **Last Updated** | 23 April 2026 |
| **Last Updated By** | Claude Code |

---

## Phase Progress

| Phase | Description | Status | Staging Deploy | Sign-off |
|---|---|---|---|---|
| Phase 0 | Foundation and environment setup | ✅ Complete | — | — |
| Phase 1 | Public site UI replication | ✅ Complete | — | — |
| Phase 2 | Booking engine + PayFast ITN | ✅ Complete | — | — |
| Phase 3 | Admin dashboard | 🔄 In Progress | — | — |
| Phase 4 | QA + production launch | ⏳ Not started | — | — |

Status key: ✅ Complete | 🔄 In Progress | ⏳ Not started | ❌ Blocked

---

## Phase 0 — Task Checklist ✅

- [x] 0.1 — Scaffold Next.js 15 project
- [x] 0.2 — Install dependencies: Supabase, shadcn/ui, Zod, React Hook Form, Resend
- [x] 0.3 — Configure Tailwind with brand tokens (colours + fonts)
- [x] 0.4 — Create Supabase project and run initial migration SQL
- [x] 0.5 — Configure Supabase Auth (admin users)
- [x] 0.6 — Set up Supabase Storage buckets (gallery, id-documents)
- [x] 0.7 — Create Vercel Pro project, connect GitHub repo
- [x] 0.8 — Add all environment variables to Vercel dashboard
- [x] 0.9 — Configure Cloudflare DNS
- [x] 0.10 — Verify local dev running
- [x] 0.11 — Deploy to Vercel production
- [x] 0.12 — Add `/api/health` keep-alive route and Vercel Cron

## Phase 1 — Task Checklist ✅

- [x] 1.x — Public homepage (Hero, TheSpace, Pricing, Equipment, Amenities, FAQ, Footer)
- [x] 1.x — TermsModal, BookingSection, all public components
- [x] 1.x — Privacy policy page

## Phase 2 — Task Checklist ✅

- [x] 2.x — Booking form (BookingForm, DatePicker, TimePicker, PackageSelector, AddOnSelector)
- [x] 2.x — ClientDetailsForm, BankingDetailsForm, PaymentSummary
- [x] 2.x — /api/bookings route (create + list)
- [x] 2.x — /api/availability route
- [x] 2.x — PayFast ITN handler (/api/payfast/itn)
- [x] 2.x — Booking confirmed page

## Phase 3 — Task Checklist 🔄

- [x] 3.1 — middleware.ts (session refresh + dashboard route protection)
- [x] 3.2 — AdminNav component (sidebar + sign out)
- [x] 3.3 — (admin)/layout.tsx auth guard
- [x] 3.4 — (admin)/login/page.tsx login page
- [x] 3.5 — Dashboard overview page
- [x] 3.6 — BookingsTable + BookingDetailModal + API routes
- [x] 3.7 — PricingEditor + API routes
- [x] 3.8 — GalleryManager + API routes
- [x] 3.9 — ContentEditor + API route
- [ ] 3.10 — Commit Phase 3 (build verification passed)
- [ ] 3.11 — Deploy to staging and verify all admin routes work

---

## Pre-Build Checklist

Complete these BEFORE writing any code:

### Accounts Required
- [ ] **Vercel Pro** — Create account, upgrade to Pro ($20/month) at vercel.com
- [ ] **Supabase** — Create account and new project at supabase.com
- [ ] **PayFast** — Merchant account created and credentials noted (merchant ID, merchant key, passphrase). Sandbox available immediately; production takes 24–48h to approve.
- [ ] **Resend** — Create account, get API key at resend.com. Note the 100 emails/day free tier limit.
- [ ] **Cloudflare** — Create account, add your domain, note nameservers at cloudflare.com
- [ ] **GitHub** — Repo created for the project
- [ ] **Domain registrar** — Access confirmed to update nameservers to Cloudflare

### Credentials to Collect
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret)
- [ ] `PAYFAST_MERCHANT_ID` — from PayFast account
- [ ] `PAYFAST_MERCHANT_KEY` — from PayFast account
- [ ] `PAYFAST_PASSPHRASE` — set in PayFast account settings
- [ ] `RESEND_API_KEY` — from Resend dashboard

### Assets Required Before Phase 1
- [ ] Studio gallery images (minimum 5, JPEG/WebP, landscape)
- [ ] Final pricing confirmed (all packages + add-on prices)
- [ ] Final T&C text
- [ ] Studio address and contact details for footer

---

## Current Blockers

None.

---

## Session Notes

### 23 April 2026 — Phase 3 Admin Dashboard built (uncommitted)
- Middleware (session refresh + /dashboard route protection) created at src/proxy.ts + middleware.ts
- AdminNav sidebar component with sign-out
- Auth guard layout at (admin)/layout.tsx
- Login page at (admin)/login/page.tsx
- Dashboard overview with live stats (bookings count, revenue, pending)
- BookingsTable + BookingDetailModal — list all bookings, view/update status, view ID doc
- PricingEditor — edit package prices and add-on prices inline
- GalleryManager — upload images to Supabase Storage, reorder, delete
- ContentEditor — edit amenities, FAQ items, T&C, footer address/phone
- All admin API routes under /api/admin/: bookings, pricing, add-ons, gallery, content
- Build check passed (npm run build + type-check)
- Next: commit Phase 3, deploy to staging, verify admin routes

### 23 April 2026 — Tasks 0.1–0.3 complete
- Next.js 16.2.4 scaffold created
- All dependencies installed: Supabase, shadcn/ui, Zod, React Hook Form, Resend
- Brand tokens applied: Fraunces/Inter/IBM Plex Mono fonts, cream/gold/charcoal/emerald/terracotta palette

### 22 April 2026 — Project setup complete
- Claude Code project files generated by App Project Generator v3
- All agents, skills, rules, and hooks created
- IMPLEMENTATION_WORKFLOW.md ready
- Next session: complete Pre-Build Checklist, then start Task 0.1

---

## How to Update This File

At the end of every session:
1. Check off completed tasks
2. Update Current Phase and Current Task
3. Move newly blocked items to KNOWN_ISSUES.md
4. Write a brief session note with date
5. Commit: `git add BUILD_STATUS.md && git commit -m "chore: update build status"`
