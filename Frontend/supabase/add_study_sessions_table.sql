-- ============================================
-- Study Sessions Table Migration
-- ============================================
-- This table tracks actual study activity for knowledge organizers
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES public.knowledge_organizers(id) ON DELETE CASCADE NOT NULL,
  duration INTEGER DEFAULT 0, -- Duration in seconds
  sections_reviewed INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Array of section indices reviewed
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_organizer_id_idx ON public.study_sessions(organizer_id);
CREATE INDEX IF NOT EXISTS study_sessions_date_idx ON public.study_sessions(date);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own study sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);






