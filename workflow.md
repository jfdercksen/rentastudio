# Workflow — Kyalami Studio

---

## 7-Step Build Workflow

Follow this for every feature, every session.

```
1. WRITE    → Implement the feature with Claude Code
2. REVIEW   → Spawn @code-reviewer (persistent memory agent)
3. QA UNIT  → Spawn @qa-unit (Vitest tests)
4. QA VIS   → Spawn @qa-visual (screenshot comparison — frontend only)
5. FIX      → Apply all findings from steps 2-4
6. BUILD    → npm run build && npm run type-check → touch /tmp/kyalami-tests-passed
7. SHIP     → git add [files] && git commit -m "feat: [description]"
```

Steps 2, 3, and 4 can run in parallel when they cover independent concerns.

After shipping significant features: spawn `@code-auditor` for adversarial review.

---

## Three-Environment Git Workflow

### Branch Strategy

```
main        → Production (kyalamistudio.co.za)
staging     → Staging (Vercel preview URL)
feature/*   → Local development + Vercel preview per branch
```

### Daily Flow

```bash
# Start new work
git checkout -b feature/[description]

# Make changes, run dev server
npm run dev

# When ready to review
git add [specific files]
git commit -m "feat: [description]"
git push origin feature/[description]
# → Vercel auto-creates a preview URL

# After self-review, merge to staging
git checkout staging
git merge feature/[description]
git push origin staging
# → Staging preview URL updated for review

# After review and sign-off, merge to production
git checkout main
git merge staging
git push origin main
# → Production deployment triggered
```

### Commit Message Format

```
feat:     New feature
fix:      Bug fix
chore:    Maintenance (update build status, add rules, etc.)
refactor: Code restructure, no behaviour change
style:    Styling changes
test:     Add or update tests
docs:     Documentation
```

---

## Research Workflow

Before implementing something unfamiliar:

```
1. Spawn @research agent with the specific question
2. Wait for research to return with official doc reference
3. Implement based on research findings
4. Never implement from memory alone for: PayFast API, Supabase RLS, Next.js 15 APIs
```

Examples:
- "What is the correct way to create a PayFast signature?" → `@research`
- "How do I use SELECT FOR UPDATE in Supabase?" → `@research`
- "What is the Next.js 15 way to await params?" → `@research`

---

## PayFast Testing Workflow

```
1. Set PAYFAST_SANDBOX=true in .env.local
2. Use PayFast sandbox test card numbers from https://developers.payfast.co.za/sandbox
3. Expose local webhook with: npx localtunnel --port 3000
   OR deploy to Vercel preview URL (preferred)
4. Set notify_url in PayFast payload to your preview URL /api/payfast/itn
5. Complete a sandbox payment
6. Verify: booking status changes to 'confirmed', email sent, calendar event created
7. Only after successful sandbox test: switch to production credentials
```

**PayFast test card (sandbox):** 4000 0000 0000 0002
**Test CVV:** 123
**Test expiry:** Any future date

---

## Supabase Migration Workflow

```bash
# When adding or changing a table:

1. Write the SQL in supabase/migrations/[NNN]_description.sql
2. Apply to local Supabase (if running locally):
   npx supabase db push
3. Apply to remote Supabase project:
   Via Supabase dashboard → SQL Editor → paste and run
4. Regenerate TypeScript types:
   npx supabase gen types typescript --project-id [your-project-id] > src/types/database.ts
5. Verify RLS is enabled on the new table

Never edit the Supabase schema without a migration file.
```

---

## Admin User Setup

```sql
-- Run in Supabase SQL Editor to create admin users
-- (Or use Supabase Auth dashboard → Users → Invite)

-- Supabase Auth handles user creation via:
-- Dashboard → Authentication → Users → Add user
-- Set email and password for each of the 4 admin users

-- No additional roles table needed at launch.
-- All authenticated users via Supabase Auth have admin access.
-- RLS policies use: auth.uid() IS NOT NULL
```

---

## Staging Review Checklist

Before merging staging → main, verify:

- [ ] Homepage loads and matches HTML design reference
- [ ] Booking form completes end-to-end in sandbox (date → slots → package → add-ons → client details → PayFast → confirmed)
- [ ] Confirmation email received by test address
- [ ] Admin login works for all 4 admin accounts
- [ ] Bookings appear in admin dashboard after confirmation
- [ ] Gallery images load from Supabase Storage
- [ ] Pricing editor: change a price, verify it updates on public site
- [ ] Content editor: change FAQ text, verify it updates on public site
- [ ] Mobile layout tested at 375px
- [ ] `npm run build` passes with zero errors
- [ ] `/api/health` returns 200

---

## Session End Checklist

Before closing Claude Code:

1. Update `BUILD_STATUS.md` (current task, completed checklist items)
2. Add any new issues to `KNOWN_ISSUES.md`
3. Add any new decisions to `DECISIONS.md`
4. Commit all three files: `git add BUILD_STATUS.md DECISIONS.md KNOWN_ISSUES.md && git commit -m "chore: update session state"`
5. Push to your current feature branch
