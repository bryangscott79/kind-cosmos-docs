-- =============================================================
-- Email Digest Subscriptions
-- Tracks user digest preferences and delivery history
-- =============================================================

CREATE TABLE public.digest_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'never')),
  
  -- Notification preferences (what to include)
  include_industry_health BOOLEAN NOT NULL DEFAULT true,
  include_signals BOOLEAN NOT NULL DEFAULT true,
  include_prospect_updates BOOLEAN NOT NULL DEFAULT true,
  include_pipeline_reminders BOOLEAN NOT NULL DEFAULT true,
  
  -- Delivery tracking
  last_sent_at TIMESTAMP WITH TIME ZONE,
  send_count INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  active BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT digest_subscriptions_user_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.digest_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscription
CREATE POLICY "Users can view own digest subscription"
  ON public.digest_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own digest subscription"
  ON public.digest_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own digest subscription"
  ON public.digest_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own digest subscription"
  ON public.digest_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_digest_subscriptions_updated_at
  BEFORE UPDATE ON public.digest_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for batch sending queries (find all daily subs that haven't been sent today)
CREATE INDEX idx_digest_active_frequency ON public.digest_subscriptions (active, frequency, last_sent_at);

-- =============================================================
-- Digest send history (for debugging and analytics)
-- =============================================================

CREATE TABLE public.digest_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  signal_count INTEGER DEFAULT 0,
  prospect_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digest_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own digest history"
  ON public.digest_history FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (edge functions bypass RLS)

CREATE INDEX idx_digest_history_user ON public.digest_history (user_id, sent_at DESC);
