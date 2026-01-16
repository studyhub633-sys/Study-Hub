-- Ensure profiles table has all necessary columns for Settings page
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS year_group TEXT,
ADD COLUMN IF NOT EXISTS subjects TEXT;

-- Enable RLS if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Ensure users can insert their own profile (if not exists)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);
