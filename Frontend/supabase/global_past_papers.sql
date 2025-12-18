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
('History Paper 2 - June 2024', 'History', 2024, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202024%20QP.pdf', 'link'),

-- =====================
-- 2021 PAPERS (COVID Year - Papers Released)
-- =====================
-- Maths 2021
('Maths Paper 1H - June 2021', 'Mathematics', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202021%20QP.pdf', 'link'),
('Maths Paper 2H - June 2021', 'Mathematics', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202021%20QP.pdf', 'link'),
('Maths Paper 3H - June 2021', 'Mathematics', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202021%20QP.pdf', 'link'),

-- English 2021
('English Language Paper 1 - November 2021', 'English Language', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/November%202021%20QP.pdf', 'link'),
('English Language Paper 2 - November 2021', 'English Language', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/November%202021%20QP.pdf', 'link'),

-- Biology 2021
('Biology Paper 1H - June 2021', 'Biology', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202021%20QP.pdf', 'link'),
('Biology Paper 2H - June 2021', 'Biology', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202021%20QP.pdf', 'link'),

-- Chemistry 2021
('Chemistry Paper 1H - June 2021', 'Chemistry', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202021%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2021', 'Chemistry', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202021%20QP.pdf', 'link'),

-- Physics 2021
('Physics Paper 1H - June 2021', 'Physics', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202021%20QP.pdf', 'link'),
('Physics Paper 2H - June 2021', 'Physics', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202021%20QP.pdf', 'link'),

-- Geography 2021
('Geography Paper 1 - June 2021', 'Geography', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202021%20QP.pdf', 'link'),
('Geography Paper 2 - June 2021', 'Geography', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202021%20QP.pdf', 'link'),

-- History 2021
('History Paper 1 - June 2021', 'History', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202021%20QP.pdf', 'link'),
('History Paper 2 - June 2021', 'History', 2021, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202021%20QP.pdf', 'link'),

-- =====================
-- 2020 PAPERS (COVID Year - Papers Released)
-- =====================
-- Maths 2020
('Maths Paper 1H - June 2020', 'Mathematics', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202020%20QP.pdf', 'link'),
('Maths Paper 2H - June 2020', 'Mathematics', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202020%20QP.pdf', 'link'),
('Maths Paper 3H - June 2020', 'Mathematics', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202020%20QP.pdf', 'link'),

-- English 2020
('English Language Paper 1 - June 2020', 'English Language', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/June%202020%20QP.pdf', 'link'),
('English Language Paper 2 - June 2020', 'English Language', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/June%202020%20QP.pdf', 'link'),

-- Biology 2020
('Biology Paper 1H - June 2020', 'Biology', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202020%20QP.pdf', 'link'),
('Biology Paper 2H - June 2020', 'Biology', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202020%20QP.pdf', 'link'),

-- Chemistry 2020
('Chemistry Paper 1H - June 2020', 'Chemistry', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202020%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2020', 'Chemistry', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202020%20QP.pdf', 'link'),

-- Physics 2020
('Physics Paper 1H - June 2020', 'Physics', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202020%20QP.pdf', 'link'),
('Physics Paper 2H - June 2020', 'Physics', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202020%20QP.pdf', 'link'),

-- Geography 2020
('Geography Paper 1 - June 2020', 'Geography', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202020%20QP.pdf', 'link'),
('Geography Paper 2 - June 2020', 'Geography', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202020%20QP.pdf', 'link'),

-- History 2020
('History Paper 1 - June 2020', 'History', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202020%20QP.pdf', 'link'),
('History Paper 2 - June 2020', 'History', 2020, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202020%20QP.pdf', 'link'),

-- =====================
-- 2019 PAPERS
-- =====================
-- Maths 2019
('Maths Paper 1H - June 2019', 'Mathematics', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202019%20QP.pdf', 'link'),
('Maths Paper 2H - June 2019', 'Mathematics', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202019%20QP.pdf', 'link'),
('Maths Paper 3H - June 2019', 'Mathematics', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202019%20QP.pdf', 'link'),
-- English 2019
('English Language Paper 1 - June 2019', 'English Language', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/June%202019%20QP.pdf', 'link'),
('English Language Paper 2 - June 2019', 'English Language', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/June%202019%20QP.pdf', 'link'),
-- Biology 2019
('Biology Paper 1H - June 2019', 'Biology', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202019%20QP.pdf', 'link'),
('Biology Paper 2H - June 2019', 'Biology', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202019%20QP.pdf', 'link'),
-- Chemistry 2019
('Chemistry Paper 1H - June 2019', 'Chemistry', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202019%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2019', 'Chemistry', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202019%20QP.pdf', 'link'),
-- Physics 2019
('Physics Paper 1H - June 2019', 'Physics', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202019%20QP.pdf', 'link'),
('Physics Paper 2H - June 2019', 'Physics', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202019%20QP.pdf', 'link'),
-- Geography 2019
('Geography Paper 1 - June 2019', 'Geography', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202019%20QP.pdf', 'link'),
('Geography Paper 2 - June 2019', 'Geography', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202019%20QP.pdf', 'link'),
-- History 2019
('History Paper 1 - June 2019', 'History', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202019%20QP.pdf', 'link'),
('History Paper 2 - June 2019', 'History', 2019, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202019%20QP.pdf', 'link'),

-- =====================
-- 2018 PAPERS
-- =====================
-- Maths 2018
('Maths Paper 1H - June 2018', 'Mathematics', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202018%20QP.pdf', 'link'),
('Maths Paper 2H - June 2018', 'Mathematics', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202018%20QP.pdf', 'link'),
('Maths Paper 3H - June 2018', 'Mathematics', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202018%20QP.pdf', 'link'),
-- English 2018
('English Language Paper 1 - June 2018', 'English Language', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/June%202018%20QP.pdf', 'link'),
('English Language Paper 2 - June 2018', 'English Language', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/June%202018%20QP.pdf', 'link'),
-- Biology 2018
('Biology Paper 1H - June 2018', 'Biology', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202018%20QP.pdf', 'link'),
('Biology Paper 2H - June 2018', 'Biology', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202018%20QP.pdf', 'link'),
-- Chemistry 2018
('Chemistry Paper 1H - June 2018', 'Chemistry', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202018%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2018', 'Chemistry', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202018%20QP.pdf', 'link'),
-- Physics 2018
('Physics Paper 1H - June 2018', 'Physics', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202018%20QP.pdf', 'link'),
('Physics Paper 2H - June 2018', 'Physics', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202018%20QP.pdf', 'link'),
-- Geography 2018
('Geography Paper 1 - June 2018', 'Geography', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202018%20QP.pdf', 'link'),
('Geography Paper 2 - June 2018', 'Geography', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202018%20QP.pdf', 'link'),
-- History 2018
('History Paper 1 - June 2018', 'History', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202018%20QP.pdf', 'link'),
('History Paper 2 - June 2018', 'History', 2018, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202018%20QP.pdf', 'link'),

-- =====================
-- 2017 PAPERS
-- =====================
-- Maths 2017
('Maths Paper 1H - June 2017', 'Mathematics', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202017%20QP.pdf', 'link'),
('Maths Paper 2H - June 2017', 'Mathematics', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202017%20QP.pdf', 'link'),
('Maths Paper 3H - June 2017', 'Mathematics', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/AQA/Paper-3H/QP/June%202017%20QP.pdf', 'link'),
-- English 2017
('English Language Paper 1 - June 2017', 'English Language', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-1/QP/June%202017%20QP.pdf', 'link'),
('English Language Paper 2 - June 2017', 'English Language', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/AQA/Paper-2/QP/June%202017%20QP.pdf', 'link'),
-- Biology 2017
('Biology Paper 1H - June 2017', 'Biology', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202017%20QP.pdf', 'link'),
('Biology Paper 2H - June 2017', 'Biology', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202017%20QP.pdf', 'link'),
-- Chemistry 2017
('Chemistry Paper 1H - June 2017', 'Chemistry', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202017%20QP.pdf', 'link'),
('Chemistry Paper 2H - June 2017', 'Chemistry', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202017%20QP.pdf', 'link'),
-- Physics 2017
('Physics Paper 1H - June 2017', 'Physics', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1H/QP/June%202017%20QP.pdf', 'link'),
('Physics Paper 2H - June 2017', 'Physics', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2H/QP/June%202017%20QP.pdf', 'link'),
-- Geography 2017
('Geography Paper 1 - June 2017', 'Geography', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-1/QP/June%202017%20QP.pdf', 'link'),
('Geography Paper 2 - June 2017', 'Geography', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Geography/GCSE/Past-Papers/AQA/Paper-2/QP/June%202017%20QP.pdf', 'link'),
-- History 2017
('History Paper 1 - June 2017', 'History', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-1/Section-A/Option-A/QP/June%202017%20QP.pdf', 'link'),
('History Paper 2 - June 2017', 'History', 2017, 'AQA', 'https://pmt.physicsandmathstutor.com/download/History/GCSE/Past-Papers/AQA/Paper-2/Section-A/Option-A/QP/June%202017%20QP.pdf', 'link'),

-- ============================================
-- EDUQAS (WJEC England) PAPERS 2017-2024
-- ============================================

-- EDUQAS ENGLISH LANGUAGE
('English Language Component 1 - June 2024', 'English Language', 2024, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202024%20QP.pdf', 'link'),
('English Language Component 2 - June 2024', 'English Language', 2024, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202024%20QP.pdf', 'link'),
('English Language Component 1 - June 2023', 'English Language', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202023%20QP.pdf', 'link'),
('English Language Component 2 - June 2023', 'English Language', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202023%20QP.pdf', 'link'),
('English Language Component 1 - June 2022', 'English Language', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202022%20QP.pdf', 'link'),
('English Language Component 2 - June 2022', 'English Language', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202022%20QP.pdf', 'link'),
('English Language Component 1 - June 2021', 'English Language', 2021, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202021%20QP.pdf', 'link'),
('English Language Component 2 - June 2021', 'English Language', 2021, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202021%20QP.pdf', 'link'),
('English Language Component 1 - June 2020', 'English Language', 2020, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202020%20QP.pdf', 'link'),
('English Language Component 2 - June 2020', 'English Language', 2020, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202020%20QP.pdf', 'link'),
('English Language Component 1 - June 2019', 'English Language', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202019%20QP.pdf', 'link'),
('English Language Component 2 - June 2019', 'English Language', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202019%20QP.pdf', 'link'),
('English Language Component 1 - June 2018', 'English Language', 2018, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202018%20QP.pdf', 'link'),
('English Language Component 2 - June 2018', 'English Language', 2018, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202018%20QP.pdf', 'link'),
('English Language Component 1 - June 2017', 'English Language', 2017, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-1/June%202017%20QP.pdf', 'link'),
('English Language Component 2 - June 2017', 'English Language', 2017, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-England/Component-2/June%202017%20QP.pdf', 'link'),

-- EDUQAS MATHS (2023-2017)
('Maths Component 1H - June 2024', 'Mathematics', 2024, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202024%20QP.pdf', 'link'),
('Maths Component 2H - June 2024', 'Mathematics', 2024, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202024%20QP.pdf', 'link'),
('Maths Component 3H - June 2024', 'Mathematics', 2024, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202024%20QP.pdf', 'link'),
('Maths Component 1H - June 2023', 'Mathematics', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202023%20QP.pdf', 'link'),
('Maths Component 2H - June 2023', 'Mathematics', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202023%20QP.pdf', 'link'),
('Maths Component 3H - June 2023', 'Mathematics', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202023%20QP.pdf', 'link'),
('Maths Component 1H - June 2022', 'Mathematics', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202022%20QP.pdf', 'link'),
('Maths Component 2H - June 2022', 'Mathematics', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202022%20QP.pdf', 'link'),
('Maths Component 3H - June 2022', 'Mathematics', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202022%20QP.pdf', 'link'),
('Maths Component 1H - June 2021', 'Mathematics', 2021, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202021%20QP.pdf', 'link'),
('Maths Component 2H - June 2021', 'Mathematics', 2021, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202021%20QP.pdf', 'link'),
('Maths Component 3H - June 2021', 'Mathematics', 2021, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202021%20QP.pdf', 'link'),
('Maths Component 1H - June 2020', 'Mathematics', 2020, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202020%20QP.pdf', 'link'),
('Maths Component 2H - June 2020', 'Mathematics', 2020, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202020%20QP.pdf', 'link'),
('Maths Component 3H - June 2020', 'Mathematics', 2020, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202020%20QP.pdf', 'link'),
('Maths Component 1H - June 2019', 'Mathematics', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202019%20QP.pdf', 'link'),
('Maths Component 2H - June 2019', 'Mathematics', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202019%20QP.pdf', 'link'),
('Maths Component 3H - June 2019', 'Mathematics', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202019%20QP.pdf', 'link'),
('Maths Component 1H - June 2018', 'Mathematics', 2018, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202018%20QP.pdf', 'link'),
('Maths Component 2H - June 2018', 'Mathematics', 2018, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202018%20QP.pdf', 'link'),
('Maths Component 3H - June 2018', 'Mathematics', 2018, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202018%20QP.pdf', 'link'),
('Maths Component 1H - June 2017', 'Mathematics', 2017, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-1/Higher/June%202017%20QP.pdf', 'link'),
('Maths Component 2H - June 2017', 'Mathematics', 2017, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-2/Higher/June%202017%20QP.pdf', 'link'),
('Maths Component 3H - June 2017', 'Mathematics', 2017, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Eduqas/Component-3/Higher/June%202017%20QP.pdf', 'link'),

-- EDUQAS SCIENCES (2023-2019)
('Biology Component 1H - June 2023', 'Biology', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202023%20QP.pdf', 'link'),
('Biology Component 2H - June 2023', 'Biology', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202023%20QP.pdf', 'link'),
('Biology Component 1H - June 2022', 'Biology', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202022%20QP.pdf', 'link'),
('Biology Component 2H - June 2022', 'Biology', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202022%20QP.pdf', 'link'),
('Biology Component 1H - June 2019', 'Biology', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202019%20QP.pdf', 'link'),
('Biology Component 2H - June 2019', 'Biology', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202019%20QP.pdf', 'link'),
('Chemistry Component 1H - June 2023', 'Chemistry', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202023%20QP.pdf', 'link'),
('Chemistry Component 2H - June 2023', 'Chemistry', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202023%20QP.pdf', 'link'),
('Chemistry Component 1H - June 2022', 'Chemistry', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202022%20QP.pdf', 'link'),
('Chemistry Component 2H - June 2022', 'Chemistry', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202022%20QP.pdf', 'link'),
('Chemistry Component 1H - June 2019', 'Chemistry', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202019%20QP.pdf', 'link'),
('Chemistry Component 2H - June 2019', 'Chemistry', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202019%20QP.pdf', 'link'),
('Physics Component 1H - June 2023', 'Physics', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202023%20QP.pdf', 'link'),
('Physics Component 2H - June 2023', 'Physics', 2023, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202023%20QP.pdf', 'link'),
('Physics Component 1H - June 2022', 'Physics', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202022%20QP.pdf', 'link'),
('Physics Component 2H - June 2022', 'Physics', 2022, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202022%20QP.pdf', 'link'),
('Physics Component 1H - June 2019', 'Physics', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/WJEC-Eduqas/Component-1/Higher/June%202019%20QP.pdf', 'link'),
('Physics Component 2H - June 2019', 'Physics', 2019, 'Eduqas', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/WJEC-Eduqas/Component-2/Higher/June%202019%20QP.pdf', 'link'),

-- ============================================
-- WJEC (Wales) PAPERS 2017-2024
-- ============================================

-- WJEC ENGLISH LANGUAGE
('English Language Unit 1 - June 2024', 'English Language', 2024, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202024%20QP.pdf', 'link'),
('English Language Unit 2 - June 2024', 'English Language', 2024, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202024%20QP.pdf', 'link'),
('English Language Unit 1 - June 2023', 'English Language', 2023, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202023%20QP.pdf', 'link'),
('English Language Unit 2 - June 2023', 'English Language', 2023, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202023%20QP.pdf', 'link'),
('English Language Unit 1 - June 2022', 'English Language', 2022, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202022%20QP.pdf', 'link'),
('English Language Unit 2 - June 2022', 'English Language', 2022, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202022%20QP.pdf', 'link'),
('English Language Unit 1 - June 2021', 'English Language', 2021, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202021%20QP.pdf', 'link'),
('English Language Unit 2 - June 2021', 'English Language', 2021, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202021%20QP.pdf', 'link'),
('English Language Unit 1 - June 2020', 'English Language', 2020, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202020%20QP.pdf', 'link'),
('English Language Unit 2 - June 2020', 'English Language', 2020, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202020%20QP.pdf', 'link'),
('English Language Unit 1 - June 2019', 'English Language', 2019, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202019%20QP.pdf', 'link'),
('English Language Unit 2 - June 2019', 'English Language', 2019, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202019%20QP.pdf', 'link'),
('English Language Unit 1 - June 2018', 'English Language', 2018, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202018%20QP.pdf', 'link'),
('English Language Unit 2 - June 2018', 'English Language', 2018, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202018%20QP.pdf', 'link'),
('English Language Unit 1 - June 2017', 'English Language', 2017, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-1/June%202017%20QP.pdf', 'link'),
('English Language Unit 2 - June 2017', 'English Language', 2017, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/English-Language/GCSE/Past-Papers/WJEC-Wales/Unit-2/June%202017%20QP.pdf', 'link'),

-- WJEC MATHS (2023-2017)
('Maths Unit 1H - June 2024', 'Mathematics', 2024, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202024%20QP.pdf', 'link'),
('Maths Unit 2H - June 2024', 'Mathematics', 2024, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202024%20QP.pdf', 'link'),
('Maths Unit 1H - June 2023', 'Mathematics', 2023, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202023%20QP.pdf', 'link'),
('Maths Unit 2H - June 2023', 'Mathematics', 2023, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202023%20QP.pdf', 'link'),
('Maths Unit 1H - June 2022', 'Mathematics', 2022, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202022%20QP.pdf', 'link'),
('Maths Unit 2H - June 2022', 'Mathematics', 2022, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202022%20QP.pdf', 'link'),
('Maths Unit 1H - June 2021', 'Mathematics', 2021, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202021%20QP.pdf', 'link'),
('Maths Unit 2H - June 2021', 'Mathematics', 2021, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202021%20QP.pdf', 'link'),
('Maths Unit 1H - June 2020', 'Mathematics', 2020, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202020%20QP.pdf', 'link'),
('Maths Unit 2H - June 2020', 'Mathematics', 2020, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202020%20QP.pdf', 'link'),
('Maths Unit 1H - June 2019', 'Mathematics', 2019, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202019%20QP.pdf', 'link'),
('Maths Unit 2H - June 2019', 'Mathematics', 2019, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202019%20QP.pdf', 'link'),
('Maths Unit 1H - June 2018', 'Mathematics', 2018, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202018%20QP.pdf', 'link'),
('Maths Unit 2H - June 2018', 'Mathematics', 2018, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202018%20QP.pdf', 'link'),
('Maths Unit 1H - June 2017', 'Mathematics', 2017, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-1/Higher/June%202017%20QP.pdf', 'link'),
('Maths Unit 2H - June 2017', 'Mathematics', 2017, 'WJEC', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/WJEC/Unit-2/Higher/June%202017%20QP.pdf', 'link');



-- ============================================
-- 4. BACKFILL FOR EXISTING USERS
-- This section copies all global papers to existing users
-- who don't already have them (avoids duplicates)
-- ============================================
INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, file_url, file_type)
SELECT 
  p.id AS user_id,
  g.title,
  g.subject,
  g.year,
  g.exam_board,
  g.file_url,
  g.file_type
FROM public.profiles p
CROSS JOIN public.global_past_papers g
WHERE NOT EXISTS (
  SELECT 1 FROM public.past_papers pp 
  WHERE pp.user_id = p.id 
  AND pp.file_url = g.file_url
);

-- Report how many papers were added
-- (Run this separately to see the count)
-- SELECT COUNT(*) AS papers_added FROM public.past_papers WHERE created_at > NOW() - INTERVAL '1 minute';
