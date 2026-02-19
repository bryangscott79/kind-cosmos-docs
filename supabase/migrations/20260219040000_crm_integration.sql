-- =============================================================
-- CRM Connections — stores provider config per user
-- =============================================================

CREATE TABLE public.crm_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,  -- 'hubspot', 'salesforce'
  api_key TEXT NOT NULL DEFAULT '',  -- encrypted/obfuscated in UI
  instance_url TEXT DEFAULT NULL,  -- Salesforce instance URL
  is_active BOOLEAN NOT NULL DEFAULT true,
  field_mapping JSONB DEFAULT '{}',  -- custom field overrides
  default_pipeline_mapping JSONB DEFAULT '{}',  -- stage → CRM stage map
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.crm_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own CRM connections"
  ON public.crm_connections FOR ALL
  USING (auth.uid() = user_id);

-- =============================================================
-- CRM Sync Log — tracks each push to CRM
-- =============================================================

CREATE TABLE public.crm_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.crm_connections(id) ON DELETE CASCADE,
  prospect_id TEXT NOT NULL,  -- Vigyl prospect ID (may be 'db-xxx' or 'p1' etc.)
  company_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'create',  -- 'create', 'update'
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'success', 'failed'
  crm_record_id TEXT DEFAULT NULL,  -- ID returned from CRM
  crm_record_url TEXT DEFAULT NULL,  -- Direct link to record in CRM
  error_message TEXT DEFAULT NULL,
  payload JSONB DEFAULT '{}',  -- what was sent
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sync logs"
  ON public.crm_sync_log FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_crm_sync_log_prospect ON public.crm_sync_log(user_id, prospect_id);
CREATE INDEX idx_crm_sync_log_connection ON public.crm_sync_log(connection_id);
