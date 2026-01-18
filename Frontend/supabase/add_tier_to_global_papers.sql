-- ============================================
-- Add Tier Support to Global Past Papers
-- ============================================

-- 1. Add tier column to global_past_papers
ALTER TABLE public.global_past_papers 
ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('Foundation', 'Higher'));

-- 2. Update existing papers based on title pattern
-- Papers with "F" suffix = Foundation, "H" suffix = Higher
UPDATE public.global_past_papers
SET tier = CASE 
  WHEN title LIKE '%1F%' OR title LIKE '%2F%' OR title LIKE '%3F%' OR title LIKE '%Paper%F%' OR title LIKE '%Component%F%' THEN 'Foundation'
  WHEN title LIKE '%1H%' OR title LIKE '%2H%' OR title LIKE '%3H%' OR title LIKE '%Paper%H%' OR title LIKE '%Component%H%' THEN 'Higher'
  ELSE NULL
END
WHERE tier IS NULL;

-- 3. Update the seeding function to include tier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, file_url, file_type, tier)
  SELECT 
    NEW.id, 
    title, 
    subject, 
    year, 
    exam_board, 
    file_url, 
    file_type,
    tier
  FROM public.global_past_papers;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create index for tier
CREATE INDEX IF NOT EXISTS global_past_papers_tier_idx ON public.global_past_papers(tier);

-- ============================================
-- Migration Complete!
-- ============================================
