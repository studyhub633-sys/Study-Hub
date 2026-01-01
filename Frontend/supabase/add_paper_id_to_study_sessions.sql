-- Add paper_id to study_sessions table to track past paper study time
ALTER TABLE public.study_sessions 
ADD COLUMN IF NOT EXISTS paper_id UUID REFERENCES public.past_papers(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS study_sessions_paper_id_idx ON public.study_sessions(paper_id);

-- Make organizer_id nullable if it's not already, since a session can be EITHER organizer OR paper
ALTER TABLE public.study_sessions ALTER COLUMN organizer_id DROP NOT NULL;
