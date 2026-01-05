-- ============================================
-- Homework Tracker Table
-- ============================================
-- Premium feature for tracking homework assignments
-- ============================================

CREATE TABLE IF NOT EXISTS public.homework (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS homework_user_id_idx ON public.homework(user_id);
CREATE INDEX IF NOT EXISTS homework_due_date_idx ON public.homework(due_date);
CREATE INDEX IF NOT EXISTS homework_completed_idx ON public.homework(completed);

-- Enable RLS
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own homework"
  ON public.homework FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own homework"
  ON public.homework FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own homework"
  ON public.homework FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own homework"
  ON public.homework FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON public.homework
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

