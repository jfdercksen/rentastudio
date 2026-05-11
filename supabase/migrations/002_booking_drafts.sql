CREATE TABLE IF NOT EXISTS booking_drafts (
  email TEXT PRIMARY KEY,
  draft JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours')
);

ALTER TABLE booking_drafts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own draft
CREATE POLICY "Users can read their own draft"
ON booking_drafts
FOR SELECT
TO authenticated
USING (email = (SELECT auth.email()));

-- Authenticated users can delete their own draft
CREATE POLICY "Users can delete their own draft"
ON booking_drafts
FOR DELETE
TO authenticated
USING (email = (SELECT auth.email()));
