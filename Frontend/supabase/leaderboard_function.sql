-- Secure Leaderboard Function with Real Streak Calculation
-- Calculates user scores and streaks server-side to avoid exposing private data via RLS
-- 
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO UPDATE THE FUNCTION
--

-- Helper function to calculate user streak
CREATE OR REPLACE FUNCTION calculate_user_streak(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_dates DATE[];
  current_date_check DATE;
  streak_count INTEGER := 0;
BEGIN
  -- Collect all activity dates from multiple sources
  SELECT ARRAY_AGG(DISTINCT activity_date) INTO activity_dates
  FROM (
    -- AI usage dates
    SELECT DATE(created_at) as activity_date FROM ai_usage_tracking WHERE user_id = target_user_id
    UNION
    -- Notes created/updated
    SELECT DATE(created_at) FROM notes WHERE user_id = target_user_id
    UNION
    SELECT DATE(updated_at) FROM notes WHERE user_id = target_user_id
    UNION
    -- Flashcards created/updated  
    SELECT DATE(created_at) FROM flashcards WHERE user_id = target_user_id
    UNION
    SELECT DATE(updated_at) FROM flashcards WHERE user_id = target_user_id
    UNION
    -- Knowledge organizers created/updated
    SELECT DATE(created_at) FROM knowledge_organizers WHERE user_id = target_user_id
    UNION
    SELECT DATE(updated_at) FROM knowledge_organizers WHERE user_id = target_user_id
    UNION
    -- Past papers created/updated
    SELECT DATE(created_at) FROM past_papers WHERE user_id = target_user_id
    UNION
    SELECT DATE(updated_at) FROM past_papers WHERE user_id = target_user_id
    UNION
    -- Study sessions (if table exists)
    SELECT DATE(date) FROM study_sessions WHERE user_id = target_user_id
  ) all_dates
  WHERE activity_date IS NOT NULL;

  -- If no activity, return 0
  IF activity_dates IS NULL OR array_length(activity_dates, 1) IS NULL THEN
    RETURN 0;
  END IF;

  -- Check if today or yesterday has activity (to start counting)
  current_date_check := CURRENT_DATE;
  
  IF NOT (current_date_check = ANY(activity_dates) OR (current_date_check - INTERVAL '1 day')::DATE = ANY(activity_dates)) THEN
    RETURN 0; -- Streak broken, no recent activity
  END IF;

  -- Start from today if active, otherwise yesterday
  IF current_date_check = ANY(activity_dates) THEN
    current_date_check := CURRENT_DATE;
  ELSE
    current_date_check := (CURRENT_DATE - INTERVAL '1 day')::DATE;
  END IF;

  -- Count consecutive days backwards
  WHILE current_date_check = ANY(activity_dates) LOOP
    streak_count := streak_count + 1;
    current_date_check := current_date_check - INTERVAL '1 day';
  END LOOP;

  RETURN streak_count;
END;
$$;

-- Main leaderboard function
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  xp BIGINT,
  streak INTEGER,
  rank BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to count private data
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_scores AS (
    SELECT 
      p.id as uid,
      COALESCE(p.full_name, split_part(p.email, '@', 1), 'User') as display_name,
      p.avatar_url,
      -- Calculate XP: 50 per paper, 10 per flashcard, 20 per note, 5 per AI usage, 30 per knowledge organizer
      (
        (SELECT COUNT(*) FROM past_papers pp WHERE pp.user_id = p.id) * 50 +
        (SELECT COUNT(*) FROM flashcards fc WHERE fc.user_id = p.id) * 10 +
        (SELECT COUNT(*) FROM notes n WHERE n.user_id = p.id) * 20 +
        (SELECT COUNT(*) FROM ai_usage_tracking ai WHERE ai.user_id = p.id) * 5 +
        (SELECT COUNT(*) FROM knowledge_organizers ko WHERE ko.user_id = p.id) * 30
      ) as calculated_xp,
      -- Calculate real streak using helper function
      calculate_user_streak(p.id) as calculated_streak
    FROM profiles p
    -- Only include users who have at least some activity or are premium
    WHERE p.id IN (
      SELECT user_id FROM past_papers 
      UNION SELECT user_id FROM flashcards 
      UNION SELECT user_id FROM notes
      UNION SELECT user_id FROM ai_usage_tracking
      UNION SELECT user_id FROM knowledge_organizers
    )
       OR p.is_premium = true
  )
  SELECT 
    us.uid,
    us.display_name,
    us.avatar_url,
    us.calculated_xp,
    us.calculated_streak,
    RANK() OVER (ORDER BY us.calculated_xp DESC)
  FROM user_scores us
  ORDER BY us.calculated_xp DESC
  LIMIT limit_count;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER) TO service_role;

-- Comments
COMMENT ON FUNCTION calculate_user_streak IS 'Calculates consecutive days of study activity for a user';
COMMENT ON FUNCTION get_leaderboard IS 'Securely calculates and returns leaderboard data with real streak calculation';
