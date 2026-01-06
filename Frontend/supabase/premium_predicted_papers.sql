-- ============================================
-- Premium Predicted Papers - 2026 Predicted Papers
-- ============================================
-- Table for exclusive 2026 predicted exam papers (premium feature)
-- ============================================

-- Create premium_predicted_papers table
CREATE TABLE IF NOT EXISTS public.premium_predicted_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  year INTEGER DEFAULT 2026,
  exam_board TEXT,
  tier TEXT CHECK (tier IN ('Foundation', 'Higher', NULL)),
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'link' CHECK (file_type IN ('link', 'upload')),
  description TEXT,
  is_premium BOOLEAN DEFAULT TRUE,
  release_date TIMESTAMP WITH TIME ZONE, -- For "before public release" logic
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.premium_predicted_papers ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Public read access for premium predicted papers" ON public.premium_predicted_papers;

-- Allow all authenticated users to read (access control in app layer via premium check)
CREATE POLICY "Public read access for premium predicted papers"
  ON public.premium_predicted_papers FOR SELECT
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS premium_predicted_papers_subject_idx ON public.premium_predicted_papers(subject);
CREATE INDEX IF NOT EXISTS premium_predicted_papers_exam_board_idx ON public.premium_predicted_papers(exam_board);
CREATE INDEX IF NOT EXISTS premium_predicted_papers_year_idx ON public.premium_predicted_papers(year);
CREATE INDEX IF NOT EXISTS premium_predicted_papers_is_premium_idx ON public.premium_predicted_papers(is_premium);

-- ============================================
-- Note: Predicted papers will be inserted manually
-- by the admin when they are ready
-- ============================================

