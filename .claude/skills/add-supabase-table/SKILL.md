---
name: add-supabase-table
description: Create a new Supabase table for Kyalami Studio with migration SQL, RLS policies, and TypeScript types. Use when adding a new database table.
argument-hint: [table-name]
allowed-tools: Read, Write, Edit, Bash
---

# Add Supabase Table — Kyalami Studio

Creating table: $ARGUMENTS

## Live Context

Existing migrations: !`ls supabase/migrations/ 2>/dev/null || echo "No migrations directory yet"`
Current tables: !`ls supabase/migrations/*.sql 2>/dev/null | tail -5 || echo "No migrations yet"`

## Instructions

Create a migration file at `supabase/migrations/[NNN]_add_[table-name].sql`.

Number it sequentially (check existing migration files for the next number).

### Migration Template

```sql
-- Migration: add [table-name] table
-- Created: [date]

CREATE TABLE IF NOT EXISTS [table-name] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Add columns here
);

-- Enable RLS (required on all tables)
ALTER TABLE [table-name] ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read (if applicable):
CREATE POLICY "Public can read [table-name]" ON [table-name]
  FOR SELECT USING (true);

-- Admin full access:
CREATE POLICY "Admins full access [table-name]" ON [table-name]
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Add indexes for common query patterns:
CREATE INDEX IF NOT EXISTS idx_[table-name]_[column] ON [table-name]([column]);
```

### After Creating Migration

Remind the developer:
1. Apply to Supabase: paste SQL into Supabase Dashboard → SQL Editor
2. Regenerate types: `npx supabase gen types typescript --project-id [ID] > src/types/database.ts`
3. Verify RLS is enabled: check the table in Supabase dashboard → Table Editor → RLS toggle shows ON

### Rules

- Always use `IF NOT EXISTS` for idempotent migrations
- Always enable RLS immediately after creating the table
- Always add at least one RLS policy — a table with RLS enabled but no policies denies all access
- Add indexes for any column used in WHERE or ORDER BY clauses
- Use `TIMESTAMPTZ` not `TIMESTAMP` for all date/time fields
- Use `NUMERIC(10,2)` not `FLOAT` for all monetary amounts
