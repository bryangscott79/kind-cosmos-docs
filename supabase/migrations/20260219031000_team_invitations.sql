-- =============================================================
-- Team Invitations — tracks invite tokens and accept/decline flow
-- =============================================================

CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, accepted, declined, expired
  accepted_by UUID DEFAULT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Owners can manage their invitations
CREATE POLICY "Owners manage invitations"
  ON public.team_invitations FOR ALL
  USING (auth.uid() = owner_id);

-- Anyone can read by token (for accept flow — token acts as auth)
CREATE POLICY "Read invitation by token"
  ON public.team_invitations FOR SELECT
  USING (true);

-- Invited users can update their own invite
CREATE POLICY "Invited users accept invitations"
  ON public.team_invitations FOR UPDATE
  USING (auth.uid() = accepted_by OR status = 'pending');

-- Index for token lookup
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
