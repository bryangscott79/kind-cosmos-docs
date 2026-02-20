/**
 * Client-Facing Report — shareable, printable, and copy-ready report
 * that synthesizes all VIGYL data points for a prospect.
 */
import { useRef, useState, useMemo } from "react";
import {
  X, Copy, Check, Download, Share2, Printer, Building2,
  TrendingUp, TrendingDown, Minus, Brain, Bot, Handshake,
  User, Radio, Target, Lightbulb, Shield, Zap, BarChart3,
  Clock, AlertTriangle, Sparkles, Star
} from "lucide-react";
import {
  Prospect, Industry, Signal, AIImpactAnalysis,
  getScoreColorHsl, getPressureLabel, pipelineStageLabels,
  getSignalTypeLabel, isSignalRelevantToIndustry
} from "@/data/mockData";

interface ClientReportProps {
  prospect: Prospect;
  industry?: Industry;
  signals: Signal[];
  aiImpact?: AIImpactAnalysis;
  userProfile?: {
    company_name?: string | null;
    business_summary?: string | null;
    ai_summary?: string | null;
    role_title?: string | null;
  } | null;
  onClose: () => void;
}

export default function ClientReport({ prospect, industry, signals, aiImpact, userProfile, onClose }: ClientReportProps) {
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const relatedSignals = useMemo(() =>
    signals.filter(s => prospect.relatedSignals?.includes(s.id)),
  [signals, prospect]);

  const industrySignals = useMemo(() =>
    industry ? signals.filter(s => isSignalRelevantToIndustry(s, industry.id)).slice(0, 6) : [],
  [signals, industry]);

  const allRelevantSignals = useMemo(() => {
    const ids = new Set(relatedSignals.map(s => s.id));
    return [...relatedSignals, ...industrySignals.filter(s => !ids.has(s.id))];
  }, [relatedSignals, industrySignals]);

  const positiveSignals = allRelevantSignals.filter(s => s.sentiment === "positive");
  const negativeSignals = allRelevantSignals.filter(s => s.sentiment === "negative");

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const copyAsText = () => {
    const lines = [
      `📊 VIGYL Intelligence Report — ${prospect.companyName}`,
      `Generated ${today}`,
      ``,
      `── COMPANY OVERVIEW ──`,
      `Company: ${prospect.companyName}`,
      `Industry: ${industry?.name || "N/A"}`,
      `Location: ${prospect.location.city}, ${prospect.location.state}`,
      `Revenue: ${prospect.annualRevenue}`,
      `Employees: ${prospect.employeeCount.toLocaleString()}`,
      `Market Position: ${getPressureLabel(prospect.pressureResponse)}`,
      `VIGYL Score: ${prospect.vigylScore}/100`,
      ``,
      `── WHY NOW ──`,
      prospect.whyNow,
      ``,
      `── MARKET SIGNALS (${allRelevantSignals.length}) ──`,
      ...allRelevantSignals.map(s => `[${s.sentiment?.toUpperCase()}] ${s.title} — Severity ${s.severity}/5\n  → ${s.salesImplication}`),
    ];

    if (industry) {
      lines.push(``, `── INDUSTRY HEALTH ──`);
      lines.push(`${industry.name}: Health Score ${industry.healthScore}/100 (${industry.trendDirection})`);
      lines.push(`Positive Signals: ${positiveSignals.length} | Negative: ${negativeSignals.length}`);
    }

    if (aiImpact) {
      lines.push(``, `── AI IMPACT ANALYSIS ──`);
      lines.push(`Automation Rate: ${aiImpact.automationRate}%`);
      lines.push(`AI-Led Functions: ${aiImpact.aiLedFunctions.length}`);
      lines.push(`Collaborative Functions: ${aiImpact.collaborativeFunctions.length}`);
      lines.push(`Human-Led Functions: ${aiImpact.humanLedFunctions.length}`);
      lines.push(`Displacement Risk: ${aiImpact.jobDisplacementIndex}/100`);
      lines.push(`Collaborative Opportunity: ${aiImpact.collaborativeOpportunityIndex}/100`);
    }

    if (userProfile?.company_name) {
      lines.push(``, `── HOW ${userProfile.company_name.toUpperCase()} CAN HELP ──`);
      if (userProfile.business_summary) lines.push(userProfile.business_summary);
      if (userProfile.ai_summary) lines.push(`\nAI Capability: ${userProfile.ai_summary}`);
    }

    if (prospect.recommendedServices?.length) {
      lines.push(``, `── RECOMMENDED SERVICES ──`);
      prospect.recommendedServices.forEach(s => lines.push(`• ${s.service}: ${s.rationale}`));
    }

    if (prospect.competitors?.length) {
      lines.push(``, `── COMPETITIVE LANDSCAPE ──`);
      prospect.competitors.forEach(c => lines.push(`• ${c.name}: ${c.description}`));
    }

    lines.push(``, `── KEY CONTACTS ──`);
    prospect.decisionMakers.forEach(d => lines.push(`• ${d.name} — ${d.title}`));

    lines.push(``, `---`, `Powered by VIGYL.ai — AI-Powered Market Intelligence`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
        {/* Action bar */}
        <div className="flex items-center justify-between mb-3 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-white">Client Report — {prospect.companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyAsText} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy Report"}
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors">
              <Printer className="h-3 w-3" /> Print / PDF
            </button>
            <button onClick={onClose} className="rounded-md p-1.5 text-white/60 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Report card */}
        <div ref={reportRef} className="rounded-xl border border-border bg-card shadow-xl print:shadow-none print:border-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 p-6 rounded-t-xl border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">VIGYL Intelligence Report</p>
                <h1 className="text-xl font-bold text-foreground mt-1">{prospect.companyName}</h1>
                <p className="text-xs text-muted-foreground mt-1">{industry?.name} · {prospect.location.city}, {prospect.location.state}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{today}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-[9px] text-muted-foreground">VIGYL Score</p>
                  <p className="text-3xl font-mono font-bold" style={{ color: getScoreColorHsl(prospect.vigylScore) }}>{prospect.vigylScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricBox label="Revenue" value={prospect.annualRevenue} />
              <MetricBox label="Employees" value={prospect.employeeCount.toLocaleString()} />
              <MetricBox label="Market Position" value={getPressureLabel(prospect.pressureResponse)} />
              <MetricBox label="Pipeline Stage" value={pipelineStageLabels[prospect.pipelineStage]} />
            </div>

            {/* Why Now */}
            <Section title="Why Now — Timing & Opportunity" icon={<Clock className="h-4 w-4 text-primary" />}>
              <p className="text-sm text-foreground leading-relaxed">{prospect.whyNow}</p>
            </Section>

            {/* Industry Health */}
            {industry && (
              <Section title="Industry Health" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold" style={{ color: getScoreColorHsl(industry.healthScore) }}>
                      {industry.healthScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {industry.trendDirection === "improving" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> :
                     industry.trendDirection === "declining" ? <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> :
                     <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-xs text-muted-foreground capitalize">{industry.trendDirection}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {positiveSignals.length} positive signals and {negativeSignals.length} negative signals currently tracked for {industry.name}.
                </p>
              </Section>
            )}

            {/* Market Signals */}
            {allRelevantSignals.length > 0 && (
              <Section title={`Market Signals (${allRelevantSignals.length})`} icon={<Radio className="h-4 w-4 text-primary" />}>
                <div className="space-y-2">
                  {allRelevantSignals.slice(0, 8).map(s => (
                    <div key={s.id} className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${s.sentiment === "positive" ? "bg-emerald-500" : s.sentiment === "negative" ? "bg-rose-500" : "bg-muted-foreground"}`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{s.title}</span>
                          <span className="text-[9px] text-muted-foreground">{s.severity}/5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{s.salesImplication}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* AI Impact */}
            {aiImpact && (
              <Section title="AI Impact Analysis" icon={<Brain className="h-4 w-4 text-primary" />}>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-3 text-center">
                    <Bot className="h-4 w-4 text-rose-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-rose-600">{aiImpact.aiLedFunctions.length}</p>
                    <p className="text-[9px] text-muted-foreground">AI-Led</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-3 text-center">
                    <Handshake className="h-4 w-4 text-violet-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-violet-600">{aiImpact.collaborativeFunctions.length}</p>
                    <p className="text-[9px] text-muted-foreground">Collaborative</p>
                  </div>
                  <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 p-3 text-center">
                    <User className="h-4 w-4 text-sky-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-sky-600">{aiImpact.humanLedFunctions.length}</p>
                    <p className="text-[9px] text-muted-foreground">Human-Led</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Industry automation rate: <span className="font-bold text-foreground">{aiImpact.automationRate}%</span> · 
                  Collaborative opportunity: <span className="font-bold text-violet-600">{aiImpact.collaborativeOpportunityIndex}/100</span>
                </p>
              </Section>
            )}

            {/* Our Value Proposition */}
            {userProfile?.company_name && (
              <Section title={`How ${userProfile.company_name} Can Help`} icon={<Sparkles className="h-4 w-4 text-primary" />}>
                {userProfile.business_summary && (
                  <p className="text-sm text-foreground leading-relaxed mb-2">{userProfile.business_summary}</p>
                )}
                {userProfile.ai_summary && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{userProfile.ai_summary}</p>
                )}
              </Section>
            )}

            {/* Recommended Services */}
            {prospect.recommendedServices && prospect.recommendedServices.length > 0 && (
              <Section title="Recommended Engagement" icon={<Target className="h-4 w-4 text-primary" />}>
                <div className="space-y-2">
                  {prospect.recommendedServices.map((svc, i) => (
                    <div key={i} className="rounded-lg bg-secondary/50 border border-border p-3">
                      <p className="text-xs font-semibold text-foreground">{svc.service}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{svc.rationale}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Competitive Landscape */}
            {prospect.competitors && prospect.competitors.length > 0 && (
              <Section title="Competitive Landscape" icon={<Shield className="h-4 w-4 text-primary" />}>
                <div className="space-y-2">
                  {prospect.competitors.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-muted-foreground shrink-0">{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Key Contacts */}
            <Section title="Key Contacts" icon={<Building2 className="h-4 w-4 text-primary" />}>
              <div className="space-y-2">
                {prospect.decisionMakers.map((dm, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{dm.name}</p>
                      <p className="text-[10px] text-muted-foreground">{dm.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Powered by <span className="font-semibold text-foreground">VIGYL.ai</span> — AI-Powered Market Intelligence</p>
              <p className="text-[10px] text-muted-foreground">{today}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
