-- Focus Mode Tasks Table
-- ============================================
-- Stores user tasks for the Focus Mode feature
-- ============================================

CREATE TABLE IF NOT EXISTS focus_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own focus tasks"
    ON focus_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus tasks"
    ON focus_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus tasks"
    ON focus_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus tasks"
    ON focus_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS focus_tasks_user_id_idx ON focus_tasks(user_id);
CREATE INDEX IF NOT EXISTS focus_tasks_created_at_idx ON focus_tasks(created_at DESC);

-- Grant permissions
GRANT ALL ON focus_tasks TO authenticated;
GRANT SELECT ON focus_tasks TO anon;

COMMENT ON TABLE focus_tasks IS 'Stores user tasks for the Focus Mode / Pomodoro feature';
