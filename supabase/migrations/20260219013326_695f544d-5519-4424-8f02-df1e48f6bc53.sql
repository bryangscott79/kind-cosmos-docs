
-- Create pipeline_items table to persist "Track This" actions
CREATE TABLE public.pipeline_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  industry_name text,
  pipeline_stage text NOT NULL DEFAULT 'researching',
  vigyl_score integer,
  prospect_data jsonb,
  notes text,
  last_contacted timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own pipeline items"
  ON public.pipeline_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pipeline items"
  ON public.pipeline_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipeline items"
  ON public.pipeline_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pipeline items"
  ON public.pipeline_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_pipeline_items_updated_at
  BEFORE UPDATE ON public.pipeline_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
