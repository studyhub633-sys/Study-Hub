-- ============================================
-- Study Plans Tables
-- ============================================
-- Premium feature for AI-powered study planning
-- ============================================

-- Exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  exam_date DATE NOT NULL,
  exam_time TIME,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Study plans table
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  duration_minutes INTEGER DEFAULT 60,
  study_method TEXT,
  resources TEXT[] DEFAULT ARRAY[]::TEXT[],
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS exams_user_id_idx ON public.exams(user_id);
CREATE INDEX IF NOT EXISTS exams_exam_date_idx ON public.exams(exam_date);
CREATE INDEX IF NOT EXISTS study_plans_user_id_idx ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS study_plans_date_idx ON public.study_plans(date);
CREATE INDEX IF NOT EXISTS study_plans_exam_id_idx ON public.study_plans(exam_id);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Users can view their own exams"
  ON public.exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams"
  ON public.exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON public.exams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON public.exams FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for study_plans
CREATE POLICY "Users can view their own study plans"
  ON public.study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study plans"
  ON public.study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans"
  ON public.study_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans"
  ON public.study_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

