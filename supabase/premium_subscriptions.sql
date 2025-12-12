-- ============================================
-- Premium Subscriptions & Admin Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Add is_admin and is_premium to profiles
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. Create Subscriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due', 'pending')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  paypal_subscription_id TEXT UNIQUE,
  paypal_plan_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. Create Payment History Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL, -- Amount in cents/pence
  currency TEXT DEFAULT 'gbp',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  paypal_payment_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 4. Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_paypal_subscription_id_idx ON public.subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_subscription_id_idx ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- ============================================
-- 5. Function to update is_premium based on subscription
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_premium_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's premium status based on active subscription
  UPDATE public.profiles
  SET is_premium = EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE subscriptions.user_id = NEW.user_id
    AND subscriptions.status = 'active'
    AND subscriptions.current_period_end > NOW()
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Trigger to update premium status on subscription changes
-- ============================================
DROP TRIGGER IF EXISTS update_premium_on_subscription_change ON public.subscriptions;
CREATE TRIGGER update_premium_on_subscription_change
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_premium_status();

-- ============================================
-- 7. Function to check if user has active premium
-- ============================================
CREATE OR REPLACE FUNCTION public.user_has_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND current_period_end > NOW()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid
    AND is_premium = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Enable RLS on new tables
-- ============================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLS Policies for Subscriptions
-- ============================================
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Service role can manage subscriptions (for webhooks)
-- Note: This requires service_role key, handled server-side

-- ============================================
-- 10. RLS Policies for Payments
-- ============================================
-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- ============================================
-- 11. Add updated_at trigger for subscriptions
-- ============================================
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 12. Grant admin access to specific user (example)
-- ============================================
-- To grant admin access, run this with the user's email:
-- UPDATE public.profiles 
-- SET is_admin = TRUE 
-- WHERE email = 'admin@example.com';

-- ============================================
-- Setup Complete!
-- ============================================
-- Your database now includes:
-- ✅ is_admin and is_premium columns in profiles
-- ✅ Subscriptions table for managing premium subscriptions
-- ✅ Payments table for payment history
-- ✅ Automatic premium status updates
-- ✅ RLS policies for security
-- ============================================

