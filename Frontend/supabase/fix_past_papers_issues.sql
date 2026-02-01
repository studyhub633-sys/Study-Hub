-- ============================================
-- FIX PAST PAPERS ISSUES
-- 1. Remove duplicate papers for each user
-- 2. Remove papers with broken URLs (404 errors)
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: View current duplicate count (diagnostic)
-- ============================================
-- Uncomment to run diagnostic first:
-- SELECT 
--   user_id,
--   title,
--   file_url,
--   COUNT(*) as duplicate_count
-- FROM public.past_papers
-- GROUP BY user_id, title, file_url
-- HAVING COUNT(*) > 1
-- ORDER BY duplicate_count DESC
-- LIMIT 50;

-- ============================================
-- STEP 2: Remove EXACT duplicates (same user, same file_url)
-- Keeps only one copy of each paper per user
-- ============================================
DELETE FROM public.past_papers
WHERE id NOT IN (
  SELECT MIN(id::text)::uuid
  FROM public.past_papers
  GROUP BY user_id, file_url
);

-- ============================================
-- STEP 3: Remove broken URLs (404 errors)
-- These papers have been verified to not exist at PMT
-- ============================================

-- Delete from user's past_papers table
DELETE FROM public.past_papers
WHERE file_url LIKE '%OCR-A%Biology%'  -- OCR Biology uses different URL format
   OR file_url LIKE '%OCR-A%Chemistry%' -- OCR Chemistry uses different URL format
   OR file_url LIKE '%WJEC-England%Biology%' -- Eduqas/WJEC Biology broken
   OR file_url LIKE '%WJEC-England%Chemistry%' -- Eduqas/WJEC Chemistry broken
   OR file_url LIKE '%WJEC-England%Physics%' -- Eduqas/WJEC Physics broken
   OR title LIKE '%Biology%OCR%2023%'
   OR title LIKE '%Chemistry%OCR%2023%'
   OR title LIKE '%Biology%Eduqas%'
   OR title LIKE '%Biology%WJEC%';

-- Also delete from global_past_papers to prevent future issues
DELETE FROM public.global_past_papers
WHERE file_url LIKE '%OCR-A%Biology%'
   OR file_url LIKE '%OCR-A%Chemistry%'
   OR file_url LIKE '%WJEC-England%Biology%'
   OR file_url LIKE '%WJEC-England%Chemistry%'
   OR file_url LIKE '%WJEC-England%Physics%';

-- ============================================
-- STEP 4: Remove specific broken papers by title pattern
-- These are the ones you specifically identified
-- ============================================

-- Delete broken OCR papers (wrong URL format)
DELETE FROM public.past_papers WHERE title = 'Biology Paper 1 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.past_papers WHERE title = 'Biology Paper 2 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.past_papers WHERE title = 'Chemistry Paper 1 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.past_papers WHERE title = 'Chemistry Paper 2 - June 2023' AND exam_board = 'OCR';

-- Delete broken Eduqas/WJEC papers
DELETE FROM public.past_papers WHERE title = 'Biology Component 1 - June 2023' AND exam_board = 'Eduqas/WJEC';

-- Delete from global too
DELETE FROM public.global_past_papers WHERE title = 'Biology Paper 1 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.global_past_papers WHERE title = 'Biology Paper 2 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.global_past_papers WHERE title = 'Chemistry Paper 1 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.global_past_papers WHERE title = 'Chemistry Paper 2 - June 2023' AND exam_board = 'OCR';
DELETE FROM public.global_past_papers WHERE title = 'Biology Component 1 - June 2023' AND exam_board = 'Eduqas/WJEC';

-- ============================================
-- STEP 5: Show results
-- ============================================
SELECT 
  'past_papers' as table_name,
  COUNT(*) as total_papers
FROM public.past_papers
UNION ALL
SELECT 
  'global_past_papers' as table_name,
  COUNT(*) as total_papers
FROM public.global_past_papers;
