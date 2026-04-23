# Known Issues and Blockers — Kyalami Studio

> Add issues here as they are discovered during the build.
> Claude reads this at the start of every session.
> Move to Resolved when fixed.

---

## Active Issues

| ID | Issue | Severity | File / Location | Reported | Status |
|---|---|---|---|---|---|
| — | No issues yet — project not started | — | — | — | — |

Severity: 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low

---

## Known Risks (Pre-Build)

| ID | Risk | Mitigation |
|---|---|---|
| R001 | PayFast production credentials take 24–48h to approve | Start PayFast account on Day 1. Use sandbox throughout development. Switch to production credentials on Day 5. |
| R002 | Supabase Free tier pauses after 7 days inactivity | Keep-alive cron job pings `/api/health` every 24h via Vercel Cron. Verify this is running before going live. |
| R003 | Cloudflare DNS propagation can take up to 48h | Set TTL to 60s before DNS migration. Use Vercel preview URL as fallback during propagation. |
| R004 | ITN webhook not reachable during development | Use ngrok or Vercel preview URL for ITN testing. Never test PayFast ITN on localhost without tunneling. |
| R005 | ID document uploads could be accessed by non-admins | Supabase Storage bucket must be private. Only admin service-role client can read ID documents. Verify RLS on storage bucket. |

---

## Resolved Issues

| ID | Issue | Fix Applied | Resolved Date |
|---|---|---|---|
| — | — | — | — |

---

## How to Add an Issue

When you find a bug or blocker:

1. Add it to Active Issues with ID (I001, I002...), description, severity, and file location
2. Commit: `git add KNOWN_ISSUES.md && git commit -m "chore: log known issue [ID]"`
3. When fixed: move to Resolved with fix description and date

**Critical (🔴):** Blocking — cannot ship. Fix immediately.
**High (🟡):** Affecting core functionality. Fix before next phase.
**Medium (🟢):** Degraded experience. Fix before production.
**Low (⚪):** Minor issue. Fix when convenient.
