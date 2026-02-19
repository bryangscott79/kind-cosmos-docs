import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Users, ArrowRight, Clock, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface InviteInfo {
  id: string;
  owner_id: string;
  email: string;
  status: string;
  expires_at: string;
  team_member: {
    name: string;
    title: string;
    owner_id: string;
  };
  owner_profile: {
    company_name: string;
  } | null;
}

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  // Load invite info
  const loadInvite = useCallback(async () => {
    if (!token) { setError("No invite token provided"); setLoading(false); return; }

    try {
      // Look up invite by token (public read policy)
      const { data: inv, error: invErr } = await supabase
        .from("team_invitations")
        .select("id, owner_id, email, status, expires_at, team_member_id")
        .eq("token", token)
        .maybeSingle() as any;

      if (invErr || !inv) {
        setError("This invitation link is invalid or has been revoked.");
        setLoading(false);
        return;
      }

      if (inv.status === "accepted") {
        setAccepted(true);
        setLoading(false);
        return;
      }

      if (inv.status === "declined" || inv.status === "expired") {
        setError(`This invitation has been ${inv.status}.`);
        setLoading(false);
        return;
      }

      if (new Date(inv.expires_at) < new Date()) {
        setError("This invitation has expired. Ask the team owner to send a new one.");
        setLoading(false);
        return;
      }

      // Get team member info
      const { data: member } = await supabase
        .from("team_members")
        .select("name, title, owner_id")
        .eq("id", inv.team_member_id)
        .single() as any;

      // Get owner profile
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("user_id", inv.owner_id)
        .maybeSingle() as any;

      setInvite({
        ...inv,
        team_member: member || { name: "Team Member", title: "", owner_id: inv.owner_id },
        owner_profile: ownerProfile,
      });
    } catch (e: any) {
      setError("Failed to load invitation. Please try again.");
      console.error("Invite load error:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadInvite(); }, [loadInvite]);

  // Accept invite
  const handleAccept = async () => {
    if (!invite || !user || !session) return;
    setAccepting(true);

    try {
      // Update invitation record
      const { error: updErr } = await supabase
        .from("team_invitations")
        .update({
          status: "accepted",
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
        } as any)
        .eq("id", invite.id);

      if (updErr) throw updErr;

      // Update team member with invited_user_id
      await supabase
        .from("team_members")
        .update({
          invited_user_id: user.id,
          invite_status: "accepted",
        } as any)
        .eq("id", (invite as any).team_member_id);

      setAccepted(true);
    } catch (e: any) {
      setError("Failed to accept invitation. Please try again.");
      console.error("Accept error:", e);
    } finally {
      setAccepting(false);
    }
  };

  // Already accepted
  if (accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invitation Accepted!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're now part of the team. You'll have access to shared intelligence, signals, and pipeline data.
          </p>
          <Link
            to="/industries"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
            <XCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Invitation Error</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Not logged in — prompt to sign up / sign in
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Team Invitation</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong className="text-foreground">{invite?.owner_profile?.company_name || "A team"}</strong> has invited
              {" "}<strong className="text-foreground">{invite?.team_member?.name}</strong> to collaborate on VIGYL.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Sign in or create an account to accept the invitation and access shared intelligence.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to={`/auth?redirect=/invite/${token}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <LogIn className="h-4 w-4" /> Sign In to Accept
              </Link>
              <p className="text-[10px] text-muted-foreground">
                Don't have an account? You'll be able to create one on the next page.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Expires {new Date(invite?.expires_at || "").toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in — show accept/decline
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Join the Team</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong className="text-foreground">{invite?.owner_profile?.company_name || "A team"}</strong> has invited you to collaborate on VIGYL as:
          </p>
          <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm font-semibold text-foreground">{invite?.team_member?.name}</p>
            <p className="text-xs text-muted-foreground">{invite?.team_member?.title}</p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            You'll get access to shared industry intelligence, prospect pipelines, AI-generated reports, and team collaboration tools.
          </p>

          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Accept Invitation
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Decline
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Expires {new Date(invite?.expires_at || "").toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
