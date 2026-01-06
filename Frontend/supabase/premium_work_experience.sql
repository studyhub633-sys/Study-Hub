-- ============================================
-- Premium Work Experience Opportunities
-- ============================================
-- Table for exclusive work experience opportunities (premium feature)
-- ============================================

-- Create premium_work_experience table
CREATE TABLE IF NOT EXISTS public.premium_work_experience (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  location TEXT,
  duration TEXT, -- e.g., "2 weeks", "1 month", "Summer 2025"
  application_url TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  requirements TEXT[], -- Array of requirements
  benefits TEXT[], -- Array of benefits
  is_premium BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE, -- For enabling/disabling opportunities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.premium_work_experience ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Public read access for premium work experience" ON public.premium_work_experience;

-- Allow all authenticated users to read (access control in app layer via premium check)
CREATE POLICY "Public read access for premium work experience"
  ON public.premium_work_experience FOR SELECT
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS premium_work_experience_company_idx ON public.premium_work_experience(company);
CREATE INDEX IF NOT EXISTS premium_work_experience_is_premium_idx ON public.premium_work_experience(is_premium);
CREATE INDEX IF NOT EXISTS premium_work_experience_is_active_idx ON public.premium_work_experience(is_active);
CREATE INDEX IF NOT EXISTS premium_work_experience_application_deadline_idx ON public.premium_work_experience(application_deadline);

-- ============================================
-- Note: Work experience opportunities will be inserted manually
-- by the admin when they are available
-- ============================================

