-- Expanded prospects: stores additional prospects generated on demand via "Load More"
-- Separate from cached_intelligence so they persist across refreshes

CREATE TABLE IF NOT EXISTS expanded_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_id TEXT NOT NULL,
  vertical_id TEXT NOT NULL,
  vertical_name TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'national' CHECK (scope IN ('local', 'national', 'international')),
  prospect_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate company expansions per user
  UNIQUE(user_id, prospect_id)
);

-- Indexes for common queries
CREATE INDEX idx_expanded_prospects_user ON expanded_prospects(user_id);
CREATE INDEX idx_expanded_prospects_vertical ON expanded_prospects(user_id, vertical_id);
CREATE INDEX idx_expanded_prospects_scope ON expanded_prospects(user_id, scope);

-- RLS
ALTER TABLE expanded_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own expanded prospects"
  ON expanded_prospects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Track which verticals a user has explored (for "Discover" UI)
CREATE TABLE IF NOT EXISTS explored_verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vertical_id TEXT NOT NULL,
  vertical_name TEXT NOT NULL,
  sector_name TEXT NOT NULL,
  times_expanded INTEGER NOT NULL DEFAULT 1,
  last_expanded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, vertical_id)
);

ALTER TABLE explored_verticals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own explored verticals"
  ON explored_verticals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_explored_verticals_user ON explored_verticals(user_id);
