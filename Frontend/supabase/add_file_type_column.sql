-- ============================================
-- Add file_type column to past_papers table
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: Dashboard → SQL Editor → New Query
-- ============================================

-- Add file_type column to distinguish between links and uploaded files
ALTER TABLE public.past_papers 
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('link', 'upload'));

-- Update existing records: if file_url starts with http, it's a link, otherwise it's an upload
UPDATE public.past_papers
SET file_type = CASE 
  WHEN file_url IS NULL THEN NULL
  WHEN file_url LIKE 'http://%' OR file_url LIKE 'https://%' THEN 'link'
  ELSE 'upload'
END
WHERE file_type IS NULL;

-- ============================================
-- Create storage bucket for past papers
-- ============================================
-- IMPORTANT: You need to create the bucket manually in Supabase Dashboard
-- 
-- Steps:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create Bucket"
-- 3. Name: past-papers
-- 4. Public: Yes (or configure RLS policies if you want private)
-- 5. Click "Create"
--
-- RLS Policies (if bucket is private):
-- Allow authenticated users to upload:
-- INSERT policy: authenticated users can upload to their own folder
-- SELECT policy: authenticated users can read their own files
-- ============================================







