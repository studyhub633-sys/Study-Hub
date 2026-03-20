-- =========================================================
-- Social Features Migration for Revisely.ai
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. Add XP and study_hours columns to profiles (if they don't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_hours NUMERIC DEFAULT 0;

-- 2. Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate friendships
  UNIQUE(requester_id, addressee_id)
);

-- Indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- 3. Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 5,
  challenger_score INTEGER DEFAULT 0,
  challenged_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for challenges
CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- 4. Create xp_events audit log table
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id);

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================

-- Enable RLS on all new tables
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- Friendships: users can see their own friendships
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

CREATE POLICY "Users can insert friend requests" ON friendships
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id
  );

CREATE POLICY "Users can update friendships they received" ON friendships
  FOR UPDATE USING (
    auth.uid() = addressee_id
  );

CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Challenges: users can see their own challenges
CREATE POLICY "Users can view own challenges" ON challenges
  FOR SELECT USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
  );

CREATE POLICY "Users can create challenges" ON challenges
  FOR INSERT WITH CHECK (
    auth.uid() = challenger_id
  );

CREATE POLICY "Users can update own challenges" ON challenges
  FOR UPDATE USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
  );

CREATE POLICY "Users can delete own challenges" ON challenges
  FOR DELETE USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
  );

-- XP Events: users can view and insert their own events
CREATE POLICY "Users can view own xp_events" ON xp_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp_events" ON xp_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read other users' profiles for leaderboard/friends search
-- (If not already in place)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all profiles for leaderboard' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles for leaderboard" ON profiles
      FOR SELECT USING (true);
  END IF;
END $$;
