-- =============================================================
-- AI Impact Intelligence Layer - Phase 1 Migration
-- Extends profiles, adds ai_impact_analysis and deep_reports
-- =============================================================

-- 1. Extend profiles with entity type, persona, and AI context fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_persona TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_maturity_self TEXT DEFAULT NULL;

-- Add check constraints for valid values
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_entity_type CHECK (
    entity_type IS NULL OR entity_type IN ('b2b', 'b2c', 'd2c', 'public', 'private', 'government', 'nonprofit')
  ),
  ADD CONSTRAINT valid_user_persona CHECK (
    user_persona IS NULL OR user_persona IN ('sales', 'hr', 'founder', 'lobbyist', 'investor', 'executive', 'consultant', 'analyst')
  ),
  ADD CONSTRAINT valid_ai_maturity CHECK (
    ai_maturity_self IS NULL OR ai_maturity_self IN ('exploring', 'piloting', 'scaling', 'optimizing', 'leading')
  );

-- 2. Create ai_impact_analysis table
CREATE TABLE public.ai_impact_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  industry_id TEXT NOT NULL,
  industry_name TEXT NOT NULL,
  -- Three-zone classification
  ai_led_functions JSONB DEFAULT '[]',
  human_led_functions JSONB DEFAULT '[]',
  collaborative_functions JSONB DEFAULT '[]',
  -- Aggregate scores
  automation_rate NUMERIC(5,2) DEFAULT 0,
  job_displacement_index NUMERIC(5,2) DEFAULT 0,
  human_resilience_score NUMERIC(5,2) DEFAULT 0,
  collaborative_opportunity_index NUMERIC(5,2) DEFAULT 0,
  -- Value chain map
  value_chain_map JSONB DEFAULT '{}',
  -- Entity-specific overlays
  entity_context_overlays JSONB DEFAULT '{}',
  -- KPI snapshot
  kpi_snapshot JSONB DEFAULT '{}',
  -- Timestamps
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT ai_impact_user_industry_unique UNIQUE (user_id, industry_id)
);

ALTER TABLE public.ai_impact_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai impact analysis"
  ON public.ai_impact_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai impact analysis"
  ON public.ai_impact_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai impact analysis"
  ON public.ai_impact_analysis FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for auto-cleanup on regeneration
CREATE INDEX idx_ai_impact_user ON public.ai_impact_analysis(user_id);
CREATE INDEX idx_ai_impact_industry ON public.ai_impact_analysis(industry_id);

-- 3. Create deep_reports table
CREATE TABLE public.deep_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (
    report_type IN ('my_industry', 'customer_industry', 'competitive_landscape', 'workforce_impact', 'ai_readiness')
  ),
  target_industry TEXT NOT NULL,
  entity_context TEXT,
  report_data JSONB DEFAULT '{}',
  executive_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'generating', 'completed', 'failed')
  ),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.deep_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.deep_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.deep_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.deep_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_deep_reports_user ON public.deep_reports(user_id);
CREATE INDEX idx_deep_reports_status ON public.deep_reports(status);
