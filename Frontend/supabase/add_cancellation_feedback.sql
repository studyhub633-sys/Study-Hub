-- Optional migration: store cancellation feedback on subscriptions
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_detail TEXT;
