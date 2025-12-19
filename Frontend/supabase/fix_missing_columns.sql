-- ============================================
-- CONSOLIDATED DATABASE FIX
-- ================= -- Ensures all necessary columns exist in the 'profiles' table -- ============================================

-- Use this script if you get "Could not find column" errors

-- 1. Ensure core premium columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- 2. Ensure beta terms column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS beta_terms_accepted BOOLEAN DEFAULT FALSE;

-- 3. (Optional) Force a schema cache refresh by doing a dummy update
-- This sometimes helps PostgREST recognize new columns faster
COMMENT ON TABLE public.profiles IS 'User profiles for Study Spark Hub';

-- ============================================
-- Setup Complete!
-- ============================================
