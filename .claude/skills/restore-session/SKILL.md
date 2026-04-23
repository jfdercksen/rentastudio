---
name: restore-session
description: Recover full context from the previous Claude Code session. Use when starting a new chat and you want to pick up exactly where you left off.
allowed-tools: Read, Bash, Glob
disable-model-invocation: true
---

# Restore Session — Kyalami Studio

Recovering context from previous session.

## Live State

Build status: !`cat BUILD_STATUS.md 2>/dev/null || echo "BUILD_STATUS.md not found"`
Known issues: !`cat KNOWN_ISSUES.md 2>/dev/null | head -40 || echo "KNOWN_ISSUES.md not found"`
Recent decisions: !`cat DECISIONS.md 2>/dev/null | tail -40 || echo "DECISIONS.md not found"`
Git log: !`git log --oneline -10 2>/dev/null || echo "No git history"`
Git status: !`git status --short 2>/dev/null || echo "Not a git repo"`
Current branch: !`git branch --show-current 2>/dev/null || echo "No branch"`
Last modified files: !`git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "No commits"`

## Instructions

Based on the above state:

1. Summarise what phase and task we were on
2. List what was completed in the last session (from git log and BUILD_STATUS)
3. List any active blockers from KNOWN_ISSUES.md
4. State the recommended next action to continue the build
5. Ask: "Is this correct? What do you want to work on today?"
