-- Exam Submissions Tables
-- Stores AI-graded exam submissions and individual answers

CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paper_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  exam_board TEXT,
  year INTEGER,
  total_marks INTEGER NOT NULL DEFAULT 0,
  achieved_marks INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_marks > 0 THEN (achieved_marks::DECIMAL / total_marks::DECIMAL * 100)
      ELSE 0 
    END
  ) STORED,
  grade TEXT,
  ai_feedback JSONB, -- Detailed AI feedback and suggestions
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES exam_submissions(id) ON DELETE CASCADE,
  question_number TEXT NOT NULL,
  student_answer TEXT NOT NULL,
  marks_awarded INTEGER NOT NULL DEFAULT 0,
  max_marks INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  strengths TEXT[], -- Array of strength points
  improvements TEXT[], -- Array of improvement suggestions
  mark_scheme TEXT, -- Optional mark scheme for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS exam_submissions_user_id_idx ON exam_submissions(user_id);
CREATE INDEX IF NOT EXISTS exam_submissions_subject_idx ON exam_submissions(subject);
CREATE INDEX IF NOT EXISTS exam_submissions_date_idx ON exam_submissions(submission_date DESC);
CREATE INDEX IF NOT EXISTS exam_submissions_grade_idx ON exam_submissions(grade);
CREATE INDEX IF NOT EXISTS exam_answers_submission_id_idx ON exam_answers(submission_id);

-- Enable Row Level Security
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exam_submissions
CREATE POLICY "Users can view own exam submissions"
  ON exam_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam submissions"
  ON exam_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam submissions"
  ON exam_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam submissions"
  ON exam_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for exam_answers
CREATE POLICY "Users can view own exam answers"
  ON exam_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exam_submissions 
      WHERE exam_submissions.id = exam_answers.submission_id 
      AND exam_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exam answers"
  ON exam_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_submissions 
      WHERE exam_submissions.id = exam_answers.submission_id 
      AND exam_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exam answers"
  ON exam_answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exam_submissions 
      WHERE exam_submissions.id = exam_answers.submission_id 
      AND exam_submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exam answers"
  ON exam_answers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exam_submissions 
      WHERE exam_submissions.id = exam_answers.submission_id 
      AND exam_submissions.user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE exam_submissions IS 'Stores AI-graded exam submissions with overall results';
COMMENT ON TABLE exam_answers IS 'Stores individual question answers and AI marking feedback';
COMMENT ON COLUMN exam_submissions.percentage IS 'Auto-calculated from achieved_marks/total_marks * 100';
