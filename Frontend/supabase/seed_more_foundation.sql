-- ============================================
-- Seed More Foundation Tier Papers
-- All links point to official exam board past papers pages.
-- COPYRIGHT: All papers are copyright of their respective exam boards.
-- ============================================

INSERT INTO public.global_past_papers (title, subject, year, exam_board, file_url, file_type, tier)
VALUES 
-- =====================
-- MATHS FOUNDATION (Edexcel)
-- Official: https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html
-- =====================
('Maths Paper 1F - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 2F - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 3F - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 1F - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 2F - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 3F - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 1F - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 2F - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),
('Maths Paper 3F - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html', 'link', 'Foundation'),

-- =====================
-- SCIENCE FOUNDATION (AQA)
-- Official: https://www.aqa.org.uk/find-past-papers-and-mark-schemes
-- =====================
('Biology Paper 1F - June 2022', 'Biology', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link', 'Foundation'),
('Biology Paper 2F - June 2022', 'Biology', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link', 'Foundation'),
('Chemistry Paper 1F - June 2022', 'Chemistry', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link', 'Foundation'),
('Chemistry Paper 2F - June 2022', 'Chemistry', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link', 'Foundation'),
('Physics Paper 1F - June 2022', 'Physics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link', 'Foundation'),
('Physics Paper 2F - June 2022', 'Physics', 2022, 'AQA', 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes', 'link', 'Foundation'),

-- =====================
-- OCR FOUNDATION
-- Official: https://www.ocr.org.uk/qualifications/past-paper-finder/
-- =====================
('Maths Paper 1 (Foundation) - June 2023', 'Mathematics', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link', 'Foundation'),
('Maths Paper 2 (Foundation) - June 2023', 'Mathematics', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link', 'Foundation'),
('Maths Paper 3 (Foundation) - June 2023', 'Mathematics', 2023, 'OCR', 'https://www.ocr.org.uk/qualifications/past-paper-finder/', 'link', 'Foundation');


-- ============================================
-- BACKFILL TO USERS
-- Uses title + exam_board match to avoid duplicates
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
WHERE g.tier = 'Foundation'
AND NOT EXISTS (
  SELECT 1 FROM public.past_papers pp 
  WHERE pp.user_id = p.id 
  AND pp.title = g.title
  AND pp.exam_board = g.exam_board
);
