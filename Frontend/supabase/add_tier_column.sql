-- ============================================
-- Add Tier Support to Resources
-- ============================================

-- 1. Add tier to past_papers
ALTER TABLE public.past_papers 
ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('Foundation', 'Higher'));

-- 2. Add tier to flashcards
ALTER TABLE public.flashcards 
ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('Foundation', 'Higher'));

-- 3. Add tier to knowledge_organizers
ALTER TABLE public.knowledge_organizers 
ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('Foundation', 'Higher'));

-- 4. Create indexes for the new tier column
CREATE INDEX IF NOT EXISTS past_papers_tier_idx ON public.past_papers(tier);
CREATE INDEX IF NOT EXISTS flashcards_tier_idx ON public.flashcards(tier);
CREATE INDEX IF NOT EXISTS knowledge_organizers_tier_idx ON public.knowledge_organizers(tier);

-- ============================================
-- Migration Complete!
-- ============================================
