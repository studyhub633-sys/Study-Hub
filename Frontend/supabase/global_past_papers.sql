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

  INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, file_url, file_type, tier)
  SELECT 
    NEW.id, 
    title, 
    subject, 
    year, 
    exam_board, 
    file_url, 
    file_type,
    tier
  FROM public.global_past_papers;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. OFFICIAL EXAM BOARD LINKS
-- All links point to the official exam board past papers pages.
-- Revisely.ai does NOT host, cache, embed, proxy, or frame any
-- exam board PDFs or assets. These are outbound links only.
--
-- COPYRIGHT NOTICE:
-- All past examination papers are the copyright of their respective
-- exam boards: AQA, Pearson Edexcel, OCR, and Eduqas/WJEC.
-- Revisely.ai is not affiliated with or endorsed by any exam board.
-- ============================================
TRUNCATE TABLE public.global_past_papers;

INSERT INTO public.global_past_papers (title, subject, year, exam_board, file_url, file_type)
VALUES 
-- =====================
-- MATHEMATICS (GCSE Higher) - AQA
-- Official: https://www.aqa.org.uk/find-past-papers-and-mark-schemes
-- =====================
('Maths Paper 1H - June 2024', 'Mathematics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2H - June 2024', 'Mathematics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3H - June 2024', 'Mathematics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 1H - June 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2H - June 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3H - June 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 1H - June 2022', 'Mathematics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2H - June 2022', 'Mathematics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 1H - November 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2H - November 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 1H - November 2022', 'Mathematics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2H - November 2022', 'Mathematics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3H - June 2022', 'Mathematics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3H - November 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3H - November 2022', 'Mathematics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- Maths Foundation - AQA
('Maths Paper 1F - June 2024', 'Mathematics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2F - June 2024', 'Mathematics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3F - June 2024', 'Mathematics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 1F - June 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 2F - June 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Maths Paper 3F - June 2023', 'Mathematics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- ENGLISH LANGUAGE - AQA
-- =====================
('English Language Paper 1 - June 2024', 'English Language', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('English Language Paper 2 - June 2024', 'English Language', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('English Language Paper 1 - June 2023', 'English Language', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('English Language Paper 2 - June 2023', 'English Language', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- ENGLISH LITERATURE - AQA
-- =====================
('English Literature Paper 1 - June 2023', 'English Literature', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('English Literature Paper 2 - June 2023', 'English Literature', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- BIOLOGY - AQA (Higher & Foundation)
-- =====================
('Biology Paper 1H - June 2024', 'Biology', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 2H - June 2024', 'Biology', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 1H - June 2023', 'Biology', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 2H - June 2023', 'Biology', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 1F - June 2024', 'Biology', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 2F - June 2024', 'Biology', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 1F - June 2023', 'Biology', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Biology Paper 2F - June 2023', 'Biology', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- CHEMISTRY - AQA (Higher & Foundation)
-- =====================
('Chemistry Paper 1H - June 2024', 'Chemistry', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 2H - June 2024', 'Chemistry', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 1H - June 2023', 'Chemistry', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 2H - June 2023', 'Chemistry', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 1F - June 2024', 'Chemistry', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 2F - June 2024', 'Chemistry', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 1F - June 2023', 'Chemistry', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Chemistry Paper 2F - June 2023', 'Chemistry', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- PHYSICS - AQA (Higher & Foundation)
-- =====================
('Physics Paper 1H - June 2024', 'Physics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 2H - June 2024', 'Physics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 1H - June 2023', 'Physics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 2H - June 2023', 'Physics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 1F - June 2024', 'Physics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 2F - June 2024', 'Physics', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 1F - June 2023', 'Physics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Physics Paper 2F - June 2023', 'Physics', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- GEOGRAPHY - AQA
-- =====================
('Geography Paper 1 - June 2024', 'Geography', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Geography Paper 2 - June 2024', 'Geography', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Geography Paper 1 - June 2023', 'Geography', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Geography Paper 2 - June 2023', 'Geography', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- HISTORY - AQA
-- =====================
('History Paper 1 - June 2024', 'History', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('History Paper 2 - June 2024', 'History', 2024, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('History Paper 1 - June 2023', 'History', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('History Paper 2 - June 2023', 'History', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- FRENCH & SPANISH - AQA
-- =====================
('French Paper 1 - June 2023', 'French', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('French Paper 2 - June 2023', 'French', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Spanish Paper 1 - June 2023', 'Spanish', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),
('Spanish Paper 2 - June 2023', 'Spanish', 2023, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link'),

-- =====================
-- EDEXCEL (Pearson)
-- Official: https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html
-- =====================
('Maths Paper 1H - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 2H - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 3H - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 1H - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 2H - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 3H - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 1H - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 2H - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Maths Paper 3H - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Biology Paper 1H - June 2023', 'Biology', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Biology Paper 2H - June 2023', 'Biology', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Chemistry Paper 1H - June 2023', 'Chemistry', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Chemistry Paper 2H - June 2023', 'Chemistry', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Physics Paper 1H - June 2023', 'Physics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),
('Physics Paper 2H - June 2023', 'Physics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link'),

-- =====================
-- OCR
-- Official: https://www.ocr.org.uk/qualifications/past-paper-finder/
-- =====================
('Maths Paper 1 - June 2024', 'Mathematics', 2024, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Maths Paper 2 - June 2024', 'Mathematics', 2024, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Maths Paper 3 - June 2024', 'Mathematics', 2024, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Maths Paper 1 - June 2023', 'Mathematics', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Maths Paper 2 - June 2023', 'Mathematics', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Maths Paper 3 - June 2023', 'Mathematics', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Biology Paper 1 - June 2023', 'Biology', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Biology Paper 2 - June 2023', 'Biology', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Chemistry Paper 1 - June 2023', 'Chemistry', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),
('Chemistry Paper 2 - June 2023', 'Chemistry', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link'),

-- =====================
-- EDUQAS / WJEC
-- Official: https://www.eduqas.co.uk/qualifications/
-- =====================
('Maths Component 1 - June 2024', 'Mathematics', 2024, 'Eduqas/WJEC', 'https://www.eduqas.co.uk/qualifications/', 'link'),
('Maths Component 2 - June 2024', 'Mathematics', 2024, 'Eduqas/WJEC', 'https://www.eduqas.co.uk/qualifications/', 'link'),
('Maths Component 1 - June 2023', 'Mathematics', 2023, 'Eduqas/WJEC', 'https://www.eduqas.co.uk/qualifications/', 'link'),
('Maths Component 2 - June 2023', 'Mathematics', 2023, 'Eduqas/WJEC', 'https://www.eduqas.co.uk/qualifications/', 'link'),
('English Language Component 1 - June 2023', 'English Language', 2023, 'Eduqas/WJEC', 'https://www.eduqas.co.uk/qualifications/', 'link'),
('Biology Component 1 - June 2023', 'Biology', 2023, 'Eduqas/WJEC', 'https://www.eduqas.co.uk/qualifications/', 'link');


-- ============================================
-- 4. BACKFILL FOR EXISTING USERS
-- This section copies all global papers to existing users
-- who don't already have them (avoids duplicates).
-- Uses title + file_url match since multiple entries share the same URL.
-- ============================================
INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, file_url, file_type, tier)
SELECT 
  p.id AS user_id,
  g.title,
  g.subject,
  g.year,
  g.exam_board,
  g.file_url,
  g.file_type,
  g.tier
FROM public.profiles p
CROSS JOIN public.global_past_papers g
WHERE NOT EXISTS (
  SELECT 1 FROM public.past_papers pp 
  WHERE pp.user_id = p.id 
  AND pp.title = g.title
  AND pp.exam_board = g.exam_board
);

-- Report how many papers were added
-- (Run this separately to see the count)
-- SELECT COUNT(*) AS papers_added FROM public.past_papers WHERE created_at > NOW() - INTERVAL '1 minute';
