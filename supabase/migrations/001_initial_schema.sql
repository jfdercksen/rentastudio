-- ============================================================
-- 001_initial_schema.sql — Kyalami Studio
-- ============================================================
-- Idempotent: CREATE TABLE IF NOT EXISTS throughout.
--             DROP POLICY IF EXISTS before every CREATE POLICY.
-- Run in: Supabase SQL Editor → paste → Run
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Client details
  client_name          TEXT NOT NULL,
  client_email         TEXT NOT NULL,
  client_phone         TEXT NOT NULL,

  -- Session details
  booking_date         DATE NOT NULL,
  start_time           TIME NOT NULL,
  end_time             TIME NOT NULL,
  package_type         TEXT NOT NULL,
  duration_type        TEXT NOT NULL,
  is_weekday           BOOLEAN NOT NULL,
  shoot_type           TEXT,
  add_ons              JSONB NOT NULL DEFAULT '[]',

  -- Financials
  subtotal             NUMERIC(10,2) NOT NULL,
  deposit_amount       NUMERIC(10,2) NOT NULL DEFAULT 750,
  total_amount         NUMERIC(10,2) NOT NULL,

  -- PayFast
  payfast_payment_id   TEXT,
  -- Stored as TEXT: PayFast sends amounts as strings; compare as formatted
  -- strings to avoid float precision mismatches (see no-bad-patterns.md)
  payfast_amount_gross TEXT,

  -- Status — only these four values are valid
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show')),

  -- Audit timestamps for state transitions
  confirmed_at         TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,

  -- ID document
  id_document_url      TEXT,

  -- Bank details for deposit refund
  bank_holder_name     TEXT,
  bank_name            TEXT,
  account_number       TEXT,
  branch_code          TEXT,

  notes                TEXT
);

-- Prevent double-booking at the DB level.
-- Partial unique index: only one live booking per (date, start_time).
CREATE UNIQUE INDEX IF NOT EXISTS bookings_no_double_book
  ON bookings (booking_date, start_time)
  WHERE status IN ('pending', 'confirmed');

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can insert bookings" ON bookings;
CREATE POLICY "public can insert bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can select bookings" ON bookings;
CREATE POLICY "service role can select bookings"
  ON bookings FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "service role can update bookings" ON bookings;
CREATE POLICY "service role can update bookings"
  ON bookings FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can delete bookings" ON bookings;
CREATE POLICY "service role can delete bookings"
  ON bookings FOR DELETE
  TO service_role
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- pricing
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_type  TEXT NOT NULL,
  duration_type TEXT NOT NULL,
  is_weekday    BOOLEAN NOT NULL,
  price_rands   NUMERIC(10,2) NOT NULL,

  UNIQUE (package_type, duration_type, is_weekday)
);

ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read pricing" ON pricing;
CREATE POLICY "public can read pricing"
  ON pricing FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "service role can insert pricing" ON pricing;
CREATE POLICY "service role can insert pricing"
  ON pricing FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can update pricing" ON pricing;
CREATE POLICY "service role can update pricing"
  ON pricing FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can delete pricing" ON pricing;
CREATE POLICY "service role can delete pricing"
  ON pricing FOR DELETE
  TO service_role
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- add_ons
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS add_ons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  name          TEXT NOT NULL,
  description   TEXT,
  price_rands   NUMERIC(10,2) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read add_ons" ON add_ons;
CREATE POLICY "public can read add_ons"
  ON add_ons FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "service role can insert add_ons" ON add_ons;
CREATE POLICY "service role can insert add_ons"
  ON add_ons FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can update add_ons" ON add_ons;
CREATE POLICY "service role can update add_ons"
  ON add_ons FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can delete add_ons" ON add_ons;
CREATE POLICY "service role can delete add_ons"
  ON add_ons FOR DELETE
  TO service_role
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- blocked_dates
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_dates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  reason     TEXT,

  CONSTRAINT blocked_dates_range_check CHECK (end_date >= start_date)
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read blocked_dates" ON blocked_dates;
CREATE POLICY "public can read blocked_dates"
  ON blocked_dates FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "service role can insert blocked_dates" ON blocked_dates;
CREATE POLICY "service role can insert blocked_dates"
  ON blocked_dates FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can update blocked_dates" ON blocked_dates;
CREATE POLICY "service role can update blocked_dates"
  ON blocked_dates FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can delete blocked_dates" ON blocked_dates;
CREATE POLICY "service role can delete blocked_dates"
  ON blocked_dates FOR DELETE
  TO service_role
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- site_content
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read site_content" ON site_content;
CREATE POLICY "public can read site_content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "service role can insert site_content" ON site_content;
CREATE POLICY "service role can insert site_content"
  ON site_content FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can update site_content" ON site_content;
CREATE POLICY "service role can update site_content"
  ON site_content FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can delete site_content" ON site_content;
CREATE POLICY "service role can delete site_content"
  ON site_content FOR DELETE
  TO service_role
  USING (true);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_site_content_updated_at();


-- ─────────────────────────────────────────────────────────────
-- gallery_images
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  url           TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text      TEXT NOT NULL
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read gallery_images" ON gallery_images;
CREATE POLICY "public can read gallery_images"
  ON gallery_images FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "service role can insert gallery_images" ON gallery_images;
CREATE POLICY "service role can insert gallery_images"
  ON gallery_images FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can update gallery_images" ON gallery_images;
CREATE POLICY "service role can update gallery_images"
  ON gallery_images FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service role can delete gallery_images" ON gallery_images;
CREATE POLICY "service role can delete gallery_images"
  ON gallery_images FOR DELETE
  TO service_role
  USING (true);
