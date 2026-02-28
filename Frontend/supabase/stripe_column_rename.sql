-- ============================================================
-- Migration: Rename paypal_subscription_id → stripe_payment_intent_id
-- Run this in the Supabase SQL editor BEFORE or simultaneously
-- with the code deployment.
-- ============================================================

-- 1. Rename column in subscriptions
ALTER TABLE public.subscriptions
  RENAME COLUMN paypal_subscription_id TO stripe_payment_intent_id;

-- 2. Rename column in payments
ALTER TABLE public.payments
  RENAME COLUMN paypal_subscription_id TO stripe_payment_intent_id;

-- 3. Drop old PayPal-named indexes (they are auto-renamed but let's be explicit)
DROP INDEX IF EXISTS subscriptions_paypal_sub_idx;
DROP INDEX IF EXISTS payments_paypal_sub_idx;
DROP INDEX IF EXISTS subscriptions_paypal_subscription_id_idx;

-- 4. Create new Stripe-named indexes
CREATE INDEX IF NOT EXISTS subscriptions_stripe_pi_idx ON public.subscriptions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS payments_stripe_pi_idx ON public.payments(stripe_payment_intent_id);
