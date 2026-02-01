-- ============================================
-- DELETE BROKEN PAST PAPERS (404 Errors)
-- Run this in Supabase SQL Editor to remove
-- papers that have broken URLs
-- ============================================

-- List of broken paper titles to delete
-- These papers have been verified to return 404 errors

-- Delete from user's past_papers table first
DELETE FROM public.past_papers
WHERE title IN (
  -- Physics November Papers (all 404)
  'Physics Paper 1H - November 2023',
  'Physics Paper 2H - November 2023',
  'Physics Paper 1H - November 2022',
  'Physics Paper 2H - November 2022',
  
  -- Biology November Papers (all 404)
  'Biology Paper 1H - November 2023',
  'Biology Paper 2H - November 2023',
  'Biology Paper 1H - November 2022',
  'Biology Paper 2H - November 2022',
  
  -- Chemistry November Papers (all 404)
  'Chemistry Paper 1H - November 2023',
  'Chemistry Paper 2H - November 2023',
  'Chemistry Paper 1H - November 2022',
  'Chemistry Paper 2H - November 2022',
  
  -- Mathematics November Papers (all 404)
  'Maths Paper 1H - November 2021',
  'Maths Paper 2H - November 2021',
  'Maths Paper 3H - November 2021',
  'Maths Paper 1H - November 2020',
  'Maths Paper 2H - November 2020',
  'Maths Paper 3H - November 2020',
  
  -- English Literature Papers (404)
  'English Literature Paper 1 - November 2023',
  'English Literature Paper 2 - November 2023',
  'English Literature Paper 1 - June 2024',
  'English Literature Paper 2 - June 2024',
  
  -- Computer Science (incorrect URL format)
  'Computer Science Paper 1 - June 2023',
  'Computer Science Paper 2 - June 2023',
  
  -- Business Papers (incorrect URL format)
  'Business Paper 1 - June 2023',
  'Business Paper 2 - June 2023'
);

-- Delete from global_past_papers table
DELETE FROM public.global_past_papers
WHERE title IN (
  -- Physics November Papers (all 404)
  'Physics Paper 1H - November 2023',
  'Physics Paper 2H - November 2023',
  'Physics Paper 1H - November 2022',
  'Physics Paper 2H - November 2022',
  
  -- Biology November Papers (all 404)
  'Biology Paper 1H - November 2023',
  'Biology Paper 2H - November 2023',
  'Biology Paper 1H - November 2022',
  'Biology Paper 2H - November 2022',
  
  -- Chemistry November Papers (all 404)
  'Chemistry Paper 1H - November 2023',
  'Chemistry Paper 2H - November 2023',
  'Chemistry Paper 1H - November 2022',
  'Chemistry Paper 2H - November 2022',
  
  -- Mathematics November Papers (all 404)
  'Maths Paper 1H - November 2021',
  'Maths Paper 2H - November 2021',
  'Maths Paper 3H - November 2021',
  'Maths Paper 1H - November 2020',
  'Maths Paper 2H - November 2020',
  'Maths Paper 3H - November 2020',
  
  -- English Literature Papers (404)
  'English Literature Paper 1 - November 2023',
  'English Literature Paper 2 - November 2023',
  'English Literature Paper 1 - June 2024',
  'English Literature Paper 2 - June 2024',
  
  -- Computer Science (incorrect URL format)
  'Computer Science Paper 1 - June 2023',
  'Computer Science Paper 2 - June 2023',
  
  -- Business Papers (incorrect URL format)
  'Business Paper 1 - June 2023',
  'Business Paper 2 - June 2023'
);

-- Report deleted count
-- SELECT 'Deleted broken past papers with 404 URLs' AS status;
