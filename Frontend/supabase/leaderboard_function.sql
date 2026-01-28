-- ============================================
-- Secure Leaderboard Function with COMPREHENSIVE Study Tracking
-- ============================================
-- Calculates XP and streaks from ALL study-related activities
-- NOW INCLUDES ALL USERS (Even with 0 XP)
-- ============================================

-- Drop existing functions first (if they exist)
DROP FUNCTION IF EXISTS calculate_user_streak(UUID);
DROP FUNCTION IF EXISTS get_leaderboard(INTEGER);

-- ============================================
-- Helper function to calculate user streak
-- ============================================
-- Counts consecutive days of ANY study activity
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
  -- Collect ALL activity dates from ALL study-related sources
  SELECT ARRAY_AGG(DISTINCT activity_date) INTO activity_dates
  FROM (
    -- AI usage (chat, questions, etc.)
    SELECT DATE(created_at) as activity_date FROM ai_usage_tracking WHERE user_id = target_user_id
    UNION ALL
    -- AI chat sessions
    SELECT DATE(created_at) FROM ai_chat_sessions WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM ai_chat_sessions WHERE user_id = target_user_id
    UNION ALL
    -- Notes created/updated
    SELECT DATE(created_at) FROM notes WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM notes WHERE user_id = target_user_id
    UNION ALL
    -- Flashcards created/updated/reviewed
    SELECT DATE(created_at) FROM flashcards WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM flashcards WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(last_reviewed) FROM flashcards WHERE user_id = target_user_id AND last_reviewed IS NOT NULL
    UNION ALL
    -- Knowledge organizers created/updated
    SELECT DATE(created_at) FROM knowledge_organizers WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM knowledge_organizers WHERE user_id = target_user_id
    UNION ALL
    -- Past papers created/updated/completed
    SELECT DATE(created_at) FROM past_papers WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM past_papers WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(completed_at) FROM past_papers WHERE user_id = target_user_id AND completed_at IS NOT NULL
    UNION ALL
    -- Homework created/updated/completed
    SELECT DATE(created_at) FROM homework WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM homework WHERE user_id = target_user_id
    UNION ALL
    -- Tasks created/updated
    SELECT DATE(created_at) FROM tasks WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM tasks WHERE user_id = target_user_id
    UNION ALL
    -- Mind maps created/updated
    SELECT DATE(created_at) FROM mind_maps WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM mind_maps WHERE user_id = target_user_id
    UNION ALL
    -- Exam submissions
    SELECT DATE(submission_date) FROM exam_submissions WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(created_at) FROM exam_submissions WHERE user_id = target_user_id
    UNION ALL
    -- Study sessions (manual tracking)
    SELECT DATE(date) FROM study_sessions WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(created_at) FROM study_sessions WHERE user_id = target_user_id
    UNION ALL
    -- Extracurriculars
    SELECT DATE(created_at) FROM extracurriculars WHERE user_id = target_user_id
    UNION ALL
    SELECT DATE(updated_at) FROM extracurriculars WHERE user_id = target_user_id
  ) all_dates
  WHERE activity_date IS NOT NULL;

  -- If no activity at all, return 0
  IF activity_dates IS NULL OR array_length(activity_dates, 1) IS NULL THEN
    RETURN 0;
  END IF;

  -- Check if today or yesterday has activity (streak must be current)
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

-- ============================================
-- Main leaderboard function
-- ============================================
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  xp BIGINT,
  streak INTEGER,
  rank BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to count across tables
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_scores AS (
    SELECT 
      p.id as uid,
      COALESCE(p.full_name, split_part(p.email, '@', 1), 'Student') as display_name,
      p.avatar_url,
      -- Calculate XP from ALL study activities with appropriate weights
      (
        -- Core study items
        COALESCE((SELECT COUNT(*) FROM notes n WHERE n.user_id = p.id), 0) * 20 +           -- 20 XP per note
        COALESCE((SELECT COUNT(*) FROM flashcards fc WHERE fc.user_id = p.id), 0) * 10 +    -- 10 XP per flashcard
        COALESCE((SELECT COUNT(*) FROM past_papers pp WHERE pp.user_id = p.id), 0) * 50 +   -- 50 XP per past paper
        COALESCE((SELECT COUNT(*) FROM knowledge_organizers ko WHERE ko.user_id = p.id), 0) * 30 + -- 30 XP per organizer
        
        -- AI interactions
        COALESCE((SELECT COUNT(*) FROM ai_usage_tracking ai WHERE ai.user_id = p.id), 0) * 5 + -- 5 XP per AI interaction
        COALESCE((SELECT COUNT(*) FROM ai_chat_sessions acs WHERE acs.user_id = p.id), 0) * 10 + -- 10 XP per chat session
        
        -- Homework and tasks
        COALESCE((SELECT COUNT(*) FROM homework hw WHERE hw.user_id = p.id AND hw.completed = true), 0) * 25 + -- 25 XP per completed homework
        COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.user_id = p.id AND t.completed = true), 0) * 15 + -- 15 XP per completed task
        
        -- Advanced study tools
        COALESCE((SELECT COUNT(*) FROM mind_maps mm WHERE mm.user_id = p.id), 0) * 25 +     -- 25 XP per mind map
        COALESCE((SELECT COUNT(*) FROM exam_submissions es WHERE es.user_id = p.id), 0) * 100 + -- 100 XP per exam submission
        
        -- Study sessions
        COALESCE((SELECT COUNT(*) FROM study_sessions ss WHERE ss.user_id = p.id), 0) * 20 + -- 20 XP per study session
        
        -- Extracurriculars
        COALESCE((SELECT COUNT(*) FROM extracurriculars ex WHERE ex.user_id = p.id), 0) * 15 + -- 15 XP per extracurricular
        
        -- Flashcard reviews (bonus for active review)
        COALESCE((SELECT COALESCE(SUM(review_count), 0) FROM flashcards fc WHERE fc.user_id = p.id), 0) * 2 -- 2 XP per flashcard review
      ) as calculated_xp,
      -- Calculate real streak
      calculate_user_streak(p.id) as calculated_streak
    FROM profiles p
    -- REMOVED Filtering: Now includes ALL users in profiles table
  )
  SELECT 
    us.uid,
    us.display_name,
    us.avatar_url,
    us.calculated_xp,
    us.calculated_streak,
    DENSE_RANK() OVER (ORDER BY us.calculated_xp DESC)
  FROM user_scores us
  -- REMOVED: WHERE us.calculated_xp > 0 
  ORDER BY us.calculated_xp DESC
  LIMIT limit_count;
END;
$$;

-- ============================================
-- Grant execution permissions
-- ============================================
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER) TO service_role;

-- ============================================
-- Documentation
-- ============================================
COMMENT ON FUNCTION calculate_user_streak IS 'Calculates consecutive days of ANY study activity for a user';
COMMENT ON FUNCTION get_leaderboard IS 'Returns ranked leaderboard for ALL users including those with 0 XP';
