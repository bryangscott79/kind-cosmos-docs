-- AI Tools Tracker: catalog of AI tools, releases, and business impact
-- This is a top-of-funnel resource — readable by everyone (anon + authenticated)

CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  maker TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'foundation_models', 'image_generation', 'video_generation',
    'audio_voice', 'code_developer', 'business_automation',
    'design_creative', 'data_analytics', 'writing_content', 'specialized'
  )),
  subcategory TEXT,
  description TEXT,
  key_capabilities TEXT[] DEFAULT '{}',
  pricing_model TEXT CHECK (pricing_model IN ('free', 'freemium', 'paid', 'enterprise')),
  latest_version TEXT,
  latest_release_date DATE,
  release_history JSONB DEFAULT '[]',
  adoption_score INTEGER DEFAULT 50 CHECK (adoption_score BETWEEN 0 AND 100),
  maturity TEXT CHECK (maturity IN ('emerging', 'growing', 'mature', 'dominant')),
  integrations TEXT[] DEFAULT '{}',
  api_available BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_slug ON ai_tools(slug);
CREATE INDEX idx_ai_tools_maturity ON ai_tools(maturity);
CREATE INDEX idx_ai_tools_maker ON ai_tools(maker);
CREATE INDEX idx_ai_tools_tags ON ai_tools USING GIN(tags);
CREATE INDEX idx_ai_tools_capabilities ON ai_tools USING GIN(key_capabilities);
CREATE INDEX idx_ai_tools_release_date ON ai_tools(latest_release_date DESC);

-- RLS: readable by everyone (top of funnel), write restricted to service role
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_tools_public_read" ON ai_tools FOR SELECT USING (true);
