-- 0005_onboarding_and_location.sql
-- Idempotent migration for missing user onboarding flag and address location columns

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

ALTER TABLE addresses
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS location_source text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS location_updated_at timestamp with time zone;

