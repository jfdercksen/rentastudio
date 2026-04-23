#!/bin/bash
# Skill Evaluator v1.0 — Kyalami Studio / Ai Dynamic Advisory
# Fires on every UserPromptSubmit
# Reads the incoming prompt and suggests relevant skills or agents

PROMPT=$(cat 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('prompt', ''))
except:
    pass
" 2>/dev/null)

if [ -z "$PROMPT" ]; then exit 0; fi

suggestions=()

# Audit and health check
if echo "$PROMPT" | grep -qi "audit\|review all\|check everything\|health check\|codebase"; then
  suggestions+=("/audit — 9-category parallel codebase health check")
fi

# Adversarial review
if echo "$PROMPT" | grep -qi "what's wrong\|find bugs\|review\|critique\|check my"; then
  suggestions+=("@code-auditor — adversarial Opus review that assumes code is wrong")
fi

# Security
if echo "$PROMPT" | grep -qi "security\|vulnerabilit\|auth\|token\|secret\|RLS\|access control\|admin"; then
  suggestions+=("/security-check — scan for vulnerabilities and exposed secrets")
  suggestions+=("@supabase-agent — verify RLS policies are correct")
fi

# PayFast / payments
if echo "$PROMPT" | grep -qi "payfast\|payment\|itn\|webhook\|checkout\|transaction\|sandbox\|merchant"; then
  suggestions+=("/payfast-webhook — implement or review PayFast ITN handler")
  suggestions+=("@payfast-agent — PayFast specialist with SA payment expertise")
fi

# Booking engine
if echo "$PROMPT" | grep -qi "booking\|availability\|slot\|double book\|schedule\|calendar\|date picker"); then
  suggestions+=("@supabase-agent — booking schema, slot locking, availability queries")
fi

# Database / Supabase
if echo "$PROMPT" | grep -qi "table\|schema\|migration\|database\|RLS\|policy\|supabase\|postgres"); then
  suggestions+=("/add-supabase-table — creates table with migration SQL and RLS")
  suggestions+=("/add-rls-policy — adds Row Level Security policy")
  suggestions+=("@supabase-agent — Supabase schema and RLS specialist")
fi

# Components and UI
if echo "$PROMPT" | grep -qi "component\|button\|form\|modal\|card\|hero\|section\|UI\|layout\|tailwind\|shadcn"); then
  suggestions+=("/add-component — creates typed React component with brand styles")
fi

# Routes / pages
if echo "$PROMPT" | grep -qi "page\|route\|navigation\|URL\|path\|link\|app router"); then
  suggestions+=("/add-route — adds new App Router page with metadata")
fi

# API routes
if echo "$PROMPT" | grep -qi "api\|endpoint\|route handler\|server action\|backend"); then
  suggestions+=("/add-api-route — adds validated API route with Zod schema")
fi

# Email
if echo "$PROMPT" | grep -qi "email\|resend\|template\|confirmation\|notification"); then
  suggestions+=("/add-email-template — creates Resend email template")
fi

# Deployment / DevOps
if echo "$PROMPT" | grep -qi "deploy\|vercel\|cloudflare\|dns\|ssl\|domain\|production\|environment"); then
  suggestions+=("@devops-agent — Vercel + Cloudflare deployment specialist")
fi

# Visual / screenshots
if echo "$PROMPT" | grep -qi "screenshot\|visual\|responsive\|mobile\|breakpoint\|layout looks"); then
  suggestions+=("/screenshot-compare — visual regression at 375px, 768px, 1280px")
  suggestions+=("@qa-visual — visual QA agent")
fi

# Codebase exploration
if echo "$PROMPT" | grep -qi "structure\|visualis\|map\|explore\|overview\|architecture"); then
  suggestions+=("/visualise — generates interactive codebase tree in browser")
fi

# Session restore
if echo "$PROMPT" | grep -qi "where were we\|last session\|continue\|pick up\|restore\|context"); then
  suggestions+=("/restore-session — recovers context from previous session")
fi

# Output suggestions
if [ ${#suggestions[@]} -gt 0 ]; then
  echo ""
  echo "💡 Suggested for this task:"
  for s in "${suggestions[@]}"; do
    echo "   $s"
  done
  echo ""
fi

exit 0
