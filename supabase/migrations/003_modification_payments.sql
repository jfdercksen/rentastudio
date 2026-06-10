-- 003_modification_payments.sql
-- Adds payment tracking to booking_modifications for top-up payments
-- when customers add extras via the manage booking portal.

ALTER TABLE booking_modifications
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('pending_payment', 'applied', 'cancelled')),
  ADD COLUMN IF NOT EXISTS payfast_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS top_up_amount NUMERIC(10,2);

-- Partial unique index — only one pending/applied payment per PayFast ID
CREATE UNIQUE INDEX IF NOT EXISTS booking_modifications_payfast_id_idx
  ON booking_modifications (payfast_payment_id)
  WHERE payfast_payment_id IS NOT NULL;
