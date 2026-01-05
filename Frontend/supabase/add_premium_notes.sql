-- ============================================
-- Premium Notes System - Grade 9 Notes
-- ============================================
-- Add grade_level and is_premium fields to notes table
-- ============================================

-- Add grade_level column to notes table
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS grade_level TEXT CHECK (grade_level IN ('9', '10', '11', '12', '13', 'general'));

-- Add is_premium flag (for Grade 9 notes)
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Create index for faster premium note queries
CREATE INDEX IF NOT EXISTS notes_grade_level_idx ON public.notes(grade_level);
CREATE INDEX IF NOT EXISTS notes_is_premium_idx ON public.notes(is_premium);

-- Update RLS to allow premium users to access premium notes
-- Note: This will be checked in the application layer using hasPremium()
-- RLS policies remain the same (users can only see their own notes)

-- ============================================
-- Create global_premium_notes table for Grade 9 notes
-- ============================================
CREATE TABLE IF NOT EXISTS public.global_premium_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  grade_level TEXT DEFAULT '9' CHECK (grade_level IN ('9', '10', '11', '12', '13')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.global_premium_notes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read premium notes (access control in app layer)
DROP POLICY IF EXISTS "Public read access for premium notes" ON public.global_premium_notes;
CREATE POLICY "Public read access for premium notes"
  ON public.global_premium_notes FOR SELECT
  USING (true);

-- ============================================
-- Function to seed premium notes to premium users
-- ============================================
CREATE OR REPLACE FUNCTION public.seed_premium_notes_to_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Only seed if user has premium access
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND is_premium = TRUE
  ) THEN
    INSERT INTO public.notes (user_id, title, content, subject, topic, tags, grade_level, is_premium)
    SELECT 
      user_uuid,
      title,
      content,
      subject,
      topic,
      tags,
      grade_level,
      TRUE
    FROM public.global_premium_notes
    WHERE NOT EXISTS (
      SELECT 1 FROM public.notes n
      WHERE n.user_id = user_uuid
      AND n.title = global_premium_notes.title
      AND n.is_premium = TRUE
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Note: Grade 9 notes will be inserted manually
-- by the admin/user when they provide the content
-- ============================================

