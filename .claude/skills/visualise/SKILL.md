---
name: visualise
description: Generate an interactive HTML codebase tree for Kyalami Studio. Use when exploring project structure, onboarding after a break, or checking what files exist before starting a new feature.
allowed-tools: Bash, Read, Write
---

# Visualise — Kyalami Studio

Generating interactive codebase map.

## Live Context

Project root contents: !`ls -la 2>/dev/null || echo "No files yet"`
Source structure: !`find src -type f -name "*.tsx" -o -name "*.ts" 2>/dev/null | head -50 || echo "No src directory yet"`
Agent/skill count: !`ls .claude/agents/ 2>/dev/null | wc -l && ls .claude/skills/ 2>/dev/null | wc -l || echo "No .claude directory"`

## Instructions

Generate a self-contained interactive HTML file saved to `./codebase-map.html`.

The HTML should include:
- Collapsible directory tree (click to expand/collapse)
- File type colour coding:
  - `.tsx` → blue (`#3178c6`)
  - `.ts` → dark blue (`#1d4ed8`)
  - `.sql` → orange (`#ea580c`)
  - `.md` → green (`#16a34a`)
  - `.json` → yellow (`#ca8a04`)
  - `.sh` → purple (`#9333ea`)
- File sizes shown next to each file name
- Summary panel: total files, total size, file type breakdown
- Kyalami Studio branding (cream background `#F5F0E8`, gold accents `#C8A96E`)

Directories to exclude: `node_modules`, `.next`, `.git`, `dist`, `build`, `.cache`

Save the file and report: "Codebase map saved to `./codebase-map.html`. Open in browser to explore."

Key directories to highlight in the tree:
- `src/app/` — Next.js routes
- `src/components/` — UI components
- `src/lib/` — Utilities (PayFast, Supabase, Resend)
- `supabase/migrations/` — Database migrations
- `.claude/` — Agents, skills, rules
