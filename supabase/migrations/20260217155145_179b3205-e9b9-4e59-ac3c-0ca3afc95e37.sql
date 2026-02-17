
-- Create intelligence cache table
CREATE TABLE public.cached_intelligence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  intelligence_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cached_intelligence_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.cached_intelligence ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own cached intelligence"
ON public.cached_intelligence FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cached intelligence"
ON public.cached_intelligence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cached intelligence"
ON public.cached_intelligence FOR UPDATE
USING (auth.uid() = user_id);

-- Service role needs to upsert from edge function, which bypasses RLS anyway

-- Trigger for updated_at
CREATE TRIGGER update_cached_intelligence_updated_at
BEFORE UPDATE ON public.cached_intelligence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
