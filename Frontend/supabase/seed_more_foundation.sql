-- ============================================
-- Seed More Foundation Tier Papers
-- ============================================

INSERT INTO public.global_past_papers (title, subject, year, exam_board, file_url, file_type, tier)
VALUES 
-- =====================
-- MATHS FOUNDATION (Edexcel)
-- =====================
('Maths Paper 1F - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-1F/QP/June%202023%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 2F - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-2F/QP/June%202023%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 3F - June 2023', 'Mathematics', 2023, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-3F/QP/June%202023%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 1F - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-1F/QP/June%202024%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 2F - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-2F/QP/June%202024%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 3F - June 2024', 'Mathematics', 2024, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-3F/QP/June%202024%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 1F - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-1F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 2F - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-2F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 3F - June 2022', 'Mathematics', 2022, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-3F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 1F - Nov 2021', 'Mathematics', 2021, 'Edexcel', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/Edexcel/Paper-1F/QP/Nov%202021%20QP.pdf', 'link', 'Foundation'),

-- =====================
-- SCIENCE FOUNDATION (AQA - Combined Science Trilogy shorthand often treated as separate science papers in practice lists, or strict biology/chem/phys)
-- =====================
('Biology Paper 1F - June 2022', 'Biology', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-1F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Biology Paper 2F - June 2022', 'Biology', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Biology/GCSE/Past-Papers/AQA/Paper-2F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Chemistry Paper 1F - June 2022', 'Chemistry', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-1F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Chemistry Paper 2F - June 2022', 'Chemistry', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Chemistry/GCSE/Past-Papers/AQA/Paper-2F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Physics Paper 1F - June 2022', 'Physics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-1F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),
('Physics Paper 2F - June 2022', 'Physics', 2022, 'AQA', 'https://pmt.physicsandmathstutor.com/download/Physics/GCSE/Past-Papers/AQA/Paper-2F/QP/June%202022%20QP.pdf', 'link', 'Foundation'),

-- =====================
-- ENGLISH LANG (Technically untiered but usually accessible)
-- AQA English Language is untiered.
-- =====================

-- =====================
-- OCR FOUNDATION
-- =====================
('Maths Paper 1 (Foundation) - June 2023', 'Mathematics', 2023, 'OCR', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/OCR/Paper-1F/QP/June%202023%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 2 (Foundation) - June 2023', 'Mathematics', 2023, 'OCR', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/OCR/Paper-2F/QP/June%202023%20QP.pdf', 'link', 'Foundation'),
('Maths Paper 3 (Foundation) - June 2023', 'Mathematics', 2023, 'OCR', 'https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Past-Papers/OCR/Paper-3F/QP/June%202023%20QP.pdf', 'link', 'Foundation');


-- ============================================
-- BACKFILL TO USERS
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
WHERE g.tier = 'Foundation' -- Only copy the new foundations to be safe or efficient
AND NOT EXISTS (
  SELECT 1 FROM public.past_papers pp 
  WHERE pp.user_id = p.id 
  AND pp.file_url = g.file_url
);
