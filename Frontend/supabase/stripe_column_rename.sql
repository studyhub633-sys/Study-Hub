-- ============================================================
-- Migration: Ensure stripe_payment_intent_id exists cleanly
-- Handles partial migration state safely.
-- ============================================================

-- 1. Ensure stripe_payment_intent_id exists on subscriptions
--    (column may have been lost in a prior partial migration)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- 2. Drop any remaining legacy paypal columns from subscriptions
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS paypal_subscription_id,
  DROP COLUMN IF EXISTS paypal_plan_id;

-- 3. Drop any remaining legacy paypal columns from payments
--    (stripe_payment_intent_id should already exist there)
ALTER TABLE public.payments
  DROP COLUMN IF EXISTS paypal_subscription_id,
  DROP COLUMN IF EXISTS paypal_payment_id;

-- 4. Drop old PayPal-named indexes
DROP INDEX IF EXISTS subscriptions_paypal_sub_idx;
DROP INDEX IF EXISTS payments_paypal_sub_idx;
DROP INDEX IF EXISTS subscriptions_paypal_subscription_id_idx;

-- 5. Ensure Stripe-named indexes exist
CREATE INDEX IF NOT EXISTS subscriptions_stripe_pi_idx ON public.subscriptions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS payments_stripe_pi_idx ON public.payments(stripe_payment_intent_id);
