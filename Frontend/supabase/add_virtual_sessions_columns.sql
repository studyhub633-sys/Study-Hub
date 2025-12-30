-- ============================================
-- Add Missing Columns to Virtual Sessions Table
-- ============================================
-- Run this SQL if you already created the virtual_sessions table
-- This adds the resource linking and email verification columns
-- ============================================

-- Add resource linking columns
ALTER TABLE public.virtual_sessions
ADD COLUMN IF NOT EXISTS linked_past_papers UUID[] DEFAULT ARRAY[]::UUID[];

ALTER TABLE public.virtual_sessions
ADD COLUMN IF NOT EXISTS linked_knowledge_organizers UUID[] DEFAULT ARRAY[]::UUID[];

ALTER TABLE public.virtual_sessions
ADD COLUMN IF NOT EXISTS linked_flashcards TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add email verification columns
ALTER TABLE public.virtual_sessions
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.virtual_sessions
ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- Update RLS policy to handle verification
DROP POLICY IF EXISTS "Anyone can view upcoming and live sessions" ON public.virtual_sessions;

CREATE POLICY "Anyone can view verified upcoming and live sessions"
  ON public.virtual_sessions FOR SELECT
  USING (
    status IN ('upcoming', 'live') AND 
    (email_verified = true OR created_by = auth.uid())
  );

