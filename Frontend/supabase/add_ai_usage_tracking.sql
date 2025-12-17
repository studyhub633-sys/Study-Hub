-- ============================================
-- AI Usage Tracking Table
-- ============================================
-- This table tracks AI generation attempts per user
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Create ai_usage_tracking table
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('knowledge_organizer', 'flashcards', 'question', 'answer_evaluation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ai_usage_tracking_user_id_idx ON public.ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_tracking_feature_type_idx ON public.ai_usage_tracking(feature_type);
CREATE INDEX IF NOT EXISTS ai_usage_tracking_created_at_idx ON public.ai_usage_tracking(created_at);

-- Enable RLS
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage"
  ON public.ai_usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to get usage count for a specific feature
CREATE OR REPLACE FUNCTION public.get_ai_usage_count(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.ai_usage_tracking
    WHERE user_id = p_user_id
      AND feature_type = p_feature_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Notes:
-- - This table tracks all AI generation attempts
-- - Feature type 'knowledge_organizer' is limited to 10 attempts per user
-- - The limit is enforced in the API endpoint
-- ============================================





