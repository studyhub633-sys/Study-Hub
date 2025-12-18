-- ============================================
-- AI Usage Tracking & History Table
-- ============================================

-- Create base table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_type TEXT NOT NULL,
  prompt TEXT,
  response JSONB,
  subject TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist (in case table was created previously without them)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage_tracking' AND column_name='prompt') THEN
        ALTER TABLE public.ai_usage_tracking ADD COLUMN prompt TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage_tracking' AND column_name='response') THEN
        ALTER TABLE public.ai_usage_tracking ADD COLUMN response JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage_tracking' AND column_name='subject') THEN
        ALTER TABLE public.ai_usage_tracking ADD COLUMN subject TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_usage_tracking' AND column_name='topic') THEN
        ALTER TABLE public.ai_usage_tracking ADD COLUMN topic TEXT;
    END IF;
END $$;

-- Update the feature_type check constraint
ALTER TABLE public.ai_usage_tracking 
DROP CONSTRAINT IF EXISTS ai_usage_tracking_feature_type_check;

ALTER TABLE public.ai_usage_tracking 
ADD CONSTRAINT ai_usage_tracking_feature_type_check 
CHECK (feature_type IN ('knowledge_organizer', 'flashcards', 'question', 'answer_evaluation', 'chat', 'simple_question', 'question_generation'));

-- Create indexes
CREATE INDEX IF NOT EXISTS ai_usage_tracking_user_id_idx ON public.ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_tracking_feature_type_idx ON public.ai_usage_tracking(feature_type);
CREATE INDEX IF NOT EXISTS ai_usage_tracking_created_at_idx ON public.ai_usage_tracking(created_at);

-- Enable RLS
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own AI usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can insert their own AI usage"
  ON public.ai_usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own AI usage" ON public.ai_usage_tracking;
CREATE POLICY "Users can update their own AI usage"
  ON public.ai_usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Migration Complete!
-- ============================================
