---
name: security-check
description: Scan Kyalami Studio codebase for security vulnerabilities. Use before any production deployment or when adding authentication, payments, or data handling code.
context: fork
agent: Explore
allowed-tools: Read, Glob, Grep, Bash
---

# Security Check — Kyalami Studio

Scan for security vulnerabilities specific to this project's stack.

## Live Context

Files changed recently: !`git diff --name-only HEAD~3 HEAD 2>/dev/null || echo "No recent changes"`
Environment files present: !`ls -la .env* 2>/dev/null || echo "No .env files found"`

## Scan Checklist

### 1. Secrets and Credentials
Search for these patterns in source files (should NEVER appear in client-side code):
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `RESEND_API_KEY`
- Any hardcoded `sk_` or `pk_` API keys

Check specifically: `src/components/**`, `src/app/(public)/**`, any file with `'use client'`

### 2. PayFast ITN Security
In `src/app/api/payfast/itn/route.ts`:
- [ ] IP whitelist check is first operation before any DB work
- [ ] Signature rebuilt and compared (not trusting PayFast's sent signature)
- [ ] `payment_status === 'COMPLETE'` checked
- [ ] `amount_gross` compared exactly (string comparison, not float)
- [ ] `SELECT FOR UPDATE` or equivalent locking used
- [ ] Returns 200 even on failure (non-200 triggers retries)

### 3. Supabase RLS
Run: check all tables have RLS enabled
- [ ] `bookings` — public INSERT for pending only, admin full access
- [ ] `pricing` — public SELECT only
- [ ] `add_ons` — public SELECT only
- [ ] `blocked_dates` — public SELECT only
- [ ] `site_content` — public SELECT only
- [ ] `gallery_images` — public SELECT only

### 4. Storage Security
- [ ] `id-documents` bucket is PRIVATE (not public)
- [ ] Only service role or authenticated admin can read ID documents
- [ ] File type validation is server-side (not just client)
- [ ] File size limits enforced

### 5. Admin Route Protection
In `src/app/(admin)/layout.tsx`:
- [ ] `supabase.auth.getUser()` called server-side
- [ ] Unauthenticated users redirected to /login
- Individual admin pages should NOT re-check auth (layout handles it)

### 6. API Input Validation
For every file in `src/app/api/`:
- [ ] Zod schema validates all inputs before DB operations
- [ ] Error responses never leak internal implementation details

### 7. Sensitive Data in API Responses
Public API routes must NOT return:
- Client banking details (account_number, branch_code, bank_name)
- Client ID document URLs
- PayFast credentials

### 8. Environment Files
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` has all keys but NO real values
- [ ] No `.env` file committed to git

## Output Format

**CRITICAL — Fix immediately:**
[Issue] — [File:line] — [Fix]

**HIGH — Fix before production:**
[Issue] — [File:line] — [Fix]

**MEDIUM — Fix soon:**
[Issue] — [Recommendation]

**Overall security status:** PASS / NEEDS ATTENTION / CRITICAL ISSUES FOUND
