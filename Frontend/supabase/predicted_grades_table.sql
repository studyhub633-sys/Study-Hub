-- Migration: create predicted_grades table
-- Stores each user's predicted grade inputs so they persist across devices

CREATE TABLE IF NOT EXISTS predicted_grades (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE predicted_grades ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own rows
CREATE POLICY "Users can read own predicted grades"
  ON predicted_grades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own predicted grades"
  ON predicted_grades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predicted grades"
  ON predicted_grades FOR UPDATE
  USING (auth.uid() = user_id);
