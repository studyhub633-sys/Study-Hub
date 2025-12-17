-- ============================================
-- Seed Data for Study Spark Hub
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: Dashboard → SQL Editor → New Query
-- 
-- NOTE: Replace 'YOUR_USER_ID_HERE' with an actual user ID
-- You can get your user ID from: auth.users table or from your profile
-- ============================================

-- First, get a user ID (replace this with your actual user ID)
-- You can find your user ID by running: SELECT id FROM auth.users LIMIT 1;
-- Or use: SELECT id FROM profiles LIMIT 1;

-- ============================================
-- Seed Past Papers
-- ============================================
-- Example: Insert past papers for a user
-- Replace 'YOUR_USER_ID_HERE' with actual user ID

INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, score, max_score, completed_at)
SELECT 
  id as user_id,
  'Cell Biology & Genetics' as title,
  'Biology' as subject,
  2024 as year,
  'AQA' as exam_board,
  82 as score,
  100 as max_score,
  NOW() - INTERVAL '5 days' as completed_at
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, score, max_score, completed_at)
SELECT 
  id as user_id,
  'Organic Chemistry Paper 1' as title,
  'Chemistry' as subject,
  2024 as year,
  'Edexcel' as exam_board,
  68 as score,
  100 as max_score,
  NOW() - INTERVAL '3 days' as completed_at
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, completed_at)
SELECT 
  id as user_id,
  'Mechanics & Motion' as title,
  'Physics' as subject,
  2023 as year,
  'OCR' as exam_board,
  NULL as completed_at
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed Knowledge Organizers
-- ============================================
-- Example: Insert knowledge organizers for a user

INSERT INTO public.knowledge_organizers (user_id, title, subject, topic, content)
SELECT 
  id as user_id,
  'Cell Biology Overview' as title,
  'Biology' as subject,
  'Cell Biology' as topic,
  '{
    "sections": [
      {
        "title": "Cell Structure",
        "content": "Cells are the basic structural and functional units of all living organisms. They contain various organelles that perform specific functions.",
        "keyPoints": ["Prokaryotic vs Eukaryotic cells", "Cell membrane structure", "Nucleus and DNA"],
        "color": "primary"
      },
      {
        "title": "Cell Organelles",
        "content": "Organelles are specialized structures within cells that perform specific functions.",
        "keyPoints": ["Mitochondria - energy production", "Ribosomes - protein synthesis", "ER and Golgi - processing"],
        "color": "secondary"
      },
      {
        "title": "Cell Division",
        "content": "Cells divide through mitosis (for growth) and meiosis (for reproduction).",
        "keyPoints": ["Mitosis stages", "Meiosis and genetic variation", "Cell cycle regulation"],
        "color": "accent"
      }
    ],
    "progress": 75
  }'::jsonb as content
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.knowledge_organizers (user_id, title, subject, topic, content)
SELECT 
  id as user_id,
  'Newton''s Laws of Motion' as title,
  'Physics' as subject,
  'Mechanics' as topic,
  '{
    "sections": [
      {
        "title": "First Law - Inertia",
        "content": "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
        "keyPoints": ["Definition of inertia", "Examples in daily life", "Reference frames"],
        "color": "primary"
      },
      {
        "title": "Second Law - F=ma",
        "content": "Force equals mass times acceleration. The greater the force, the greater the acceleration.",
        "keyPoints": ["Formula derivation", "Units and measurements", "Free body diagrams"],
        "color": "secondary"
      },
      {
        "title": "Third Law - Action-Reaction",
        "content": "For every action, there is an equal and opposite reaction.",
        "keyPoints": ["Force pairs", "Examples", "Common misconceptions"],
        "color": "accent"
      }
    ],
    "progress": 60
  }'::jsonb as content
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed Extracurriculars
-- ============================================
-- Example: Insert extracurricular activities for a user

INSERT INTO public.extracurriculars (user_id, name, description, category, hours, start_date, end_date, achievements)
SELECT 
  id as user_id,
  'Software Development Intern' as name,
  'Worked on frontend development using React and TypeScript.' as description,
  'work' as category,
  120 as hours,
  '2024-06-01'::date as start_date,
  '2024-08-31'::date as end_date,
  ARRAY['Built customer dashboard', 'Fixed 25+ bugs'] as achievements
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.extracurriculars (user_id, name, description, category, hours, start_date, achievements)
SELECT 
  id as user_id,
  'Hospital Volunteer' as name,
  'Assisted patients and helped with administrative tasks.' as description,
  'volunteer' as category,
  45 as hours,
  '2024-09-01'::date as start_date,
  ARRAY['Received volunteer appreciation award'] as achievements
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.extracurriculars (user_id, name, description, category, hours, start_date, achievements)
SELECT 
  id as user_id,
  'Debate Club' as name,
  'Organize weekly debates and mentor junior members.' as description,
  'club' as category,
  80 as hours,
  '2023-09-01'::date as start_date,
  ARRAY['Regional finalist', 'Best speaker award'] as achievements
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- Notes:
-- - This seed script uses the first user from auth.users
-- - Replace the SELECT ... FROM auth.users LIMIT 1 with your actual user ID if needed
-- - The ON CONFLICT DO NOTHING prevents duplicate inserts
-- - You can modify the data as needed for your use case
-- ============================================







