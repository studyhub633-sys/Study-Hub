-- ============================================
-- Add Additional Profile Fields
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This adds school, year_group, and subjects columns to the profiles table
-- ============================================

-- Add school/institution field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school TEXT;

-- Add year group field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS year_group TEXT;

-- Add subjects field (comma-separated list)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subjects TEXT;

-- ============================================
-- Migration Complete!
-- ============================================
-- The profiles table now includes:
-- ✅ school - User's school or institution
-- ✅ year_group - User's year group (e.g., "Year 12")
-- ✅ subjects - Comma-separated list of subjects
-- ============================================

