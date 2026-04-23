---
paths:
  - "supabase/**"
  - "src/lib/supabase/**"
  - "src/types/database.ts"
---

# Database Rules — Kyalami Studio

Applies to: all Supabase migrations, Supabase utility files, generated types.

## Migration Rules

- Every schema change requires a migration file in `supabase/migrations/`
- Never edit the Supabase schema directly in Studio without capturing it as SQL
- Migration files are numbered sequentially: `001_`, `002_`, `003_`
- All migrations must be idempotent: use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
- Never use `DROP TABLE` or `DROP COLUMN` in a migration — use `ALTER TABLE ... DROP COLUMN IF EXISTS`

## Column Type Rules

- Monetary amounts: `NUMERIC(10,2)` — never `FLOAT` or `DECIMAL` without precision
- Date fields: `DATE` (no time component) for booking dates
- Time fields: `TIME` for start/end times
- Timestamps: `TIMESTAMPTZ` — never `TIMESTAMP` (always store with timezone)
- IDs: `UUID DEFAULT gen_random_uuid()` — never serial/integer IDs
- Status fields: `TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show'))`
- JSON data (add-ons): `JSONB` — not `JSON` (JSONB is indexed and more efficient)

## RLS Rules (non-negotiable)

Every table in the `public` schema MUST have RLS enabled. Verify:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```
All rows must show `rowsecurity = true`.

A table with RLS enabled but NO policies denies all access. Always add at least one policy immediately after enabling RLS.

## Query Patterns

**Availability check (do not modify this pattern — it prevents double-booking):**
```typescript
// Fetch booked slots — always include 'pending' status (reserved but not yet paid)
const { data: bookedSlots } = await supabase
  .from('bookings')
  .select('start_time, end_time')
  .eq('booking_date', date)
  .in('status', ['confirmed', 'pending'])

// Also check blocked dates
const { data: blocked } = await supabase
  .from('blocked_dates')
  .select('start_date, end_date')
  .lte('start_date', date)
  .gte('end_date', date)
```

**Never use Realtime subscriptions** — they consume Supabase free tier connection limits.

## Type Regeneration

After every migration, regenerate TypeScript types:
```bash
npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database.ts
```

Never hand-write types that correspond to database tables. Always use generated types.
