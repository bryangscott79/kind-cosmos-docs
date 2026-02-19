-- =============================================================
-- Team Members table
-- Stores team member profiles for presentation prompts
-- and collaboration invites
-- =============================================================

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT NULL,
  role TEXT NOT NULL DEFAULT 'member',  -- 'owner', 'admin', 'member'
  invite_status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'accepted', 'declined'
  invited_user_id UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  bio TEXT DEFAULT NULL,
  linkedin_url TEXT DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their team
CREATE POLICY "Owners manage their team"
  ON public.team_members FOR ALL
  USING (auth.uid() = owner_id);

-- Invited users can see teams they belong to
CREATE POLICY "Invited users can view their team"
  ON public.team_members FOR SELECT
  USING (auth.uid() = invited_user_id);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_team_members_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_members_timestamp();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
