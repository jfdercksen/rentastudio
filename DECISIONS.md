# Architecture and Design Decisions — Kyalami Studio

> Every significant decision made during the build is recorded here.
> Claude reads this at the start of every session to avoid contradicting decisions already made.

---

## Stack Decisions

### D001 — Vercel Pro over Vercel Hobby
**Decision:** Use Vercel Pro ($20/month) not the free Hobby tier.
**Reason:** Vercel's Hobby plan explicitly prohibits commercial use. Kyalami Studio processes real payments — it is a commercial application. Using Hobby risks account suspension. Pro is non-negotiable.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D002 — Supabase Free Tier with Keep-Alive
**Decision:** Use Supabase Free tier at launch, with a Vercel Cron job pinging the health endpoint every 24 hours to prevent project pausing.
**Reason:** Supabase Free pauses after 7 days of inactivity. A daily cron ping prevents this. Upgrade path to Supabase Pro ($25/month) is available when revenue justifies it.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D003 — PayFast Standard (Redirect) not Onsite (Embedded)
**Decision:** Use PayFast Standard redirect flow at launch.
**Reason:** Standard is faster to implement, well-documented, and sufficient for launch. PayFast Onsite (embedded) is deferred to Phase 2 — it requires additional certification.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D004 — ITN-Gated Booking Confirmation
**Decision:** A booking is only confirmed after PayFast sends a verified ITN (Instant Transaction Notification) to our server-side webhook. The return_url is cosmetic only.
**Reason:** The return_url is browser-side and can be manipulated. ITN is server-to-server with MD5 signature verification. This is how 100% payment collection is enforced.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D005 — Postgres Row Locking for Double-Booking Prevention
**Decision:** Use `SELECT FOR UPDATE` inside the ITN handler transaction plus a `UNIQUE` constraint on `(booking_date, start_time)`.
**Reason:** Two clients could pay simultaneously for the same slot. Row-level locking inside a transaction prevents both from confirming. The unique constraint is a database-level safety net.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D006 — Supabase Auth for Admin (Not Custom Auth)
**Decision:** Use Supabase Auth for the 4 admin users. No custom auth system.
**Reason:** Building custom auth is a security risk and a time sink. Supabase Auth provides secure session management, email/password login, and integrates directly with RLS policies.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D007 — Cloudflare DNS-Only Mode (Grey Cloud)
**Decision:** Cloudflare DNS is set to DNS-only (grey cloud), NOT full proxy mode.
**Reason:** Full proxy mode intercepts HTTPS and prevents Vercel from issuing SSL certificates. DNS-only gives us DDoS protection at the DNS level and edge routing without breaking Vercel SSL.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D008 — Resend for Transactional Email (Shared Sender at Launch)
**Decision:** Use Resend free tier with shared sender domain at launch. Custom domain email (bookings@kyalamistudio.co.za) configured post-launch.
**Reason:** Custom domain requires DNS verification which adds time. Resend's shared sender is deliverable and sufficient for launch. Post-launch migration to custom domain is a 10-minute task.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D009 — Google Calendar Sync Deferred to Week 2
**Decision:** Google Calendar sync is out of scope for the initial launch.
**Reason:** Requires Google Cloud project setup, service account creation, and JSON credential configuration — approximately 2–3 additional hours. Admin can check the dashboard for bookings at launch. Week 2 addition.
**Date:** April 2026
**Decided by:** Developer (confirmed at scope sign-off)

---

### D010 — No Docker at Launch
**Decision:** Local development uses `npm run dev` only. No Docker Compose.
**Reason:** Solo developer, 5-day deadline, fully managed services (Vercel + Supabase). Docker adds ops complexity that provides no benefit here. Supabase local development via `supabase start` is available if needed for schema work.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory

---

### D011 — R750 Breakage Deposit Always Included
**Decision:** The R750 refundable breakage deposit is always added to the PayFast total. No exceptions.
**Reason:** Business requirement confirmed in intake. Deposit refunds are processed manually by admin via PayFast dashboard. Automated deposit refund processing is Phase 2.
**Date:** April 2026
**Decided by:** Kyalami Studio (from existing T&C)

---

### D012 — Guest Checkout (No Client Accounts at Launch)
**Decision:** Clients book without creating an account. Booking data is stored but no client login portal exists at launch.
**Reason:** Reduces friction in the booking flow. A client portal (view bookings, request reschedule) is a Phase 2 feature.
**Date:** April 2026
**Decided by:** Ai Dynamic Advisory
