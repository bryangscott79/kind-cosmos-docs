
-- Create prospect feedback table for "more like this" / "less like this"
CREATE TABLE public.prospect_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prospect_company_name TEXT NOT NULL,
  prospect_industry TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('more', 'less')),
  prospect_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prospect_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON public.prospect_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON public.prospect_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own feedback" ON public.prospect_feedback FOR DELETE USING (auth.uid() = user_id);
