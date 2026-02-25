-- ============================================
-- Restrict Premium/Admin Self-Updates
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Prevents users from granting themselves premium or admin
-- ============================================

-- Drop the existing overly-permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a restricted update policy that prevents users from modifying is_premium and is_admin
-- Users can update their own profile, but the is_premium and is_admin values must remain unchanged
CREATE POLICY "Users can update own profile safely"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_premium IS NOT DISTINCT FROM (SELECT p.is_premium FROM public.profiles p WHERE p.id = auth.uid())
    AND is_admin IS NOT DISTINCT FROM (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ============================================
-- Migration Complete!
-- ============================================
-- ✅ Users can still update: full_name, avatar_url, email, etc.
-- ✅ Users CANNOT change: is_premium, is_admin
-- ✅ Only server-side (service_role) can modify premium/admin status
-- ============================================
