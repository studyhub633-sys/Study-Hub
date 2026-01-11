-- Mind Maps Table
-- Stores AI-generated mind maps from user notes

CREATE TABLE IF NOT EXISTS mind_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  source_content TEXT, -- Original notes content
  source_file_url TEXT, -- If uploaded as file via Supabase Storage
  mind_map_data JSONB NOT NULL, -- Structured mind map data in hierarchical format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS mind_maps_user_id_idx ON mind_maps(user_id);
CREATE INDEX IF NOT EXISTS mind_maps_subject_idx ON mind_maps(subject);
CREATE INDEX IF NOT EXISTS mind_maps_created_at_idx ON mind_maps(created_at DESC);

-- Enable Row Level Security
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own mind maps"
  ON mind_maps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mind maps"
  ON mind_maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mind maps"
  ON mind_maps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mind maps"
  ON mind_maps FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mind_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mind_maps_updated_at_trigger
  BEFORE UPDATE ON mind_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_mind_maps_updated_at();

-- Comments
COMMENT ON TABLE mind_maps IS 'Stores AI-generated mind maps from user study notes';
COMMENT ON COLUMN mind_maps.mind_map_data IS 'JSON structure: { title: string, children: [{ title: string, children: [] }] }';
