import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Which subscriptions are due? ──
function isDue(sub: any, now: Date): boolean {
  if (!sub.active || sub.frequency === "never") return false;
  if (!sub.last_sent_at) return true; // Never sent — send now

  const last = new Date(sub.last_sent_at);
  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

  switch (sub.frequency) {
    case "daily": return hoursSince >= 20; // Allow 4h buffer
    case "weekly": return hoursSince >= 164; // ~6.8 days
    case "monthly": return hoursSince >= 672; // ~28 days
    default: return false;
  }
}

// ── Build the HTML email ──
function buildDigestHtml(profile: any, intelligence: any, sub: any): { html: string; subject: string; signalCount: number; prospectCount: number } {
  const { industries = [], signals = [], prospects = [] } = intelligence || {};
  const companyName = profile?.company_name || "your business";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Top signals (severity >= 3, most recent first)
  const topSignals = signals
    .filter((s: any) => s.severity >= 3)
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 8);

  // Industry movers
  const improving = industries.filter((i: any) => i.trendDirection === "improving").slice(0, 3);
  const declining = industries.filter((i: any) => i.trendDirection === "declining").slice(0, 3);

  // Hot prospects (top 5 by score)
  const hotProspects = [...prospects]
    .sort((a: any, b: any) => b.vigylScore - a.vigylScore)
    .slice(0, 5);

  // Pipeline reminders (contacted > 5 days ago)
  const staleProspects = prospects.filter((p: any) => {
    if (!p.lastContacted || p.pipelineStage === "won" || p.pipelineStage === "lost" || p.pipelineStage === "researching") return false;
    const daysSince = (Date.now() - new Date(p.lastContacted).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 5;
  }).slice(0, 3);

  const sentimentDot = (s: string) =>
    s === "positive" ? "🟢" : s === "negative" ? "🔴" : "🟡";

  const trendArrow = (t: string) =>
    t === "improving" ? "📈" : t === "declining" ? "📉" : "➡️";

  const subject = `VIGYL Daily Brief — ${topSignals.length} signals, ${hotProspects.length} hot prospects`;

  let signalSection = "";
  if (sub.include_signals && topSignals.length > 0) {
    signalSection = `
    <tr><td style="padding: 24px 32px 8px;">
      <h2 style="margin:0;font-size:16px;color:#1a1a2e;">🔔 Top Signals</h2>
      <p style="margin:4px 0 0;font-size:12px;color:#666;">High-severity signals across your tracked industries</p>
    </td></tr>
    ${topSignals.map((s: any) => `
    <tr><td style="padding: 4px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:12px 16px;">
          <div style="font-size:10px;color:#888;margin-bottom:4px;">
            ${sentimentDot(s.sentiment)} ${(s.signalType || "").replace("_", " ").toUpperCase()} · Severity ${s.severity}/5
          </div>
          <div style="font-size:14px;font-weight:600;color:#1a1a2e;line-height:1.3;">${s.title}</div>
          <div style="font-size:12px;color:#444;margin-top:4px;line-height:1.4;">${s.salesImplication || s.summary}</div>
        </td></tr>
      </table>
    </td></tr>`).join("")}`;
  }

  let industrySection = "";
  if (sub.include_industry_health && (improving.length > 0 || declining.length > 0)) {
    industrySection = `
    <tr><td style="padding: 24px 32px 8px;">
      <h2 style="margin:0;font-size:16px;color:#1a1a2e;">📊 Industry Movement</h2>
    </td></tr>
    <tr><td style="padding: 4px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;">
        ${improving.map((i: any) => `
        <tr><td style="padding:10px 16px;border-bottom:1px solid #f5f5f5;">
          ${trendArrow("improving")} <strong style="color:#1a1a2e;">${i.name}</strong>
          <span style="float:right;font-size:13px;font-weight:700;color:#16a34a;">${i.healthScore}/100</span>
        </td></tr>`).join("")}
        ${declining.map((i: any) => `
        <tr><td style="padding:10px 16px;border-bottom:1px solid #f5f5f5;">
          ${trendArrow("declining")} <strong style="color:#1a1a2e;">${i.name}</strong>
          <span style="float:right;font-size:13px;font-weight:700;color:#dc2626;">${i.healthScore}/100</span>
        </td></tr>`).join("")}
      </table>
    </td></tr>`;
  }

  let prospectSection = "";
  if (sub.include_prospect_updates && hotProspects.length > 0) {
    prospectSection = `
    <tr><td style="padding: 24px 32px 8px;">
      <h2 style="margin:0;font-size:16px;color:#1a1a2e;">🎯 Top Prospects</h2>
      <p style="margin:4px 0 0;font-size:12px;color:#666;">Highest-scoring opportunities right now</p>
    </td></tr>
    ${hotProspects.map((p: any) => `
    <tr><td style="padding: 4px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;">
        <tr><td style="padding:12px 16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:14px;color:#1a1a2e;">${p.companyName}</strong>
            <span style="font-size:16px;font-weight:700;color:#6366f1;">${p.vigylScore}</span>
          </div>
          <div style="font-size:11px;color:#888;margin-top:2px;">${p.location?.city || ""}, ${p.location?.state || ""} · ${p.annualRevenue || ""}</div>
          <div style="font-size:12px;color:#444;margin-top:6px;line-height:1.4;">${(p.whyNow || "").split(".")[0]}.</div>
        </td></tr>
      </table>
    </td></tr>`).join("")}`;
  }

  let pipelineSection = "";
  if (sub.include_pipeline_reminders && staleProspects.length > 0) {
    pipelineSection = `
    <tr><td style="padding: 24px 32px 8px;">
      <h2 style="margin:0;font-size:16px;color:#1a1a2e;">⏰ Pipeline Reminders</h2>
      <p style="margin:4px 0 0;font-size:12px;color:#666;">These prospects haven't been contacted in 5+ days</p>
    </td></tr>
    ${staleProspects.map((p: any) => {
      const daysSince = Math.floor((Date.now() - new Date(p.lastContacted).getTime()) / (1000 * 60 * 60 * 24));
      return `
      <tr><td style="padding: 4px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:8px;background:#fffbeb;">
          <tr><td style="padding:12px 16px;">
            <strong style="font-size:13px;color:#1a1a2e;">${p.companyName}</strong>
            <span style="font-size:11px;color:#92400e;margin-left:8px;">${daysSince} days since last contact</span>
            <div style="font-size:11px;color:#666;margin-top:4px;">Stage: ${(p.pipelineStage || "").replace("_", " ")}</div>
          </td></tr>
        </table>
      </td></tr>`;
    }).join("")}`;
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <tr><td style="padding:24px 32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;">
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">VIGYL</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:4px;">Market Intelligence Brief</div>
    </td></tr>

    <!-- Greeting -->
    <tr><td style="padding:24px 32px 0;">
      <p style="margin:0;font-size:14px;color:#444;">${today}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#666;line-height:1.5;">
        Here's what's moving in the markets relevant to <strong>${companyName}</strong>.
      </p>
    </td></tr>

    <!-- Quick Stats -->
    <tr><td style="padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:center;padding:12px;background:#f8f9fa;border-radius:8px;width:33%;">
            <div style="font-size:20px;font-weight:700;color:#6366f1;">${topSignals.length}</div>
            <div style="font-size:10px;color:#888;margin-top:2px;">Key Signals</div>
          </td>
          <td style="width:8px;"></td>
          <td style="text-align:center;padding:12px;background:#f8f9fa;border-radius:8px;width:33%;">
            <div style="font-size:20px;font-weight:700;color:#6366f1;">${hotProspects.length}</div>
            <div style="font-size:10px;color:#888;margin-top:2px;">Hot Prospects</div>
          </td>
          <td style="width:8px;"></td>
          <td style="text-align:center;padding:12px;background:#f8f9fa;border-radius:8px;width:33%;">
            <div style="font-size:20px;font-weight:700;color:#6366f1;">${industries.length}</div>
            <div style="font-size:10px;color:#888;margin-top:2px;">Industries</div>
          </td>
        </tr>
      </table>
    </td></tr>

    ${signalSection}
    ${industrySection}
    ${prospectSection}
    ${pipelineSection}

    <!-- CTA -->
    <tr><td style="padding:32px;text-align:center;">
      <a href="https://vigyl.ai/dashboard" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
        Open VIGYL Dashboard →
      </a>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:10px;color:#999;">
        You're receiving this because you subscribed to VIGYL intelligence digests.
        <br/>
        <a href="https://vigyl.ai/settings" style="color:#6366f1;">Manage preferences</a> ·
        <a href="https://vigyl.ai/api/unsubscribe?token=__UNSUBSCRIBE_TOKEN__" style="color:#999;">Unsubscribe</a>
      </p>
      <p style="margin:8px 0 0;font-size:10px;color:#ccc;">© 2026 VIGYL.ai — Market intelligence for the AI era</p>
    </td></tr>
  </table>
</body></html>`;

  return { html, subject, signalCount: topSignals.length, prospectCount: hotProspects.length };
}

// ── Send email via Resend ──
async function sendEmail(to: string, subject: string, html: string, resendKey: string): Promise<{ id?: string; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "VIGYL Intelligence <digest@vigyl.ai>",
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

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optional: accept specific user_id for testing
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body?.user_id || null;
    } catch { /* no body = batch mode */ }

    const now = new Date();

    // Fetch active subscriptions
    let query = supabase
      .from("digest_subscriptions")
      .select("*")
      .eq("active", true)
      .neq("frequency", "never");

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No active subscriptions due" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter to only due subscriptions (unless targeting specific user for testing)
    const due = targetUserId ? subscriptions : subscriptions.filter(s => isDue(s, now));
    if (due.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions due for delivery" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { userId: string; status: string; error?: string }[] = [];

    for (const sub of due) {
      try {
        // Load user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", sub.user_id)
          .single();

        // Load cached intelligence
        const { data: cache } = await supabase
          .from("cached_intelligence")
          .select("intelligence_data")
          .eq("user_id", sub.user_id)
          .single();

        if (!cache?.intelligence_data) {
          // No intelligence data — skip but log
          await supabase.from("digest_history").insert({
            user_id: sub.user_id,
            frequency: sub.frequency,
            subject: "Skipped — no intelligence data",
            status: "skipped",
          });
          results.push({ userId: sub.user_id, status: "skipped", error: "No intelligence data" });
          continue;
        }

        // Build the email
        const { html, subject, signalCount, prospectCount } = buildDigestHtml(
          profile,
          cache.intelligence_data,
          sub
        );

        // Replace unsubscribe token
        const finalHtml = html.replace("__UNSUBSCRIBE_TOKEN__", sub.unsubscribe_token);

        // Send
        const sendResult = await sendEmail(sub.email, subject, finalHtml, RESEND_API_KEY);

        if (sendResult.error) {
          await supabase.from("digest_history").insert({
            user_id: sub.user_id,
            frequency: sub.frequency,
            subject,
            status: "failed",
            error_message: sendResult.error,
            signal_count: signalCount,
            prospect_count: prospectCount,
          });
          results.push({ userId: sub.user_id, status: "failed", error: sendResult.error });
        } else {
          // Update last_sent_at
          await supabase
            .from("digest_subscriptions")
            .update({
              last_sent_at: now.toISOString(),
              send_count: sub.send_count + 1,
            })
            .eq("id", sub.id);

          await supabase.from("digest_history").insert({
            user_id: sub.user_id,
            frequency: sub.frequency,
            subject,
            status: "sent",
            signal_count: signalCount,
            prospect_count: prospectCount,
          });
          results.push({ userId: sub.user_id, status: "sent" });
        }
      } catch (e: any) {
        results.push({ userId: sub.user_id, status: "failed", error: e.message });
      }
    }

    const sent = results.filter(r => r.status === "sent").length;
    const failed = results.filter(r => r.status === "failed").length;
    const skipped = results.filter(r => r.status === "skipped").length;

    return new Response(JSON.stringify({ sent, failed, skipped, total: due.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Send digest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
