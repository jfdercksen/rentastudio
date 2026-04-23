---
name: add-rls-policy
description: Add a Supabase Row Level Security policy for Kyalami Studio. Use when adding new access patterns to existing tables or auditing security on existing policies.
argument-hint: [table-name] [operation: SELECT|INSERT|UPDATE|DELETE|ALL]
allowed-tools: Read, Write, Edit, Bash
---

# Add RLS Policy — Kyalami Studio

Adding RLS policy: $ARGUMENTS

## Live Context

Existing migrations: !`ls supabase/migrations/ 2>/dev/null | tail -10 || echo "No migrations"`

## RLS Policy Patterns for This Project

### Public read-only (pricing, add_ons, gallery, site_content)
```sql
CREATE POLICY "Public can read [table]" ON [table]
  FOR SELECT USING (true);
```

### Public insert with constraint (bookings — pending only)
```sql
CREATE POLICY "Public can create pending bookings" ON bookings
  FOR INSERT WITH CHECK (status = 'pending');
```

### Authenticated admin full access
```sql
CREATE POLICY "Admins full access [table]" ON [table]
  FOR ALL USING (auth.uid() IS NOT NULL);
```

### Authenticated admin specific operation
```sql
CREATE POLICY "Admins can update [table]" ON [table]
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

### Storage: private bucket read
```sql
CREATE POLICY "Admins can read id-documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'id-documents'
    AND auth.uid() IS NOT NULL
  );
```

## Instructions

1. Determine the correct policy pattern from the above
2. Create a new migration file: `supabase/migrations/[NNN]_add_rls_[table]_[operation].sql`
3. Write the policy SQL
4. Remind the developer to apply it in Supabase SQL Editor

### Verification Query (run after applying)

```sql
-- Check all policies on a table
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = '[table-name]';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = '[table-name]';
```

### Warning

A table with RLS enabled but NO policies denies ALL access to all users.
Always add at least one policy after enabling RLS.
