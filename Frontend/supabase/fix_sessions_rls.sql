-- ============================================
-- Fix Virtual Sessions RLS and Registration
-- ============================================

-- 1. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Anyone can view verified upcoming and live sessions" ON public.virtual_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.virtual_sessions;
DROP POLICY IF EXISTS "Creators can update their sessions" ON public.virtual_sessions;
DROP POLICY IF EXISTS "Creators can delete their sessions" ON public.virtual_sessions;
DROP POLICY IF EXISTS "access_policy_select" ON public.virtual_sessions;
DROP POLICY IF EXISTS "access_policy_insert" ON public.virtual_sessions;
DROP POLICY IF EXISTS "access_policy_update" ON public.virtual_sessions;
DROP POLICY IF EXISTS "access_policy_delete" ON public.virtual_sessions;

-- 2. Re-create Simplified RLS Policies

-- SELECT: Anyone can see verified sessions. Creators can see their own unverified ones.
CREATE POLICY "access_policy_select"
ON public.virtual_sessions FOR SELECT
USING (
  email_verified = true OR 
  auth.uid() = created_by
);

-- INSERT: Authenticated users can create sessions
CREATE POLICY "access_policy_insert"
ON public.virtual_sessions FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- UPDATE: Only creators can update their sessions directly
CREATE POLICY "access_policy_update"
ON public.virtual_sessions FOR UPDATE
USING (auth.uid() = created_by);

-- DELETE: Only creators can delete their sessions
CREATE POLICY "access_policy_delete"
ON public.virtual_sessions FOR DELETE
USING (auth.uid() = created_by);

-- 3. Create Secure Function for Registration
-- This allows users to "update" the registered_users array without giving them full update permissions on the table.
CREATE OR REPLACE FUNCTION register_for_session(session_id_param UUID, user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.virtual_sessions
  SET registered_users = array_append(registered_users, user_id_param)
  WHERE id = session_id_param
  AND NOT (registered_users @> ARRAY[user_id_param]); -- Prevent duplicates
END;
$$;
