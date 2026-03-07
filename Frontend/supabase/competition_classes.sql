-- ============================================
-- Competition Classes (Class Dojo-style)
-- ============================================
-- Classes where students join with a code and log revision time.
-- Leaderboard ranks by total revision minutes (per week/month).
-- ============================================

-- Competition classes: teacher creates, gets a join code
CREATE TABLE IF NOT EXISTS public.competition_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Members: teachers and students in a class
CREATE TABLE IF NOT EXISTS public.competition_class_members (
  class_id UUID REFERENCES public.competition_classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (class_id, user_id)
);

-- Revision logs: how many minutes the user revised (optionally for a class)
CREATE TABLE IF NOT EXISTS public.revision_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.competition_classes(id) ON DELETE SET NULL,
  minutes INTEGER NOT NULL CHECK (minutes > 0 AND minutes <= 1440),
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS competition_classes_created_by_idx ON public.competition_classes(created_by);
CREATE INDEX IF NOT EXISTS competition_classes_join_code_idx ON public.competition_classes(join_code);
CREATE INDEX IF NOT EXISTS competition_class_members_class_id_idx ON public.competition_class_members(class_id);
CREATE INDEX IF NOT EXISTS competition_class_members_user_id_idx ON public.competition_class_members(user_id);
CREATE INDEX IF NOT EXISTS revision_logs_user_id_idx ON public.revision_logs(user_id);
CREATE INDEX IF NOT EXISTS revision_logs_class_id_idx ON public.revision_logs(class_id);
CREATE INDEX IF NOT EXISTS revision_logs_logged_at_idx ON public.revision_logs(logged_at);

-- RLS
ALTER TABLE public.competition_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_logs ENABLE ROW LEVEL SECURITY;

-- competition_classes: creator can do anything; members can SELECT
DROP POLICY IF EXISTS "Competition classes: creator full access" ON public.competition_classes;
CREATE POLICY "Competition classes: creator full access"
  ON public.competition_classes FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Competition classes: members can view" ON public.competition_classes;
CREATE POLICY "Competition classes: members can view"
  ON public.competition_classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competition_class_members m
      WHERE m.class_id = competition_classes.id AND m.user_id = auth.uid()
    )
  );

-- competition_class_members: teacher of class can manage; users can insert themselves (join) with role student
DROP POLICY IF EXISTS "Class members: teacher can manage" ON public.competition_class_members;
CREATE POLICY "Class members: teacher can manage"
  ON public.competition_class_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.competition_class_members m
      WHERE m.class_id = competition_class_members.class_id AND m.user_id = auth.uid() AND m.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competition_class_members m
      WHERE m.class_id = competition_class_members.class_id AND m.user_id = auth.uid() AND m.role = 'teacher'
    )
  );

DROP POLICY IF EXISTS "Class members: users can join as student" ON public.competition_class_members;
CREATE POLICY "Class members: users can join"
  ON public.competition_class_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      role = 'student'
      OR (role = 'teacher' AND EXISTS (SELECT 1 FROM competition_classes c WHERE c.id = class_id AND c.created_by = auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Class members: users can view own memberships" ON public.competition_class_members;
CREATE POLICY "Class members: users can view own memberships"
  ON public.competition_class_members FOR SELECT
  USING (auth.uid() = user_id);

-- revision_logs: users can insert/update/delete own; members of same class can SELECT (for leaderboard)
DROP POLICY IF EXISTS "Revision logs: own full access" ON public.revision_logs;
CREATE POLICY "Revision logs: own full access"
  ON public.revision_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Revision logs: class members can read for leaderboard" ON public.revision_logs;
CREATE POLICY "Revision logs: class members can read for leaderboard"
  ON public.revision_logs FOR SELECT
  USING (
    class_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.competition_class_members m
      WHERE m.class_id = revision_logs.class_id AND m.user_id = auth.uid()
    )
  );

-- ============================================
-- RPC: Get class leaderboard by revision minutes
-- ============================================
CREATE OR REPLACE FUNCTION get_class_leaderboard(
  p_class_id UUID,
  p_period TEXT DEFAULT 'week'
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  total_minutes BIGINT,
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
  ELSE
    start_date := date_trunc('week', CURRENT_DATE)::DATE;
  END IF;

  RETURN QUERY
  WITH member_minutes AS (
    SELECT
      m.user_id,
      COALESCE(SUM(r.minutes), 0)::BIGINT AS total
    FROM competition_class_members m
    LEFT JOIN revision_logs r ON r.user_id = m.user_id AND r.class_id = m.class_id
      AND r.logged_at >= start_date
    WHERE m.class_id = p_class_id
    GROUP BY m.user_id
  ),
  ranked AS (
    SELECT
      mm.user_id,
      COALESCE(p.full_name, split_part(p.email, '@', 1), 'Student') AS display_name,
      p.avatar_url,
      mm.total,
      DENSE_RANK() OVER (ORDER BY mm.total DESC) AS rk
    FROM member_minutes mm
    JOIN profiles p ON p.id = mm.user_id
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

-- RPC: Look up class by join code (for join flow; does not expose full table)
CREATE OR REPLACE FUNCTION get_class_by_join_code(p_join_code TEXT)
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name
  FROM competition_classes c
  WHERE c.join_code = upper(trim(p_join_code));
END;
$$;
GRANT EXECUTE ON FUNCTION get_class_by_join_code(TEXT) TO authenticated;

COMMENT ON TABLE competition_classes IS 'Competition classes (Class Dojo-style) with join codes';
COMMENT ON TABLE revision_logs IS 'User revision time in minutes, optionally scoped to a class';
