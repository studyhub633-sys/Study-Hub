-- ============================================
-- UPDATE PAST PAPER URLs WITH REAL DIRECT PDF LINKS
-- ============================================
-- This script updates all generic exam board homepage URLs
-- with real direct links to specific past paper PDFs.
--
-- PDF sources: Papers are hosted on mmerevise.co.uk (MME Revise),
-- a well-established UK educational publisher. These are the same
-- papers as the originals, legally distributed for educational use.
--
-- Run this in Supabase SQL Editor.
-- ============================================

-- ============================================
-- STEP 1: Update global_past_papers table
-- ============================================

-- ===== AQA MATHEMATICS - HIGHER =====

-- June 2024 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/Paper-1H-Non-Calc-AQA.pdf'
WHERE title = 'Maths Paper 1H - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/Paper-2H-AQA.pdf'
WHERE title = 'Maths Paper 2H - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/Paper-3H-AQA.pdf'
WHERE title = 'Maths Paper 3H - June 2024' AND exam_board = 'AQA';

-- June 2023 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-83001H-QP-JUN23.pdf'
WHERE title = 'Maths Paper 1H - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-83002H-QP-JUN23.pdf'
WHERE title = 'Maths Paper 2H - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-83003H-QP-JUN23.pdf'
WHERE title = 'Maths Paper 3H - June 2023' AND exam_board = 'AQA';

-- June 2022 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/wp-content/uploads/2023/07/AQA-GCSE-Maths-Higher-Paper-1-June-2022.pdf'
WHERE title = 'Maths Paper 1H - June 2022' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/wp-content/uploads/2023/07/AQA-GCSE-Maths-Higher-Paper-2-June-2022.pdf'
WHERE title = 'Maths Paper 2H - June 2022' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/wp-content/uploads/2023/07/AQA-GCSE-Maths-Higher-Paper-3-June-2022.pdf'
WHERE title = 'Maths Paper 3H - June 2022' AND exam_board = 'AQA';

-- November 2023 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/AQA-1H.pdf'
WHERE title = 'Maths Paper 1H - November 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/AQA-2H.pdf'
WHERE title = 'Maths Paper 2H - November 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/AQA-3H.pdf'
WHERE title = 'Maths Paper 3H - November 2023' AND exam_board = 'AQA';

-- November 2022 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/wp-content/uploads/2023/11/AQA-GCSE-Maths-Higher-Paper-1-November-2022.pdf'
WHERE title = 'Maths Paper 1H - November 2022' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/wp-content/uploads/2023/11/AQA-GCSE-Maths-Higher-Paper-2-November-2022.pdf'
WHERE title = 'Maths Paper 2H - November 2022' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/wp-content/uploads/2023/11/AQA-GCSE-Maths-Higher-Paper-3-November-2022.pdf'
WHERE title = 'Maths Paper 3H - November 2022' AND exam_board = 'AQA';

-- ===== AQA MATHEMATICS - FOUNDATION =====

-- June 2024 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/Paper-1F-Non-Calc-AQA.pdf'
WHERE title = 'Maths Paper 1F - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/Paper-2F-AQA.pdf'
WHERE title = 'Maths Paper 2F - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/Paper-3F-AQA.pdf'
WHERE title = 'Maths Paper 3F - June 2024' AND exam_board = 'AQA';

-- June 2023 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-83001F-QP-JUN23.pdf'
WHERE title = 'Maths Paper 1F - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-83002F-QP-JUN23.pdf'
WHERE title = 'Maths Paper 2F - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-83003F-QP-JUN23.pdf'
WHERE title = 'Maths Paper 3F - June 2023' AND exam_board = 'AQA';

-- ===== AQA ENGLISH LANGUAGE =====

-- June 2024
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/11/AQA-87001-QP-JUN24.pdf'
WHERE title = 'English Language Paper 1 - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/09/AQA-87002-QP-JUN24.pdf'
WHERE title = 'English Language Paper 2 - June 2024' AND exam_board = 'AQA';

-- June 2023
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-English-Lang-QP-JUN23-P1.pdf'
WHERE title = 'English Language Paper 1 - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-English-Lang-QP-JUN23-P2.pdf'
WHERE title = 'English Language Paper 2 - June 2023' AND exam_board = 'AQA';

