-- ============================================
-- Fix: Update feature_type constraint to match API values
-- The API sends feature types like 'generate-flashcards', 'generate-question', etc.
-- but the existing constraint only allows 'flashcards', 'question', etc.
-- This mismatch causes "Failed to record your usage" errors.
-- ============================================

-- Drop the old constraint
ALTER TABLE public.ai_usage_tracking 
DROP CONSTRAINT IF EXISTS ai_usage_tracking_feature_type_check;

-- Add updated constraint with ALL feature types used by the API
ALTER TABLE public.ai_usage_tracking 
ADD CONSTRAINT ai_usage_tracking_feature_type_check 
CHECK (feature_type IN (
  -- Original values
  'knowledge_organizer', 
  'flashcards', 
  'question', 
  'answer_evaluation', 
  'chat', 
  'simple_question', 
  'question_generation',
  -- API-used values (the actual ones sent by the code)
  'generate-flashcards',
  'generate-question',
  'generate-simple-question',
  'mind-map',
  'grade-exam'
));

-- ============================================
-- Run this in the Supabase SQL Editor
-- ============================================
