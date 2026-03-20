-- =========================================================
-- Creator Invites Migration
-- Run this in your Supabase SQL Editor to support automated creator invites
-- =========================================================

CREATE TABLE IF NOT EXISTS creator_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  email TEXT NOT NULL,
  commission_rate NUMERIC DEFAULT 0.2 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '48 hours') NOT NULL,
  used BOOLEAN DEFAULT false NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_creator_invites_token ON creator_invites(token);
CREATE INDEX IF NOT EXISTS idx_creator_invites_email ON creator_invites(email);

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================

ALTER TABLE creator_invites ENABLE ROW LEVEL SECURITY;

-- Only admins should be able to view or manage creator_invites directly.
-- Standard users have no access to this table.
-- The backend API (using service_role key) will bypass RLS.
CREATE POLICY "Admins can view creator invites" ON creator_invites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can insert creator invites" ON creator_invites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update creator invites" ON creator_invites
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
