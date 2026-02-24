-- ============================================
-- Wise Payment Migration
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Adds columns needed for Wise bank transfer flow
-- ============================================

-- Add payment_reference to subscriptions (for matching bank transfers)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add wise_transfer_id to payments (optional, for admin to record Wise transfer ID)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS wise_transfer_id TEXT;

-- Index on payment_reference for quick lookups
CREATE INDEX IF NOT EXISTS subscriptions_payment_reference_idx ON public.subscriptions(payment_reference);

-- ============================================
-- Migration Complete!
-- ============================================
-- Your database now includes:
-- ✅ payment_reference column in subscriptions
-- ✅ wise_transfer_id column in payments
-- ✅ Index on payment_reference for fast lookups
-- Note: Existing paypal_* columns are kept but unused
-- ============================================
