-- Performance Analytics Table
-- Aggregates performance data for heat map visualization

CREATE TABLE IF NOT EXISTS performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  total_marks_possible INTEGER DEFAULT 0,
  total_marks_achieved INTEGER DEFAULT 0,
  performance_score DECIMAL(5,2), -- Percentage score
  status TEXT CHECK (status IN ('red', 'amber', 'green')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject, topic)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS performance_analytics_user_id_idx ON performance_analytics(user_id);
CREATE INDEX IF NOT EXISTS performance_analytics_subject_idx ON performance_analytics(subject);
CREATE INDEX IF NOT EXISTS performance_analytics_status_idx ON performance_analytics(status);
CREATE INDEX IF NOT EXISTS performance_analytics_score_idx ON performance_analytics(performance_score DESC);

-- Enable Row Level Security
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics"
  ON performance_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON performance_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON performance_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics"
  ON performance_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- Function to calculate status from score
CREATE OR REPLACE FUNCTION calculate_performance_status(score DECIMAL)
RETURNS TEXT AS $$
BEGIN
  CASE 
    WHEN score >= 70 THEN RETURN 'green';
    WHEN score >= 50 THEN RETURN 'amber';
    ELSE RETURN 'red';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update status when performance_score changes
CREATE OR REPLACE FUNCTION update_performance_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.performance_score IS NOT NULL THEN
    NEW.status = calculate_performance_status(NEW.performance_score);
  END IF;
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER performance_status_trigger
  BEFORE INSERT OR UPDATE ON performance_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_status();

-- Function to update analytics from exam submission
CREATE OR REPLACE FUNCTION update_analytics_from_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_topic TEXT := COALESCE(NEW.subject, 'Overall');
BEGIN
  -- Insert or update performance analytics
  INSERT INTO performance_analytics (
    user_id,
    subject,
    topic,
    total_attempts,
    total_marks_possible,
    total_marks_achieved,
    performance_score
  )
  VALUES (
    NEW.user_id,
    NEW.subject,
    v_topic,
    1,
    NEW.total_marks,
    NEW.achieved_marks,
    CASE 
      WHEN NEW.total_marks > 0 THEN (NEW.achieved_marks::DECIMAL / NEW.total_marks::DECIMAL * 100)
      ELSE 0 
    END
  )
  ON CONFLICT (user_id, subject, topic)
  DO UPDATE SET
    total_attempts = performance_analytics.total_attempts + 1,
    total_marks_possible = performance_analytics.total_marks_possible + NEW.total_marks,
    total_marks_achieved = performance_analytics.total_marks_achieved + NEW.achieved_marks,
    performance_score = CASE 
      WHEN (performance_analytics.total_marks_possible + NEW.total_marks) > 0 
      THEN ((performance_analytics.total_marks_achieved + NEW.achieved_marks)::DECIMAL / 
            (performance_analytics.total_marks_possible + NEW.total_marks)::DECIMAL * 100)
      ELSE 0 
    END,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update analytics when exam submission is created
CREATE TRIGGER exam_submission_analytics_trigger
  AFTER INSERT ON exam_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_from_submission();

-- Comments
COMMENT ON TABLE performance_analytics IS 'Aggregated performance data for heat map visualization';
COMMENT ON COLUMN performance_analytics.status IS 'Color coding: green (70+%), amber (50-69%), red (<50%)';
COMMENT ON FUNCTION calculate_performance_status IS 'Returns red/amber/green status based on percentage score';
