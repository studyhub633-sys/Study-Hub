-- ============================================================
-- Migration: Fix schema for Stripe one-time payments
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Allow 'one_time' plan_type in subscriptions
--    (was only 'monthly' | 'yearly'; backend inserts 'one_time')
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type IN ('monthly', 'yearly', 'one_time'));

-- 2. Allow 'one_time' plan_type in payments
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_plan_type_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_plan_type_check
  CHECK (plan_type IN ('monthly', 'yearly', 'one_time'));

-- 3. Make current_period_end nullable on subscriptions
--    (one-time purchases never expire, so we store NULL)
ALTER TABLE public.subscriptions
  ALTER COLUMN current_period_end DROP NOT NULL;

-- 4. Update the premium-status trigger function so that
--    one-time purchases (current_period_end IS NULL) also grant premium.
--    Previously: only granted when current_period_end > NOW()
--    Now:        also granted when current_period_end IS NULL
CREATE OR REPLACE FUNCTION public.update_user_premium_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET is_premium = EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriptions.user_id = COALESCE(NEW.user_id, OLD.user_id)
      AND subscriptions.status = 'active'
      AND (
        subscriptions.current_period_end IS NULL        -- one-time (never expires)
        OR subscriptions.current_period_end > NOW()     -- recurring (not yet expired)
      )
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Also update the user_has_premium helper function to match
CREATE OR REPLACE FUNCTION public.user_has_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status = 'active'
      AND (
        current_period_end IS NULL
        OR current_period_end > NOW()
      )
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid
      AND is_premium = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
