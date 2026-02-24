-- ============================================
-- PayPal Payment Migration
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Ensures columns needed for PayPal subscription flow exist
-- (These may already exist if you used PayPal previously)
-- ============================================

-- Add paypal_subscription_id to subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

-- Add paypal_subscription_id to payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

-- Add indexes for quick lookups (especially for webhooks)
CREATE INDEX IF NOT EXISTS subscriptions_paypal_sub_idx ON public.subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS payments_paypal_sub_idx ON public.payments(paypal_subscription_id);

-- ============================================
-- Migration Complete!
-- ============================================
-- Your database now includes:
-- ✅ paypal_subscription_id column in subscriptions
-- ✅ paypal_subscription_id column in payments
-- ✅ Indexes on paypal_subscription_id for fast webhook lookups
-- ============================================