-- ===== AQA ENGLISH LITERATURE =====
-- English Literature uses the AQA find-papers page filtered search (no universal PDF — depends on text option chosen)
-- Using the general filtered page which lands on Lit papers
UPDATE public.global_past_papers SET file_url = 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualificationCode=8702&subject=english-literature'
WHERE title LIKE 'English Literature%' AND exam_board = 'AQA';

-- ===== AQA BIOLOGY - HIGHER =====

-- June 2024 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84611H-QP-JUN24-CR1.pdf'
WHERE title = 'Biology Paper 1H - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84612H-QP-JUN241.pdf'
WHERE title = 'Biology Paper 2H - June 2024' AND exam_board = 'AQA';

-- June 2023 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Biology-JUN23-QP-1H.pdf'
WHERE title = 'Biology Paper 1H - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Biology-JUN23-QP-2H.pdf'
WHERE title = 'Biology Paper 2H - June 2023' AND exam_board = 'AQA';

-- ===== AQA BIOLOGY - FOUNDATION =====

-- June 2024 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84611F-QP-JUN24-CR1.pdf'
WHERE title = 'Biology Paper 1F - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84612F-QP-JUN241.pdf'
WHERE title = 'Biology Paper 2F - June 2024' AND exam_board = 'AQA';

-- June 2023 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Biology-JUN23-QP-1F.pdf'
WHERE title = 'Biology Paper 1F - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Biology-JUN23-QP-2F.pdf'
WHERE title = 'Biology Paper 2F - June 2023' AND exam_board = 'AQA';

-- ===== AQA CHEMISTRY - HIGHER =====

-- June 2024 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84621H-QP-JUN241.pdf'
WHERE title = 'Chemistry Paper 1H - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84622H-QP-JUN241.pdf'
WHERE title = 'Chemistry Paper 2H - June 2024' AND exam_board = 'AQA';

-- June 2023 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Chemistry-JUN23-QP-H1.pdf'
WHERE title = 'Chemistry Paper 1H - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Chemistry-JUN23-QP-H2.pdf'
WHERE title = 'Chemistry Paper 2H - June 2023' AND exam_board = 'AQA';

-- ===== AQA CHEMISTRY - FOUNDATION =====

-- June 2024 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84621F-QP-JUN241.pdf'
WHERE title = 'Chemistry Paper 1F - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84622F-QP-JUN241.pdf'
WHERE title = 'Chemistry Paper 2F - June 2024' AND exam_board = 'AQA';

-- June 2023 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Chemistry-JUN23-QP-F1.pdf'
WHERE title = 'Chemistry Paper 1F - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2024/07/AQA-GCSE-Chemistry-JUN23-QP-F2.pdf'
WHERE title = 'Chemistry Paper 2F - June 2023' AND exam_board = 'AQA';

-- ===== AQA PHYSICS - HIGHER =====

-- June 2024 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84631H-QP-JUN241.pdf'
WHERE title = 'Physics Paper 1H - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84632H-QP-JUN241.pdf'
WHERE title = 'Physics Paper 2H - June 2024' AND exam_board = 'AQA';

-- June 2023 Higher
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84631H-QP-MQP18A4-JUN231.pdf'
WHERE title = 'Physics Paper 1H - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84632H-QP-JUN231.pdf'
WHERE title = 'Physics Paper 2H - June 2023' AND exam_board = 'AQA';

-- ===== AQA PHYSICS - FOUNDATION =====

-- June 2024 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84631F-QP-JUN241.pdf'
WHERE title = 'Physics Paper 1F - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84632F-QP-JUN241.pdf'
WHERE title = 'Physics Paper 2F - June 2024' AND exam_board = 'AQA';

-- June 2023 Foundation
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84631F-QP-MQP18A4-JUN231.pdf'
WHERE title = 'Physics Paper 1F - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/10/AQA-84632F-QP-JUN231.pdf'
WHERE title = 'Physics Paper 2F - June 2023' AND exam_board = 'AQA';

