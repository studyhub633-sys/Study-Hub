-- ============================================
-- Email Subscriptions Table for Marketing
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: Dashboard → SQL Editor → New Query
-- ============================================

-- Create email_subscriptions table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing_page',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_is_active ON public.email_subscriptions(is_active);

-- Enable Row Level Security
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for newsletter signup)
CREATE POLICY "Allow public inserts for email subscriptions"
  ON public.email_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only allow admins to view all subscriptions
CREATE POLICY "Admins can view all email subscriptions"
  ON public.email_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Allow users to unsubscribe themselves (update their own email)
CREATE POLICY "Users can update their own subscription"
  ON public.email_subscriptions FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================
-- Notes:
-- - This table stores email addresses for marketing purposes
-- - Public users can subscribe via the landing page
-- - Users can unsubscribe by updating their subscription
-- - Admins can view all subscriptions for marketing purposes
-- ============================================








