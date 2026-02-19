import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Send email via Resend ──
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  resendKey: string
): Promise<{ id?: string; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "VIGYL <team@vigyl.ai>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { error: `Resend API ${res.status}: ${err}` };
    }

    const data = await res.json();
    return { id: data.id };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ── Build invite email HTML ──
function buildInviteHtml(
  inviterName: string,
  inviterCompany: string,
  memberName: string,
  acceptUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;">
          <h1 style="margin:0;color:white;font-size:20px;font-weight:700;letter-spacing:-0.025em;">VIGYL</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Market Intelligence Platform</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">You've been invited to collaborate</h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
            <strong style="color:#0f172a;">${inviterName}</strong> from <strong style="color:#0f172a;">${inviterCompany}</strong> has invited you to join their team on VIGYL — a market intelligence platform that helps businesses find opportunities, track signals, and close deals.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#6366f1;border-radius:8px;padding:14px 32px;">
              <a href="${acceptUrl}" style="color:white;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
                Accept Invitation
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.6;">
            As a team member, you'll get access to:
          </p>
          <ul style="margin:0 0 24px;padding:0 0 0 20px;color:#475569;font-size:13px;line-height:2;">
            <li>Shared industry intelligence and market signals</li>
            <li>Prospect pipeline and deal tracking</li>
            <li>AI-generated outreach and reports</li>
            <li>Team collaboration tools</li>
          </ul>

          <p style="margin:0;color:#94a3b8;font-size:12px;">
            This invitation expires in 7 days. If you weren't expecting this email, you can safely ignore it.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
            Sent by VIGYL · Market Intelligence Platform
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { teamMemberId, appUrl } = await req.json();
    if (!teamMemberId) throw new Error("teamMemberId required");

    // Get team member
    const { data: member, error: memberErr } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", teamMemberId)
      .eq("owner_id", user.id)
      .single();

    if (memberErr || !member) throw new Error("Team member not found or not authorized");
    if (!member.email) throw new Error("Team member has no email address");

    // Get owner profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, role_title")
      .eq("user_id", user.id)
      .single();

    const inviterName = profile?.role_title
      ? `${user.email?.split("@")[0]} (${profile.role_title})`
      : user.email || "A colleague";
    const inviterCompany = profile?.company_name || "their company";

    // Check for existing pending invite
    const { data: existing } = await supabase
      .from("team_invitations")
      .select("id, status, expires_at")
      .eq("team_member_id", teamMemberId)
      .eq("status", "pending")
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    let token: string;

    if (existing) {
      // Re-send existing invite
      const { data: inv } = await supabase
        .from("team_invitations")
        .select("token")
        .eq("id", existing.id)
        .single();
      token = inv?.token;
    } else {
      // Create new invitation
      const { data: inv, error: invErr } = await supabase
        .from("team_invitations")
        .insert({
          team_member_id: teamMemberId,
          owner_id: user.id,
          email: member.email,
        })
        .select("token")
        .single();

      if (invErr) throw new Error(`Failed to create invitation: ${invErr.message}`);
      token = inv.token;
    }

    // Update team member status
    await supabase
      .from("team_members")
      .update({ invite_status: "pending" })
      .eq("id", teamMemberId);

    // Build accept URL
    const baseUrl = appUrl || "https://vigyl.ai";
    const acceptUrl = `${baseUrl}/invite/${token}`;
    const subject = `${inviterCompany} invited you to collaborate on VIGYL`;
    const html = buildInviteHtml(inviterName, inviterCompany, member.name, acceptUrl);

    // Send email
    if (RESEND_API_KEY) {
      const result = await sendEmail(member.email, subject, html, RESEND_API_KEY);
      if (result.error) {
        console.error("Email send failed:", result.error);
        return new Response(
          JSON.stringify({
            success: true,
            emailSent: false,
            error: result.error,
            inviteUrl: acceptUrl,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, emailSent: true, emailId: result.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No Resend key — return the link for manual sharing
      console.log("RESEND_API_KEY not set — returning invite URL for manual sharing");
      return new Response(
        JSON.stringify({
          success: true,
          emailSent: false,
          inviteUrl: acceptUrl,
          message: "Email not configured. Share the invite link directly.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e: any) {
    console.error("Invite error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
