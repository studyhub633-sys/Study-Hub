-- ============================================
-- ClassDojo-style Points System
-- ============================================

-- Table to track individual points awarded to students
CREATE TABLE IF NOT EXISTS public.class_points_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.competition_classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS class_points_log_class_id_idx ON public.class_points_log(class_id);
CREATE INDEX IF NOT EXISTS class_points_log_student_id_idx ON public.class_points_log(student_id);
CREATE INDEX IF NOT EXISTS class_points_log_created_at_idx ON public.class_points_log(created_at);

-- RLS
ALTER TABLE public.class_points_log ENABLE ROW LEVEL SECURITY;

-- Teachers can insert points
DROP POLICY IF EXISTS "Class points: teachers can insert" ON public.class_points_log;
CREATE POLICY "Class points: teachers can insert"
  ON public.class_points_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competition_class_members m
      WHERE m.class_id = class_points_log.class_id AND m.user_id = auth.uid() AND m.role = 'teacher'
    )
  );

-- Everyone in the class can view points
DROP POLICY IF EXISTS "Class points: members can view" ON public.class_points_log;
CREATE POLICY "Class points: members can view"
  ON public.class_points_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competition_class_members m
      WHERE m.class_id = class_points_log.class_id AND m.user_id = auth.uid()
    )
  );

-- Function to safely award points
CREATE OR REPLACE FUNCTION award_class_points(
  p_class_id UUID,
  p_student_id UUID,
  p_points INTEGER,
  p_reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is a teacher
  IF NOT EXISTS (
    SELECT 1 FROM public.competition_class_members
    WHERE class_id = p_class_id AND user_id = auth.uid() AND role = 'teacher'
  ) THEN
    RAISE EXCEPTION 'Only teachers can award points';
  END IF;

  INSERT INTO public.class_points_log (class_id, student_id, teacher_id, points, reason)
  VALUES (p_class_id, p_student_id, auth.uid(), p_points, p_reason);
END;
$$;
GRANT EXECUTE ON FUNCTION award_class_points(UUID, UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION award_class_points(UUID, UUID, INTEGER, TEXT) TO service_role;


-- Drop the old get_class_leaderboard function as we are changing the return columns
DROP FUNCTION IF EXISTS get_class_leaderboard(UUID, TEXT);

-- Replace with new points-based leaderboard
CREATE OR REPLACE FUNCTION get_class_leaderboard(
  p_class_id UUID,
  p_period TEXT DEFAULT 'all_time'
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  total_points BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_date DATE;
BEGIN
  -- Ensure caller is a member of the class
  IF NOT EXISTS (
    SELECT 1 FROM competition_class_members m
    WHERE m.class_id = p_class_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a member of this class';
  END IF;

  IF p_period = 'month' THEN
    start_date := date_trunc('month', CURRENT_DATE)::DATE;
  ELSIF p_period = 'week' THEN
    start_date := date_trunc('week', CURRENT_DATE)::DATE;
  ELSE
    start_date := '1970-01-01'::DATE;
  END IF;

  RETURN QUERY
  WITH member_points AS (
    SELECT
      m.user_id,
      COALESCE(SUM(cpl.points), 0)::BIGINT AS total
    FROM competition_class_members m
    LEFT JOIN class_points_log cpl ON cpl.student_id = m.user_id AND cpl.class_id = m.class_id
      AND cpl.created_at >= start_date
    WHERE m.class_id = p_class_id AND m.role = 'student'
    GROUP BY m.user_id
  ),
  ranked AS (
    SELECT
      mp.user_id,
      COALESCE(p.full_name, split_part(p.email, '@', 1), 'Student') AS display_name,
      p.avatar_url,
      mp.total,
      DENSE_RANK() OVER (ORDER BY mp.total DESC) AS rk
    FROM member_points mp
    JOIN profiles p ON p.id = mp.user_id
  )
  SELECT
    ranked.user_id,
    ranked.display_name,
    ranked.avatar_url,
    ranked.total,
    ranked.rk
  FROM ranked
  ORDER BY ranked.rk;
END;
$$;

GRANT EXECUTE ON FUNCTION get_class_leaderboard(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_class_leaderboard(UUID, TEXT) TO service_role;
