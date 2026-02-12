
-- Create saved_signals table for bookmarking signals to prospects/opportunities
CREATE TABLE public.saved_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_id TEXT NOT NULL,
  -- Link to a prospect by name or a custom opportunity name
  opportunity_name TEXT NOT NULL,
  -- Optional: link to a specific prospect ID from mock data
  prospect_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_signals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved signals
CREATE POLICY "Users can view own saved signals"
  ON public.saved_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved signals"
  ON public.saved_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved signals"
  ON public.saved_signals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own saved signals"
  ON public.saved_signals FOR UPDATE
  USING (auth.uid() = user_id);
