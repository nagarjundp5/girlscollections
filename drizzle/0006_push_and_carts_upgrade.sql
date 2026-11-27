-- Migration: 0006_push_and_carts_upgrade
-- Adds user_id + push topic preferences to push_subscriptions
-- Adds status + reminder fields to user_carts

-- 1. push_subscriptions: add user_id, topics columns
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS topic_orders boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS topic_offers boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions (user_id);

-- 2. user_carts: add status, total, reminder fields
ALTER TABLE user_carts
  ADD COLUMN IF NOT EXISTS total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0;

-- 3. notification_logs: add clicked_count and audience_type expansion
ALTER TABLE notification_logs
  ADD COLUMN IF NOT EXISTS clicked_count integer NOT NULL DEFAULT 0;
