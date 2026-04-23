-- ============================================================
-- seed.sql — Kyalami Studio
-- ============================================================
-- Default pricing, add-ons, and site content.
-- Run AFTER 001_initial_schema.sql.
-- Safe to re-run: ON CONFLICT DO NOTHING throughout.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- pricing (12 rows — all package × duration × weekday combos)
-- ─────────────────────────────────────────────────────────────
INSERT INTO pricing (package_type, duration_type, is_weekday, price_rands) VALUES
  ('studio_only',   'hourly',    true,   550.00),
  ('studio_only',   'hourly',    false,  650.00),
  ('studio_only',   'half_day',  true,  1800.00),
  ('studio_only',   'half_day',  false, 2200.00),
  ('studio_only',   'full_day',  true,  3200.00),
  ('studio_only',   'full_day',  false, 3800.00),
  ('all_inclusive', 'hourly',    true,   850.00),
  ('all_inclusive', 'hourly',    false,  950.00),
  ('all_inclusive', 'half_day',  true,  2800.00),
  ('all_inclusive', 'half_day',  false, 3200.00),
  ('all_inclusive', 'full_day',  true,  4800.00),
  ('all_inclusive', 'full_day',  false, 5500.00)
ON CONFLICT (package_type, duration_type, is_weekday) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- add_ons
-- ─────────────────────────────────────────────────────────────
INSERT INTO add_ons (name, price_rands, is_active, display_order) VALUES
  ('Ring light',         150.00, true, 1),
  ('Extra backdrop',     200.00, true, 2),
  ('Teleprompter',       300.00, true, 3),
  ('Wireless mic set',   250.00, true, 4),
  ('Extra HDMI monitor', 150.00, true, 5),
  ('Green screen',       350.00, true, 6)
ON CONFLICT DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- site_content
-- ─────────────────────────────────────────────────────────────
INSERT INTO site_content (key, value) VALUES
  ('space_description',
   'A professional content creation studio designed for creators who mean business.'),

  ('amenities',
   '["High-speed fibre WiFi","Air conditioning","Private change room","On-site parking","Kitchenette access","Natural light option"]'),

  ('faq_items',
   '[{"question":"How do I book?","answer":"Complete the online booking form and pay the deposit to secure your session."},{"question":"What is the deposit?","answer":"A refundable R750 deposit is required to secure your booking."},{"question":"Can I cancel?","answer":"Cancellations with 48 hours notice receive a full deposit refund."}]'),

  ('terms_conditions',
   'Full terms and conditions to be provided by the studio owner. Replace this placeholder before launch.'),

  ('footer_address', 'Kyalami Estates, Johannesburg, South Africa'),

  ('footer_phone', '+27 00 000 0000')

ON CONFLICT (key) DO NOTHING;
