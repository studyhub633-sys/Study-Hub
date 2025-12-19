-- ============================================
-- Add Beta Terms Accepted Column
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This adds the beta_terms_accepted column to the profiles table
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS beta_terms_accepted BOOLEAN DEFAULT FALSE;

-- ============================================
-- Migration Complete!
-- ============================================
-- The profiles table now includes:
-- ✅ beta_terms_accepted - To track if user accepted beta terms
-- ============================================
