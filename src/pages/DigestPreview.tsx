import { useState, useMemo } from "react";
import { Mail, Send, Eye, Monitor, Smartphone, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDigestSubscription } from "@/hooks/useDigestSubscription";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ── Replicates the server-side buildDigestHtml exactly ──
function buildDigestHtml(
  profile: any,
  intelligence: any,
  options: {
    include_signals: boolean;
    include_industry_health: boolean;
    include_prospect_updates: boolean;
    include_pipeline_reminders: boolean;
  }
): { html: string; subject: string; stats: { signals: number; prospects: number; industries: number } } {
  const { industries = [], signals = [], prospects = [] } = intelligence || {};
  const companyName = profile?.company_name || "your business";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const topSignals = signals
    .filter((s: any) => s.severity >= 3)
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 8);

  const improving = industries.filter((i: any) => i.trendDirection === "improving").slice(0, 3);
  const declining = industries.filter((i: any) => i.trendDirection === "declining").slice(0, 3);

  const hotProspects = [...prospects]
    .sort((a: any, b: any) => b.vigylScore - a.vigylScore)
    .slice(0, 5);

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
  if (options.include_signals && topSignals.length > 0) {
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
  if (options.include_industry_health && (improving.length > 0 || declining.length > 0)) {
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
  if (options.include_prospect_updates && hotProspects.length > 0) {
    prospectSection = `
    <tr><td style="padding: 24px 32px 8px;">
      <h2 style="margin:0;font-size:16px;color:#1a1a2e;">🎯 Top Prospects</h2>
      <p style="margin:4px 0 0;font-size:12px;color:#666;">Highest-scoring opportunities right now</p>
    </td></tr>
    ${hotProspects.map((p: any) => `
    <tr><td style="padding: 4px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;">
        <tr><td style="padding:12px 16px;">
          <div style="font-size:14px;font-weight:600;color:#1a1a2e;">${p.companyName}
            <span style="float:right;font-size:16px;font-weight:700;color:#6366f1;">${p.vigylScore}</span>
          </div>
          <div style="font-size:11px;color:#888;margin-top:2px;">${p.location?.city || ""}, ${p.location?.state || ""} · ${p.annualRevenue || ""}</div>
          <div style="font-size:12px;color:#444;margin-top:6px;line-height:1.4;">${(p.whyNow || "").split(".")[0]}.</div>
        </td></tr>
      </table>
    </td></tr>`).join("")}`;
  }

  let pipelineSection = "";
  if (options.include_pipeline_reminders && staleProspects.length > 0) {
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
    <tr><td style="padding:24px 32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);text-align:center;">
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">VIGYL</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:4px;">Market Intelligence Brief</div>
    </td></tr>
    <tr><td style="padding:24px 32px 0;">
      <p style="margin:0;font-size:14px;color:#444;">${today}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#666;line-height:1.5;">
        Here's what's moving in the markets relevant to <strong>${companyName}</strong>.
      </p>
    </td></tr>
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
    <tr><td style="padding:32px;text-align:center;">
      <a href="https://vigyl.ai/dashboard" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
        Open VIGYL Dashboard →
      </a>
    </td></tr>
    <tr><td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:10px;color:#999;">
        You're receiving this because you subscribed to VIGYL intelligence digests.
        <br/>
        <a href="https://vigyl.ai/settings" style="color:#6366f1;">Manage preferences</a> ·
        <a href="#" style="color:#999;">Unsubscribe</a>
      </p>
      <p style="margin:8px 0 0;font-size:10px;color:#ccc;">© 2026 VIGYL.ai — Market intelligence for the AI era</p>
    </td></tr>
  </table>
</body></html>`;

  return { html, subject, stats: { signals: topSignals.length, prospects: hotProspects.length, industries: industries.length } };
}

export default function DigestPreview() {
  const { data } = useIntelligence();
  const { profile, user } = useAuth();
  const { subscription, isSubscribed } = useDigestSubscription();
  const { toast } = useToast();
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [sending, setSending] = useState(false);
  const [sections, setSections] = useState({
    include_signals: true,
    include_industry_health: true,
    include_prospect_updates: true,
    include_pipeline_reminders: true,
  });

  const { html, subject, stats } = useMemo(
    () => buildDigestHtml(profile, data, sections),
    [profile, data, sections]
  );

  const sendTestEmail = async () => {
    if (!user) return;
    setSending(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("send-digest", {
        body: { user_id: user.id },
      });
      if (error) throw error;
      if (result?.sent > 0) {
        toast({ title: "Test email sent!", description: `Check ${subscription?.email || user.email} for the digest.` });
      } else if (result?.skipped > 0) {
        toast({ title: "Skipped", description: "No cached intelligence data found. Visit the dashboard first to generate intelligence.", variant: "destructive" });
      } else {
        toast({ title: "Not sent", description: result?.message || "Subscribe to the digest first (dashboard or settings).", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="flex items-center gap-3 mb-4">
          <Link to="/settings" className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Digest Preview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              This is exactly what your subscribers will receive — rendered with your live intelligence data.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Viewport toggle */}
          <div className="flex rounded-md border border-border overflow-hidden">
            <button onClick={() => setViewport("desktop")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${viewport === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button onClick={() => setViewport("mobile")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${viewport === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>

          {/* Section toggles */}
          <div className="flex items-center gap-2">
            {([
              { key: "include_signals" as const, label: "Signals" },
              { key: "include_industry_health" as const, label: "Industries" },
              { key: "include_prospect_updates" as const, label: "Prospects" },
              { key: "include_pipeline_reminders" as const, label: "Pipeline" },
            ]).map(s => (
              <button
                key={s.key}
                onClick={() => toggleSection(s.key)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${sections[s.key] ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary text-muted-foreground border border-transparent"}`}
              >
                {sections[s.key] ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Send test */}
          <button
            onClick={sendTestEmail}
            disabled={sending || !isSubscribed}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            title={!isSubscribed ? "Subscribe to the digest first (dashboard or Settings → Notifications)" : "Send a real email to your subscribed address"}
          >
            {sending ? (
              <>Sending...</>
            ) : (
              <><Send className="h-3.5 w-3.5" /> Send Test Email</>
            )}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 rounded-md bg-secondary px-4 py-2.5 mb-4 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-primary" />
          <span><strong className="text-foreground">Subject:</strong> {subject}</span>
          <span className="ml-auto">{stats.signals} signals · {stats.prospects} prospects · {stats.industries} industries</span>
        </div>

        {!isSubscribed && (
          <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 mb-4 text-xs text-amber-700 dark:text-amber-300">
            <strong>Not subscribed yet.</strong> The preview works with your live data, but to send a test email you need to subscribe first — either from the <Link to="/dashboard" className="underline font-medium">dashboard CTA</Link> or <Link to="/settings" className="underline font-medium">Settings → Notifications</Link>.
          </div>
        )}

        {/* Email preview iframe */}
        <div className={`mx-auto rounded-lg border border-border shadow-lg overflow-hidden transition-all duration-300 ${viewport === "mobile" ? "max-w-[375px]" : "max-w-[640px]"}`}>
          <div className="bg-secondary px-3 py-2 flex items-center gap-2 border-b border-border">
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] text-muted-foreground ml-2 flex-1 truncate">{subject}</span>
            <Eye className="h-3 w-3 text-muted-foreground" />
          </div>
          <iframe
            srcDoc={html}
            title="Digest Preview"
            className="w-full bg-white"
            style={{ height: "80vh", border: "none" }}
          />
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
