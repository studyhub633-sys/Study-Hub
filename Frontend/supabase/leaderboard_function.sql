-- Secure Leaderboard Function
-- Calculates user scores server-side to avoid exposing private data via RLS

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
      -- Calculate XP: 50 per paper, 10 per flashcard deck, 20 per note
      (
        (SELECT COUNT(*) FROM past_papers pp WHERE pp.user_id = p.id) * 50 +
        (SELECT COUNT(*) FROM flashcards fc WHERE fc.user_id = p.id) * 10 +
        (SELECT COUNT(*) FROM notes n WHERE n.user_id = p.id) * 20
      ) as calculated_xp,
      -- Mock streak data for now (random 1-50) until streak table exists
      FLOOR(RANDOM() * 50 + 1)::INTEGER as calculated_streak
    FROM profiles p
    -- Only include users who have at least some activity or are premium
    WHERE p.id IN (SELECT user_id FROM past_papers UNION SELECT user_id FROM flashcards UNION SELECT user_id FROM notes)
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
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard(INTEGER) TO service_role;

-- Comment
COMMENT ON FUNCTION get_leaderboard IS 'Securely calculates and returns leaderboard data bypassing RLS for counts';
