-- ============================================================
-- 002_booking_management.sql — Kyalami Studio
-- Features: Customer portal tokens, time slot blocking,
--           abandoned booking tracking, booking modifications audit
-- ============================================================
-- Idempotent: CREATE TABLE IF NOT EXISTS throughout.
-- Run in: Supabase SQL Editor → paste → Run
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- booking_access_tokens
-- Secure tokens that allow customers to manage their confirmed booking.
-- Generated server-side on booking confirmation (ITN or free booking).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_access_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS booking_access_tokens_token_idx
  ON booking_access_tokens (token);

CREATE INDEX IF NOT EXISTS booking_access_tokens_booking_id_idx
  ON booking_access_tokens (booking_id);

ALTER TABLE booking_access_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role can manage booking_access_tokens" ON booking_access_tokens;
CREATE POLICY "service role can manage booking_access_tokens"
  ON booking_access_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- blocked_time_slots
-- Admin can block specific time ranges on specific dates.
-- Complements blocked_dates (which blocks entire days).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  slot_date  DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  reason     TEXT,

  CONSTRAINT blocked_time_slots_range_check CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS blocked_time_slots_date_idx
  ON blocked_time_slots (slot_date);

ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read blocked_time_slots" ON blocked_time_slots;
CREATE POLICY "public can read blocked_time_slots"
  ON blocked_time_slots FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "service role can manage blocked_time_slots" ON blocked_time_slots;
CREATE POLICY "service role can manage blocked_time_slots"
  ON blocked_time_slots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- abandoned_bookings
-- Tracks visitors who start the booking flow, provide contact
-- details, but do not complete payment.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS abandoned_bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  client_name      TEXT NOT NULL,
  client_email     TEXT NOT NULL,
  client_phone     TEXT,

  -- Snapshot of what they were booking
  booking_details  JSONB NOT NULL DEFAULT '{}',

  -- How far they got: 'details' | 'verification' | 'payment'
  step_reached     TEXT NOT NULL DEFAULT 'details',

  -- Recovery email sequence
  email_1_sent_at  TIMESTAMPTZ,
  email_2_sent_at  TIMESTAMPTZ,
  email_3_sent_at  TIMESTAMPTZ,

  -- Set to true when they complete the booking
  is_recovered     BOOLEAN NOT NULL DEFAULT false,
  recovered_at     TIMESTAMPTZ
);

-- One record per email (upsert on client_email)
CREATE UNIQUE INDEX IF NOT EXISTS abandoned_bookings_email_idx
  ON abandoned_bookings (client_email)
  WHERE is_recovered = false;

ALTER TABLE abandoned_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can insert abandoned_bookings" ON abandoned_bookings;
CREATE POLICY "anon can insert abandoned_bookings"
  ON abandoned_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can manage abandoned_bookings" ON abandoned_bookings;
CREATE POLICY "service role can manage abandoned_bookings"
  ON abandoned_bookings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION update_abandoned_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS abandoned_bookings_updated_at ON abandoned_bookings;
CREATE TRIGGER abandoned_bookings_updated_at
  BEFORE UPDATE ON abandoned_bookings
  FOR EACH ROW EXECUTE FUNCTION update_abandoned_bookings_updated_at();


-- ─────────────────────────────────────────────────────────────
-- booking_modifications
-- Audit log of every change a customer makes to their booking
-- via the self-service portal.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_modifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  booking_id        UUID NOT NULL,

  -- 'reschedule' | 'add_ons' | 'duration_change' | 'mixed'
  modification_type TEXT NOT NULL,

  -- Snapshots for audit trail
  old_values        JSONB NOT NULL DEFAULT '{}',
  new_values        JSONB NOT NULL DEFAULT '{}',

  -- 'customer' (via portal) or 'admin' (via dashboard)
  modified_by       TEXT NOT NULL DEFAULT 'customer'
);

CREATE INDEX IF NOT EXISTS booking_modifications_booking_id_idx
  ON booking_modifications (booking_id);

CREATE INDEX IF NOT EXISTS booking_modifications_created_at_idx
  ON booking_modifications (created_at DESC);

ALTER TABLE booking_modifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role can manage booking_modifications" ON booking_modifications;
CREATE POLICY "service role can manage booking_modifications"
  ON booking_modifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
