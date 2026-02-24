/**
 * Client-Facing Report — shareable, printable, and copy-ready report
 * that synthesizes all VIGYL data points for a prospect.
 */
import { useRef, useState, useMemo } from "react";
import {
  X, Copy, Check, Download, Share2, Printer, Building2,
  TrendingUp, TrendingDown, Minus, Brain, Bot, Handshake,
  User, Radio, Target, Lightbulb, Shield, Zap, BarChart3,
  Clock, AlertTriangle, Sparkles, Star, ChevronRight
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
      `── EXECUTIVE SUMMARY ──`,
      prospect.companyOverview || `${prospect.companyName} is a ${prospect.annualRevenue} company in ${industry?.name || "their industry"}.`,
      prospect.marketPosition ? `Market Position: ${prospect.marketPosition}` : "",
      prospect.competitiveAdvantage ? `Competitive Edge: ${prospect.competitiveAdvantage}` : "",
      ``,
      `── COMPANY OVERVIEW ──`,
      `Company: ${prospect.companyName}`,
      `Industry: ${industry?.name || "N/A"}`,
      `Location: ${prospect.location.city}, ${prospect.location.state}`,
      `Revenue: ${prospect.annualRevenue}`,
      `Employees: ${prospect.employeeCount.toLocaleString()}`,
      `Market Position: ${prospect.marketPosition || getPressureLabel(prospect.pressureResponse)}`,
      prospect.aiReadiness ? `AI Readiness Score: ${prospect.aiReadiness.score}/100` : "",
      ``,
      `── WHY NOW ──`,
      prospect.whyNow,
    ];

    // Company-specific signals
    if (prospect.companySignals && prospect.companySignals.length > 0) {
      lines.push(``, `── COMPANY SIGNALS (${prospect.companySignals.length}) ──`);
      prospect.companySignals.forEach((cs: any) => {
        lines.push(`[${cs.type?.toUpperCase()}] ${cs.title} — ${cs.sentiment} (${cs.severity}/5)`);
        lines.push(`  ${cs.summary}`);
        if (cs.source) lines.push(`  Source: ${cs.source} (${cs.publishedDate})`);
      });
    }

    // Market signals
    if (allRelevantSignals.length > 0) {
      lines.push(``, `── MARKET SIGNALS (${allRelevantSignals.length}) ──`);
      allRelevantSignals.forEach(s => lines.push(`[${s.sentiment?.toUpperCase()}] ${s.title} — Severity ${s.severity}/5\n  → ${s.salesImplication}`));
    }

    if (industry) {
      lines.push(``, `── INDUSTRY HEALTH ──`);
      lines.push(`${industry.name}: Health Score ${industry.healthScore}/100 (${industry.trendDirection})`);
    }

    // AI Impact
    if (aiImpact) {
      lines.push(``, `── AI IMPACT ANALYSIS ──`);
      lines.push(`Automation Rate: ${aiImpact.automationRate}%`);
      lines.push(`AI-Led Functions: ${aiImpact.aiLedFunctions.length} | Collaborative: ${aiImpact.collaborativeFunctions.length} | Human-Led: ${aiImpact.humanLedFunctions.length}`);
    }

    // AI Readiness
    if (prospect.aiReadiness) {
      lines.push(``, `── AI READINESS PROFILE ──`);
      lines.push(`Score: ${prospect.aiReadiness.score}/100`);
      if (prospect.aiReadiness.currentAiUsage?.length) lines.push(`Current AI Usage: ${prospect.aiReadiness.currentAiUsage.join(", ")}`);
      if (prospect.aiReadiness.aiOpportunities?.length) lines.push(`AI Opportunities: ${prospect.aiReadiness.aiOpportunities.join(", ")}`);
      if (prospect.aiReadiness.humanEdge?.length) lines.push(`Human Edge: ${prospect.aiReadiness.humanEdge.join(", ")}`);
    }

    // Client Intelligence
    if (prospect.clientIntelligence) {
      const ci = prospect.clientIntelligence;
      lines.push(``, `── MARKET INTELLIGENCE ──`);
      if (ci.industryOutlook) lines.push(`Industry Outlook: ${ci.industryOutlook}`);
      if (ci.keyTrends?.length) { lines.push(`Key Trends:`); ci.keyTrends.forEach(t => lines.push(`  • ${t}`)); }
      if (ci.regulatoryWatch?.length) { lines.push(`Regulatory Watch:`); ci.regulatoryWatch.forEach(r => lines.push(`  ⚠ ${r}`)); }
      if (ci.aiTransformationMap) lines.push(`AI Transformation: ${ci.aiTransformationMap}`);
      if (ci.recommendedActions?.length) { lines.push(`Recommended Actions:`); ci.recommendedActions.forEach(a => lines.push(`  → ${a}`)); }
    }

    // How we can help
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
      prospect.competitors.forEach((c: any) => {
        lines.push(`• ${c.name}: ${c.description}`);
        if (c.strength) lines.push(`  Strength: ${c.strength}`);
        if (c.weakness) lines.push(`  Weakness: ${c.weakness}`);
      });
    }

    lines.push(``, `── KEY CONTACTS ──`);
    prospect.decisionMakers.filter(d => d.verified !== false).forEach(d => lines.push(`• ${d.name} — ${d.title}${d.verified ? " ✓" : ""}`));

    lines.push(``, `---`, `Powered by VIGYL.ai — AI-Powered Market Intelligence`);

    navigator.clipboard.writeText(lines.filter(l => l !== undefined).join("\n"));
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
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {prospect.marketPosition && (
                    <span className="inline-flex rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-[9px] font-semibold text-violet-700 dark:text-violet-300">{prospect.marketPosition}</span>
                  )}
                  {prospect.aiReadiness && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                      prospect.aiReadiness.score >= 70 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" :
                      prospect.aiReadiness.score >= 40 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" :
                      "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                    }`}>AI Ready: {prospect.aiReadiness.score}</span>
                  )}
                </div>
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
              <MetricBox label="Market Position" value={prospect.marketPosition || getPressureLabel(prospect.pressureResponse)} />
              <MetricBox label={prospect.aiReadiness ? "AI Readiness" : "Pipeline"} value={prospect.aiReadiness ? `${prospect.aiReadiness.score}/100` : pipelineStageLabels[prospect.pipelineStage]} />
            </div>

            {/* Executive Summary */}
            {(prospect.companyOverview || prospect.competitiveAdvantage) && (
              <Section title="Executive Summary" icon={<Building2 className="h-4 w-4 text-primary" />}>
                {prospect.companyOverview && <p className="text-sm text-foreground leading-relaxed mb-1">{prospect.companyOverview}</p>}
                {prospect.competitiveAdvantage && <p className="text-xs text-primary/80 italic">{prospect.competitiveAdvantage}</p>}
              </Section>
            )}

            {/* Why Now */}
            <Section title="Why Now — Timing & Opportunity" icon={<Clock className="h-4 w-4 text-primary" />}>
              <p className="text-sm text-foreground leading-relaxed">{prospect.whyNow}</p>
            </Section>

            {/* Company-Specific Signals */}
            {prospect.companySignals && prospect.companySignals.length > 0 && (
              <Section title={`${prospect.companyName} Signals (${prospect.companySignals.length})`} icon={<Zap className="h-4 w-4 text-amber-500" />}>
                <div className="space-y-2">
                  {prospect.companySignals.map((cs: any) => (
                    <div key={cs.id} className="flex items-start gap-2.5 rounded-lg border border-border p-3">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${cs.sentiment === "positive" ? "bg-emerald-500" : cs.sentiment === "negative" ? "bg-rose-500" : "bg-muted-foreground"}`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{cs.title}</span>
                          <span className="text-[8px] rounded-full bg-secondary px-1.5 py-0.5 text-muted-foreground uppercase">{cs.type}</span>
                          <span className="text-[9px] text-muted-foreground">{cs.severity}/5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{cs.summary}</p>
                        {cs.source && <p className="text-[9px] text-muted-foreground/70 mt-1">{cs.source} · {cs.publishedDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

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

            {/* AI Readiness Profile */}
            {prospect.aiReadiness && (
              <Section title="AI Readiness Profile" icon={<Sparkles className="h-4 w-4 text-violet-500" />}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${prospect.aiReadiness.score >= 70 ? "bg-emerald-500" : prospect.aiReadiness.score >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${prospect.aiReadiness.score}%` }} />
                  </div>
                  <span className="text-sm font-mono font-bold text-foreground">{prospect.aiReadiness.score}/100</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {prospect.aiReadiness.aiOpportunities?.length > 0 && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2">
                      <p className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">AI Opportunities</p>
                      {prospect.aiReadiness.aiOpportunities.map((item: string, i: number) => (
                        <p key={i} className="text-[10px] text-emerald-700 dark:text-emerald-300">• {item}</p>
                      ))}
                    </div>
                  )}
                  {prospect.aiReadiness.humanEdge?.length > 0 && (
                    <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 p-2">
                      <p className="text-[8px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-1">Human Edge</p>
                      {prospect.aiReadiness.humanEdge.map((item: string, i: number) => (
                        <p key={i} className="text-[10px] text-sky-700 dark:text-sky-300">• {item}</p>
                      ))}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Client Intelligence */}
            {prospect.clientIntelligence && (
              <Section title="Market Intelligence" icon={<Target className="h-4 w-4 text-primary" />}>
                {prospect.clientIntelligence.industryOutlook && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Industry Outlook</p>
                    <p className="text-xs text-foreground leading-relaxed">{prospect.clientIntelligence.industryOutlook}</p>
                  </div>
                )}
                {prospect.clientIntelligence.keyTrends?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Key Trends</p>
                    <div className="flex flex-wrap gap-1.5">
                      {prospect.clientIntelligence.keyTrends.map((t: string, i: number) => (
                        <span key={i} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] text-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {prospect.clientIntelligence.aiTransformationMap && (
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">AI Transformation</p>
                    <p className="text-xs text-foreground leading-relaxed">{prospect.clientIntelligence.aiTransformationMap}</p>
                  </div>
                )}
                {prospect.clientIntelligence.recommendedActions?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Recommended Actions</p>
                    <div className="space-y-1">
                      {prospect.clientIntelligence.recommendedActions.map((a: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <p className="text-[11px] text-foreground">{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {prospect.competitors.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-muted-foreground shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.description}</p>
                        {(c.strength || c.weakness) && (
                          <div className="flex gap-3 mt-1.5">
                            {c.strength && <p className="text-[9px] text-rose-600 dark:text-rose-400">Strength: {c.strength}</p>}
                            {c.weakness && <p className="text-[9px] text-amber-600 dark:text-amber-400">Gap: {c.weakness}</p>}
                          </div>
                        )}
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
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-foreground">{dm.name}</p>
                        {dm.verified ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700 dark:text-emerald-300">✓ Verified</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700 dark:text-amber-300">Suggested Role</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{dm.title}</p>
                      {dm.relevance && <p className="text-[9px] text-muted-foreground/70 mt-0.5 italic">{dm.relevance}</p>}
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
