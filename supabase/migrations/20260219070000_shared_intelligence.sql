-- Shared Intelligence: allow accepted team members to read owner's data
-- This enables the team collaboration feature where invitees see the owner's
-- intelligence dashboard without generating their own.

-- Team members can read the owner's cached intelligence
CREATE POLICY "Team members can read owner intelligence"
  ON public.cached_intelligence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.owner_id = cached_intelligence.user_id
        AND team_members.invited_user_id = auth.uid()
        AND team_members.invite_status = 'accepted'
    )
  );

-- Team members can read owner's expanded prospects
CREATE POLICY "Team members can read owner expanded prospects"
  ON expanded_prospects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.owner_id = expanded_prospects.user_id
        AND team_members.invited_user_id = auth.uid()
        AND team_members.invite_status = 'accepted'
    )
  );

-- Team members can read owner's pipeline prospects
CREATE POLICY "Team members can read owner pipeline"
  ON public.pipeline_prospects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.owner_id = pipeline_prospects.user_id
        AND team_members.invited_user_id = auth.uid()
        AND team_members.invite_status = 'accepted'
    )
  );

-- Team members can read owner's prospect feedback
CREATE POLICY "Team members can read owner prospect feedback"
  ON public.prospect_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.owner_id = prospect_feedback.user_id
        AND team_members.invited_user_id = auth.uid()
        AND team_members.invite_status = 'accepted'
    )
  );

-- Helper function: get the team owner's user_id for the current user
-- Returns the owner_id if the current user is an accepted team member, or their own id
CREATE OR REPLACE FUNCTION public.get_team_owner_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  owner UUID;
BEGIN
  -- First check if user is a team member
  SELECT tm.owner_id INTO owner
  FROM public.team_members tm
  WHERE tm.invited_user_id = auth.uid()
    AND tm.invite_status = 'accepted'
  LIMIT 1;
  
  -- If not a team member, return own id
  IF owner IS NULL THEN
    RETURN auth.uid();
  END IF;
  
  RETURN owner;
END;
$$;
