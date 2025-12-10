-- ============================================
-- Study Spark Hub Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: Dashboard → SQL Editor → New Query
-- ============================================

-- ============================================
-- 1. Enable necessary extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. Create Profiles Table
-- ============================================
-- This table stores additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. Create Notes Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  subject TEXT,
  topic TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 4. Create Flashcards Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  difficulty INTEGER DEFAULT 1,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 5. Create Past Papers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.past_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  year INTEGER,
  exam_board TEXT,
  file_url TEXT,
  score INTEGER,
  max_score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 6. Create Knowledge Organizers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.knowledge_organizers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  subject TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 7. Create Extracurriculars Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.extracurriculars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  hours INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  achievements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 8. Function to automatically create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Trigger to call the function on user signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 10. Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. Add updated_at triggers to all tables
-- ============================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_past_papers_updated_at
  BEFORE UPDATE ON public.past_papers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_knowledge_organizers_updated_at
  BEFORE UPDATE ON public.knowledge_organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_extracurriculars_updated_at
  BEFORE UPDATE ON public.extracurriculars
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 12. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracurriculars ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 13. RLS Policies for Profiles
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for manual creation if needed)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 14. RLS Policies for Notes
-- ============================================
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 15. RLS Policies for Flashcards
-- ============================================
CREATE POLICY "Users can view own flashcards"
  ON public.flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own flashcards"
  ON public.flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards"
  ON public.flashcards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON public.flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 16. RLS Policies for Past Papers
-- ============================================
CREATE POLICY "Users can view own past papers"
  ON public.past_papers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own past papers"
  ON public.past_papers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own past papers"
  ON public.past_papers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own past papers"
  ON public.past_papers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 17. RLS Policies for Knowledge Organizers
-- ============================================
CREATE POLICY "Users can view own knowledge organizers"
  ON public.knowledge_organizers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own knowledge organizers"
  ON public.knowledge_organizers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge organizers"
  ON public.knowledge_organizers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge organizers"
  ON public.knowledge_organizers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 18. RLS Policies for Extracurriculars
-- ============================================
CREATE POLICY "Users can view own extracurriculars"
  ON public.extracurriculars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own extracurriculars"
  ON public.extracurriculars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extracurriculars"
  ON public.extracurriculars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own extracurriculars"
  ON public.extracurriculars FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 19. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_subject_idx ON public.notes(subject);
CREATE INDEX IF NOT EXISTS flashcards_user_id_idx ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS flashcards_subject_idx ON public.flashcards(subject);
CREATE INDEX IF NOT EXISTS past_papers_user_id_idx ON public.past_papers(user_id);
CREATE INDEX IF NOT EXISTS knowledge_organizers_user_id_idx ON public.knowledge_organizers(user_id);
CREATE INDEX IF NOT EXISTS extracurriculars_user_id_idx ON public.extracurriculars(user_id);

-- ============================================
-- Setup Complete!
-- ============================================
-- Your database is now configured with:
-- ✅ Profiles table (auto-created on signup)
-- ✅ Notes, Flashcards, Past Papers, Knowledge Organizers, Extracurriculars tables
-- ✅ Row Level Security policies (users can only access their own data)
-- ✅ Automatic profile creation on user signup
-- ✅ Updated_at timestamps on all tables
-- ============================================