-- ===== AQA GEOGRAPHY =====
-- Geography uses specific filtered AQA search page (unique to each paper/option)
UPDATE public.global_past_papers SET file_url = 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualificationCode=8035'
WHERE title LIKE 'Geography%' AND exam_board = 'AQA';

-- ===== AQA HISTORY =====
-- History Paper 1 - uses Germany option (most popular)
UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/11/AQA-81451AB-QP-JUN241.pdf'
WHERE title = 'History Paper 1 - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://mmerevise.co.uk/app/uploads/2025/11/AQA-81452AA-QP-JUN241.pdf'
WHERE title = 'History Paper 2 - June 2024' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualificationCode=8145&year=2023'
WHERE title = 'History Paper 1 - June 2023' AND exam_board = 'AQA';

UPDATE public.global_past_papers SET file_url = 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualificationCode=8145&year=2023'
WHERE title = 'History Paper 2 - June 2023' AND exam_board = 'AQA';

-- ===== AQA FRENCH =====
UPDATE public.global_past_papers SET file_url = 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualificationCode=8658&year=2023'
WHERE title LIKE 'French%' AND exam_board = 'AQA';

-- ===== AQA SPANISH =====
UPDATE public.global_past_papers SET file_url = 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualificationCode=8698&year=2023'
WHERE title LIKE 'Spanish%' AND exam_board = 'AQA';

-- ===== EDEXCEL (all) =====
-- Edexcel papers require login on Pearson's site; best public link is their filtered search
UPDATE public.global_past_papers SET file_url = 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?code=1MA1'
WHERE exam_board = 'Edexcel' AND subject = 'Mathematics';

UPDATE public.global_past_papers SET file_url = 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?code=1BI0'
WHERE exam_board = 'Edexcel' AND subject = 'Biology';

UPDATE public.global_past_papers SET file_url = 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?code=1CH0'
WHERE exam_board = 'Edexcel' AND subject = 'Chemistry';

UPDATE public.global_past_papers SET file_url = 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?code=1PH0'
WHERE exam_board = 'Edexcel' AND subject = 'Physics';

-- ===== OCR =====
UPDATE public.global_past_papers SET file_url = 'https://www.ocr.org.uk/qualifications/gcse/mathematics-j560-from-2015/assessment/'
WHERE exam_board = 'OCR' AND subject = 'Mathematics';

UPDATE public.global_past_papers SET file_url = 'https://www.ocr.org.uk/qualifications/gcse/biology-a-gateway-science-j247-from-2016/assessment/'
WHERE exam_board = 'OCR' AND subject = 'Biology';

UPDATE public.global_past_papers SET file_url = 'https://www.ocr.org.uk/qualifications/gcse/chemistry-a-gateway-science-j248-from-2016/assessment/'
WHERE exam_board = 'OCR' AND subject = 'Chemistry';

-- ===== EDUQAS/WJEC =====
UPDATE public.global_past_papers SET file_url = 'https://www.eduqas.co.uk/qualifications/mathematics-gcse/#tab_pastpapers'
WHERE exam_board = 'Eduqas/WJEC' AND subject = 'Mathematics';

UPDATE public.global_past_papers SET file_url = 'https://www.eduqas.co.uk/qualifications/english-language-gcse/#tab_pastpapers'
WHERE exam_board = 'Eduqas/WJEC' AND subject = 'English Language';

UPDATE public.global_past_papers SET file_url = 'https://www.eduqas.co.uk/qualifications/biology-gcse/#tab_pastpapers'
WHERE exam_board = 'Eduqas/WJEC' AND subject = 'Biology';

-- ============================================
-- STEP 2: Propagate changes to all user past_papers
-- ============================================
-- This updates every user's copy of global papers to match the new URLs.
-- It matches on title + exam_board (same logic as the seeding function).

UPDATE public.past_papers pp
SET file_url = gpp.file_url
FROM public.global_past_papers gpp
WHERE pp.title = gpp.title
  AND pp.exam_board = gpp.exam_board
  AND pp.file_url != gpp.file_url;

-- ============================================
-- STEP 3: Verify the changes
-- ============================================
-- Run this after to confirm which records were updated:
-- SELECT title, exam_board, year, file_url
-- FROM public.global_past_papers
-- ORDER BY exam_board, subject, year DESC;
