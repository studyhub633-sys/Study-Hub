-- =========================================================
-- Creator, Docs, and Study Tracker Migration
-- Run this in your Supabase SQL Editor AFTER the social features migration
-- =========================================================

-- 1. Creators table
CREATE TABLE IF NOT EXISTS creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC DEFAULT 0.2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_creators_user ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_code ON creators(code);

-- 2. Creator referrals table
CREATE TABLE IF NOT EXISTS creator_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_paid NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_referrals_creator ON creator_referrals(creator_id);

-- 3. Documents table (for Docs feature)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at DESC);

-- 4. Study sessions table (for Study Tracker)
-- The table already exists from a previous feature, so we add columns if they don't exist
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'General',
ADD COLUMN IF NOT EXISTS duration_minutes NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started ON study_sessions(started_at DESC);

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Creators: can read own profile, anyone can look up by code
CREATE POLICY "Users can view own creator profile" ON creators
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can look up creator by code" ON creators
  FOR SELECT USING (true);

-- Creator referrals: creators can see their own referrals
CREATE POLICY "Creators can view own referrals" ON creator_referrals
  FOR SELECT USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert a referral" ON creator_referrals
  FOR INSERT WITH CHECK (true);

-- Documents: users manage their own docs
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Study sessions: users manage their own sessions
CREATE POLICY "Users can view own study_sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study_sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study_sessions" ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================================
-- Example: Add a creator (run manually per creator)
-- =========================================================
-- INSERT INTO creators (user_id, code, commission_rate)
-- VALUES ('<user-uuid-here>', 'CREATOR20', 0.2);
