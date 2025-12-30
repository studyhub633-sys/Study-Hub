-- ============================================
-- Virtual Sessions Table
-- ============================================
-- This table stores virtual group revision sessions
-- Run this SQL in your Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.virtual_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  tutor_name TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_room_id TEXT NOT NULL UNIQUE, -- Jitsi room ID
  meeting_url TEXT NOT NULL, -- Full Jitsi Meet URL
  max_attendees INTEGER DEFAULT 50,
  registered_users UUID[] DEFAULT ARRAY[]::UUID[], -- Array of registered user IDs
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS virtual_sessions_created_by_idx ON public.virtual_sessions(created_by);
CREATE INDEX IF NOT EXISTS virtual_sessions_scheduled_time_idx ON public.virtual_sessions(scheduled_time);
CREATE INDEX IF NOT EXISTS virtual_sessions_status_idx ON public.virtual_sessions(status);
CREATE INDEX IF NOT EXISTS virtual_sessions_meeting_room_id_idx ON public.virtual_sessions(meeting_room_id);

-- Enable RLS
ALTER TABLE public.virtual_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view upcoming/live sessions
CREATE POLICY "Anyone can view upcoming and live sessions"
  ON public.virtual_sessions FOR SELECT
  USING (status IN ('upcoming', 'live'));

-- Only creators can insert sessions
CREATE POLICY "Users can create sessions"
  ON public.virtual_sessions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only creators can update their sessions
CREATE POLICY "Creators can update their sessions"
  ON public.virtual_sessions FOR UPDATE
  USING (auth.uid() = created_by);

-- Only creators can delete their sessions
CREATE POLICY "Creators can delete their sessions"
  ON public.virtual_sessions FOR DELETE
  USING (auth.uid() = created_by);

-- Function to generate unique meeting room ID
CREATE OR REPLACE FUNCTION generate_meeting_room_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'study-hub-' || lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));
END;
$$ LANGUAGE plpgsql;

