
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_descriptors text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS known_competitors text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS value_propositions text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ideal_client_revenue_min text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ideal_client_revenue_max text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ideal_client_employee_min integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ideal_client_employee_max integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS geographic_focus text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS case_study_industries text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS differentiators text;
