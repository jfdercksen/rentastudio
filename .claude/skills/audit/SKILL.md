---
name: audit
description: Run a full 9-category health check on the Kyalami Studio codebase. Use when you want an overview of code quality, security, and technical debt before a phase sign-off or production deployment.
context: fork
agent: Explore
allowed-tools: Read, Glob, Grep, Bash
---

# Codebase Audit — Kyalami Studio

Run a comprehensive 9-category audit in parallel. Return a health score and top 3 priorities.

## Live Context

Current git status: !`git status --short 2>/dev/null || echo "No git repo"`
Recent changes: !`git log --oneline -10 2>/dev/null || echo "No commits"`
TypeScript errors: !`npx tsc --noEmit 2>&1 | head -30 || echo "tsc not available"`
Open TODOs: !`grep -r "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx" -h . 2>/dev/null | head -20 || echo "None"`

## 9 Audit Categories

Run all checks and report findings:

### 1. Build and TypeScript
- Does `npm run build` pass?
- TypeScript strict mode errors?
- Any `any` types in source files?

### 2. Security
- Any secrets in client-side files (PAYFAST_, SUPABASE_SERVICE_ROLE_KEY)?
- PayFast ITN: IP verification, signature check, amount validation, SELECT FOR UPDATE?
- All API routes validate with Zod?
- Admin routes check auth server-side?
- Supabase Storage ID document bucket private?

### 3. RLS Coverage
- Is RLS enabled on every public schema table?
- Are there any tables accessible without auth that should require it?
- Does the bookings table prevent public reads of banking details?

### 4. Dead Code
- Unused imports?
- Commented-out code blocks?
- Unused functions or components?

### 5. Test Coverage
- Do unit tests exist for PayFast signature generation?
- Do unit tests exist for ITN handler?
- Do unit tests exist for price calculation?

### 6. Dependencies
- Any packages with known vulnerabilities (`npm audit`)?
- Any packages significantly outdated?

### 7. Performance
- Are Server Components used where possible (no unnecessary 'use client')?
- Are images using next/image?
- Any obvious N+1 database queries?

### 8. Environment and Configuration
- Is `.env.example` up to date with all required variables?
- Is `vercel.json` present with keep-alive cron job?
- Is `.env.local` excluded from git?

### 9. Documentation
- Is CLAUDE.md current?
- Is BUILD_STATUS.md up to date?
- Is KNOWN_ISSUES.md capturing current blockers?

## Output Format

**Health Score: [N]/9 categories passing**

**Category Results:**
1. Build/TypeScript: ✅ PASS / ❌ FAIL — [details]
2. Security: ✅ PASS / ❌ FAIL — [details]
3. RLS Coverage: ✅ PASS / ❌ FAIL — [details]
4. Dead Code: ✅ PASS / ⚠️ WARN — [details]
5. Test Coverage: ✅ PASS / ❌ FAIL — [details]
6. Dependencies: ✅ PASS / ⚠️ WARN — [details]
7. Performance: ✅ PASS / ⚠️ WARN — [details]
8. Configuration: ✅ PASS / ❌ FAIL — [details]
9. Documentation: ✅ PASS / ⚠️ WARN — [details]

**Top 3 Priorities:**
1. [Most critical issue — file:line — fix]
2. [Second issue — file:line — fix]
3. [Third issue — file:line — fix]
