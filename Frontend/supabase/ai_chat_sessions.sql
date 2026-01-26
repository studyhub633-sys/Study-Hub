-- ============================================
-- AI Chat Sessions Table
-- Stores conversation history for AI Tutoring Bot
-- ============================================

-- Create the chat sessions table
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  context TEXT,
  mode TEXT DEFAULT 'chat' CHECK (mode IN ('chat', 'question', 'evaluate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS ai_chat_sessions_user_id_idx ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS ai_chat_sessions_updated_at_idx ON public.ai_chat_sessions(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sessions

DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users can view their own chat sessions"
  ON public.ai_chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users can insert their own chat sessions"
  ON public.ai_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users can update their own chat sessions"
  ON public.ai_chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users can delete their own chat sessions"
  ON public.ai_chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on any update
DROP TRIGGER IF EXISTS update_ai_chat_sessions_updated_at_trigger ON public.ai_chat_sessions;
CREATE TRIGGER update_ai_chat_sessions_updated_at_trigger
  BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_chat_sessions_updated_at();

-- ============================================
-- Migration Complete!
-- ============================================
