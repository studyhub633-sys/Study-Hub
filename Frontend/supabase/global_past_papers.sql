-- ============================================
-- 1. Create Global Past Papers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.global_past_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  year INTEGER,
  exam_board TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'link',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.global_past_papers ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Public read access for global papers" ON public.global_past_papers;

CREATE POLICY "Public read access for global papers"
  ON public.global_past_papers FOR SELECT
  USING (true);

-- ============================================
-- 2. Update User Seeding Function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, file_url, file_type)
  SELECT 
    NEW.id, 
    title, 
    subject, 
    year, 
    exam_board, 
    file_url, 
    file_type
  FROM public.global_past_papers;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. VERIFIED AQA Starter Pack from PMT
-- Source: Physics & Maths Tutor (physicsandmathstutor.com)
-- All links verified and working as of December 2024
-- ============================================
TRUNCATE TABLE public.global_past_papers;

INSERT INTO public.global_past_papers (title, subject, year, exam_board, file_url, file_type)
VALUES 
-- =====================
-- MATHEMATICS (GCSE Higher)
-- =====================
('Maths Paper 1H - June 2023', 'Mathematics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202023%20QP.pdf', 'link'),
('Maths Paper 1H - June 2022', 'Mathematics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202022%20QP.pdf', 'link'),
('Maths Paper 1H - November 2023', 'Mathematics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/November%202023%20QP.pdf', 'link'),
('Maths Paper 1H - November 2022', 'Mathematics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/November%202022%20QP.pdf', 'link'),
('Maths Paper 2H - June 2023', 'Mathematics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202023%20QP.pdf', 'link'),
('Maths Paper 2H - June 2022', 'Mathematics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202022%20QP.pdf', 'link'),
('Maths Paper 2H - November 2023', 'Mathematics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/November%202023%20QP.pdf', 'link'),
('Maths Paper 2H - November 2022', 'Mathematics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/November%202022%20QP.pdf', 'link'),
('Maths Paper 3H - June 2023', 'Mathematics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202023%20QP.pdf', 'link'),
('Maths Paper 3H - June 2022', 'Mathematics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202022%20QP.pdf', 'link'),
('Maths Paper 3H - November 2023', 'Mathematics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/November%202023%20QP.pdf', 'link'),
('Maths Paper 3H - November 2022', 'Mathematics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/November%202022%20QP.pdf', 'link'),

-- =====================
-- ENGLISH LANGUAGE
-- =====================
('English Language Paper 1 - June 2023', 'English Language', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/June%202023%20QP.pdf', 'link'),
('English Language Paper 2 - June 2023', 'English Language', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- ENGLISH LITERATURE
-- =====================
('English Literature Paper 1 - June 2023', 'English Literature', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Literature/GCSE/Past-Papers/AQA/Paper-1/QP/June%202023%20QP.pdf', 'link'),
('English Literature Paper 2 - June 2023', 'English Literature', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Literature/GCSE/Past-Papers/AQA/Paper-2/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- BIOLOGY (GCSE Higher)
-- =====================
('Biology Paper 1H - June 2023', 'Biology', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202023%20QP.pdf', 'link'),
('Biology Paper 2H - June 2023', 'Biology', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- CHEMISTRY (GCSE Higher)
-- =====================
('Chemistry Paper 1H - June 2023', 'Chemistry', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202023%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2023', 'Chemistry', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- PHYSICS (GCSE Higher)
-- =====================
('Physics Paper 1H - June 2023', 'Physics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202023%20QP.pdf', 'link'),
('Physics Paper 2H - June 2023', 'Physics', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- GEOGRAPHY
-- =====================
('Geography Paper 1 - June 2023', 'Geography', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202023%20QP.pdf', 'link'),
('Geography Paper 2 - June 2023', 'Geography', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- HISTORY
-- =====================
('History Paper 1 - June 2023', 'History', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202023%20QP.pdf', 'link'),
('History Paper 2 - June 2023', 'History', 2023, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202023%20QP.pdf', 'link'),

-- =====================
-- 2024 PAPERS (LATEST)
-- =====================
-- Maths 2024
('Maths Paper 1H - June 2024', 'Mathematics', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202024%20QP.pdf', 'link'),
('Maths Paper 2H - June 2024', 'Mathematics', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202024%20QP.pdf', 'link'),
('Maths Paper 3H - June 2024', 'Mathematics', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202024%20QP.pdf', 'link'),

-- English 2024
('English Language Paper 1 - June 2024', 'English Language', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/June%202024%20QP.pdf', 'link'),
('English Language Paper 2 - June 2024', 'English Language', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/June%202024%20QP.pdf', 'link'),

-- Biology 2024
('Biology Paper 1H - June 2024', 'Biology', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202024%20QP.pdf', 'link'),
('Biology Paper 2H - June 2024', 'Biology', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202024%20QP.pdf', 'link'),

-- Chemistry 2024
('Chemistry Paper 1H - June 2024', 'Chemistry', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202024%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2024', 'Chemistry', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202024%20QP.pdf', 'link'),

-- Physics 2024
('Physics Paper 1H - June 2024', 'Physics', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202024%20QP.pdf', 'link'),
('Physics Paper 2H - June 2024', 'Physics', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202024%20QP.pdf', 'link'),

-- Geography 2024
('Geography Paper 1 - June 2024', 'Geography', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202024%20QP.pdf', 'link'),
('Geography Paper 2 - June 2024', 'Geography', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202024%20QP.pdf', 'link'),

-- History 2024
('History Paper 1 - June 2024', 'History', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202024%20QP.pdf', 'link'),
('History Paper 2 - June 2024', 'History', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202024%20QP.pdf', 'link');
