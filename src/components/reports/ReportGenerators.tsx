/**
 * Report generator functions and shared components.
 * Extracted from Reports.tsx for maintainability.
 * These are pure render functions — no state, no side effects.
 */
import React from "react";
import {
  FileText, Building2, Users, BarChart3, Calendar,
  Brain, TrendingUp, TrendingDown, Bot, Handshake, Minus,
  User, Radio, Clock, AlertTriangle, CheckCircle2,
  Target, Lightbulb, Shield, Zap, Briefcase
} from "lucide-react";
import {
  Industry, Signal, Prospect, AIImpactAnalysis,
  getScoreColorHsl, getPressureLabel, pipelineStageLabels, getSignalTypeLabel
} from "@/data/mockData";

// ─── Section component ───
function ReportSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5 mt-5 first:border-0 first:pt-0 first:mt-0">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-lg font-mono font-bold ${color || "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Report generators ───

function generateIndustryDeepDive(industry: Industry, signals: Signal[], prospects: Prospect[], aiImpact: AIImpactAnalysis | undefined): React.ReactNode {
  const relatedSignals = signals.filter(s => s.industryTags.includes(industry.id));
  const relatedProspects = prospects.filter(p => p.industryId === industry.id).sort((a, b) => b.vigylScore - a.vigylScore);
  const negSignals = relatedSignals.filter(s => s.sentiment === "negative");
  const posSignals = relatedSignals.filter(s => s.sentiment === "positive");
  const highSeverity = relatedSignals.filter(s => s.severity >= 4);
  const delta = industry.scoreHistory.length >= 7 ? industry.healthScore - industry.scoreHistory[industry.scoreHistory.length - 7].score : 0;

  return (
    <div className="space-y-0">
      <ReportSection title="Executive Summary" icon={<FileText className="h-4 w-4 text-primary" />}>
        <div className="rounded-lg bg-primary/[0.03] border border-primary/10 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold">{industry.name}</span> has a health score of <span className="font-bold" style={{ color: getScoreColorHsl(industry.healthScore) }}>{industry.healthScore}/100</span> and is currently <span className="font-medium">{industry.trendDirection}</span>
            {delta !== 0 && <> ({delta > 0 ? "+" : ""}{delta} over 7 days)</>}.
            There are <span className="font-semibold">{relatedSignals.length} active signals</span> ({posSignals.length} positive, {negSignals.length} negative) and <span className="font-semibold">{relatedProspects.length} prospects</span> in your pipeline.
            {highSeverity.length > 0 && <> <span className="text-rose-600 font-semibold">{highSeverity.length} high-severity alerts</span> require immediate attention.</>}
          </p>
        </div>
      </ReportSection>

      <ReportSection title="Key Metrics" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Health Score" value={industry.healthScore} sub={`${delta > 0 ? "+" : ""}${delta} / 7d`} color={getScoreColorHsl(industry.healthScore)} />
          <MetricCard label="Active Signals" value={relatedSignals.length} sub={`${highSeverity.length} high severity`} />
          <MetricCard label="Prospects" value={relatedProspects.length} sub={`Avg score: ${relatedProspects.length > 0 ? Math.round(relatedProspects.reduce((s, p) => s + p.vigylScore, 0) / relatedProspects.length) : 0}`} />
          {aiImpact && <MetricCard label="AI Automation" value={`${aiImpact.automationRate}%`} sub={`${aiImpact.aiLedFunctions.length} AI-led functions`} color="text-violet-600" />}
        </div>
      </ReportSection>

      {aiImpact && (
        <ReportSection title="AI Impact Analysis" icon={<Brain className="h-4 w-4 text-primary" />}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-center">
              <Bot className="h-4 w-4 text-rose-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-rose-600">{aiImpact.aiLedFunctions.length} AI-Led</p>
              <p className="text-[10px] text-rose-600/70 mt-0.5">{aiImpact.aiLedFunctions.slice(0, 3).map(f => f.name).join(", ")}</p>
            </div>
            <div className="rounded-lg bg-violet-50 border border-violet-200 p-3 text-center">
              <Handshake className="h-4 w-4 text-violet-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-violet-600">{aiImpact.collaborativeFunctions.length} Collaborative</p>
              <p className="text-[10px] text-violet-600/70 mt-0.5">{aiImpact.collaborativeFunctions.slice(0, 3).map(f => f.name).join(", ")}</p>
            </div>
            <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 text-center">
              <User className="h-4 w-4 text-sky-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-sky-600">{aiImpact.humanLedFunctions.length} Human-Led</p>
              <p className="text-[10px] text-sky-600/70 mt-0.5">{aiImpact.humanLedFunctions.slice(0, 3).map(f => f.name).join(", ")}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Displacement Index" value={aiImpact.jobDisplacementIndex} color="text-rose-600" />
            <MetricCard label="Opportunity Index" value={aiImpact.collaborativeOpportunityIndex} color="text-violet-600" />
            <MetricCard label="Human Resilience" value={aiImpact.humanResilienceScore} color="text-sky-600" />
          </div>
        </ReportSection>
      )}

      <ReportSection title={`Active Signals (${relatedSignals.length})`} icon={<Radio className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {relatedSignals.sort((a, b) => b.severity - a.severity).slice(0, 8).map(s => (
            <div key={s.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${s.sentiment === "positive" ? "bg-emerald-500" : s.sentiment === "negative" ? "bg-rose-500" : "bg-slate-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{s.title}</span>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase">{getSignalTypeLabel(s.signalType)}</span>
                  <span className="text-[9px] text-muted-foreground">{s.severity}/5</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{s.salesImplication}</p>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title={`Prospect Pipeline (${relatedProspects.length})`} icon={<Target className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {relatedProspects.slice(0, 6).map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{p.companyName}</p>
                <p className="text-[10px] text-muted-foreground">{p.location.city}, {p.location.state} · {p.annualRevenue} · {p.employeeCount.toLocaleString()} employees</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{p.whyNow.split(".")[0]}.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-[9px] font-medium text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{pipelineStageLabels[p.pipelineStage]}</span>
                <span className="text-sm font-mono font-bold text-primary">{p.vigylScore}</span>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Strategic Recommendations" icon={<Lightbulb className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {industry.healthScore >= 70 && <RecommendationCard icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} title="Capitalize on Growth" text="Industry is strong. Lead with innovation and competitive advantage messaging. Budget availability is high — pursue longer-term contracts." />}
          {industry.healthScore < 40 && <RecommendationCard icon={<Shield className="h-4 w-4 text-amber-600" />} title="Lead with Risk Mitigation" text="Industry under pressure. Position solutions as cost-reduction and efficiency tools. Shorter contract terms may improve close rates." />}
          {highSeverity.length > 0 && <RecommendationCard icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} title={`Act on ${highSeverity.length} High-Severity Signals`} text={`Critical signals: ${highSeverity.slice(0, 2).map(s => s.title).join(", ")}. These create urgency — reference them in outreach.`} />}
          {aiImpact && aiImpact.collaborativeOpportunityIndex >= 60 && <RecommendationCard icon={<Handshake className="h-4 w-4 text-violet-600" />} title="AI Augmentation is the Sweet Spot" text={`Collaborative opportunity index of ${aiImpact.collaborativeOpportunityIndex}/100 means companies need AI augmentation tools — not full replacement. Sell co-pilot solutions.`} />}
          {relatedProspects.filter(p => p.pressureResponse === "growth_mode").length > 0 && <RecommendationCard icon={<Zap className="h-4 w-4 text-primary" />} title="Prioritize Growth-Mode Companies" text={`${relatedProspects.filter(p => p.pressureResponse === "growth_mode").length} companies are in growth mode and actively investing. These have the shortest sales cycles.`} />}
        </div>
      </ReportSection>
    </div>
  );
}

function RecommendationCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-secondary/50 border border-border p-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function generateProspectDossier(prospect: Prospect, industry: Industry | undefined, signals: Signal[], aiImpact: AIImpactAnalysis | undefined): React.ReactNode {
  const relatedSignals = signals.filter(s => prospect.relatedSignals.includes(s.id));
  return (
    <div className="space-y-0">
      <ReportSection title="Company Profile" icon={<Building2 className="h-4 w-4 text-primary" />}>
        <div className="rounded-lg bg-primary/[0.03] border border-primary/10 p-4 mb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">{prospect.companyName}</h3>
              <p className="text-xs text-muted-foreground">{industry?.name || "Unknown Industry"} · {prospect.location.city}, {prospect.location.state}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-primary">{prospect.vigylScore}</p>
              <p className="text-[9px] text-muted-foreground">VIGYL Score</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Revenue" value={prospect.annualRevenue} />
          <MetricCard label="Employees" value={prospect.employeeCount.toLocaleString()} />
          <MetricCard label="Pipeline Stage" value={pipelineStageLabels[prospect.pipelineStage]} />
          <MetricCard label="Pressure Response" value={getPressureLabel(prospect.pressureResponse)} />
        </div>
      </ReportSection>

      <ReportSection title="Why Now" icon={<Clock className="h-4 w-4 text-primary" />}>
        <p className="text-sm text-foreground leading-relaxed">{prospect.whyNow}</p>
      </ReportSection>

      <ReportSection title={`Decision Makers (${prospect.decisionMakers.length})`} icon={<Users className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {prospect.decisionMakers.map((dm, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">{dm.name}</p>
                <p className="text-[10px] text-muted-foreground">{dm.title}</p>
              </div>
              <a href={dm.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-primary hover:text-primary/80">LinkedIn →</a>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title={`Related Signals (${relatedSignals.length})`} icon={<Radio className="h-4 w-4 text-primary" />}>
        {relatedSignals.length > 0 ? (
          <div className="space-y-2">
            {relatedSignals.map(s => (
              <div key={s.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${s.sentiment === "positive" ? "bg-emerald-500" : s.sentiment === "negative" ? "bg-rose-500" : "bg-slate-400"}`} />
                  <span className="text-xs font-semibold text-foreground">{s.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{s.salesImplication}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No directly linked signals. Check industry-level signals for {industry?.name}.</p>
        )}
      </ReportSection>

      <ReportSection title="Outreach Strategy" icon={<Lightbulb className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          <RecommendationCard icon={<Target className="h-4 w-4 text-primary" />} title="Primary Angle" text={
            prospect.pressureResponse === "growth_mode"
              ? `${prospect.companyName} is in growth mode. Lead with competitive advantage and innovation — they're investing aggressively.`
              : prospect.pressureResponse === "contracting"
              ? `${prospect.companyName} is cost-conscious. Lead with ROI, efficiency, and risk reduction. Keep proposals lean and timeline-focused.`
              : `${prospect.companyName} is investing strategically. Show clear ROI with a phased approach — quick wins first, then expansion.`
          } />
          {prospect.decisionMakers[0] && (
            <RecommendationCard icon={<User className="h-4 w-4 text-violet-600" />} title={`Lead Contact: ${prospect.decisionMakers[0].name}`} text={`${prospect.decisionMakers[0].title} — tailor your messaging to their functional priorities. ${prospect.decisionMakers[0].title.includes("CTO") || prospect.decisionMakers[0].title.includes("Tech") ? "Focus on technical capabilities and integration." : prospect.decisionMakers[0].title.includes("VP") || prospect.decisionMakers[0].title.includes("SVP") ? "Focus on strategic impact and business outcomes." : "Focus on operational efficiency and team impact."}`} />
          )}
          {relatedSignals.length > 0 && (
            <RecommendationCard icon={<Radio className="h-4 w-4 text-amber-600" />} title="Signal-Based Hook" text={`Reference "${relatedSignals[0].title}" in your outreach. This creates urgency and shows you understand their market context.`} />
          )}
        </div>
      </ReportSection>
    </div>
  );
}

function generateWeeklyBrief(industries: Industry[], signals: Signal[], prospects: Prospect[]): React.ReactNode {
  const highSeverity = signals.filter(s => s.severity >= 4).sort((a, b) => b.severity - a.severity);
  const positiveSignals = signals.filter(s => s.sentiment === "positive");
  const negativeSignals = signals.filter(s => s.sentiment === "negative");
  const improving = industries.filter(i => i.trendDirection === "improving");
  const declining = industries.filter(i => i.trendDirection === "declining");
  const hotProspects = prospects.filter(p => p.vigylScore >= 80).sort((a, b) => b.vigylScore - a.vigylScore);
  const pipelineActive = prospects.filter(p => ["contacted", "meeting_scheduled", "proposal_sent"].includes(p.pipelineStage));
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-0">
      <ReportSection title="This Week at a Glance" icon={<Calendar className="h-4 w-4 text-primary" />}>
        <p className="text-[10px] text-muted-foreground mb-3">Generated {today}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Total Signals" value={signals.length} sub={`${highSeverity.length} critical`} />
          <MetricCard label="Signal Sentiment" value={`${positiveSignals.length}↑ ${negativeSignals.length}↓`} sub="positive vs negative" />
          <MetricCard label="Industries Tracked" value={industries.length} sub={`${improving.length} improving, ${declining.length} declining`} />
          <MetricCard label="Hot Prospects" value={hotProspects.length} sub="Score ≥ 80" color="text-primary" />
        </div>
      </ReportSection>

      <ReportSection title={`Critical Alerts (${highSeverity.length})`} icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}>
        {highSeverity.length > 0 ? (
          <div className="space-y-2">
            {highSeverity.slice(0, 5).map(s => (
              <div key={s.id} className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase text-rose-600">{getSignalTypeLabel(s.signalType)} · Severity {s.severity}/5</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{s.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.salesImplication}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-muted-foreground">No critical alerts this week.</p>}
      </ReportSection>

      <ReportSection title="Industry Movers" icon={<TrendingUp className="h-4 w-4 text-primary" />}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Improving</p>
            {improving.length > 0 ? improving.map(i => (
              <div key={i.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-foreground">{i.name}</span>
                <span className="text-xs font-mono font-bold text-emerald-600">{i.healthScore}</span>
              </div>
            )) : <p className="text-[10px] text-muted-foreground">None this week.</p>}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mb-2">Declining</p>
            {declining.length > 0 ? declining.map(i => (
              <div key={i.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-foreground">{i.name}</span>
                <span className="text-xs font-mono font-bold text-rose-600">{i.healthScore}</span>
              </div>
            )) : <p className="text-[10px] text-muted-foreground">None this week.</p>}
          </div>
        </div>
      </ReportSection>

      <ReportSection title={`Pipeline Activity (${pipelineActive.length} active)`} icon={<Briefcase className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {pipelineActive.map(p => {
            const ind = industries.find(i => i.id === p.industryId);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{p.companyName}</p>
                  <p className="text-[10px] text-muted-foreground">{ind?.name} · {pipelineStageLabels[p.pipelineStage]}</p>
                  {p.notes && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 italic">{p.notes}</p>}
                </div>
                <span className="text-sm font-mono font-bold text-primary shrink-0 ml-3">{p.vigylScore}</span>
              </div>
            );
          })}
        </div>
      </ReportSection>

      <ReportSection title="Top Actions This Week" icon={<CheckCircle2 className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {hotProspects.slice(0, 2).map(p => (
            <RecommendationCard key={p.id} icon={<Target className="h-4 w-4 text-primary" />} title={`Engage ${p.companyName} (Score: ${p.vigylScore})`} text={p.whyNow.split(".")[0] + "."} />
          ))}
          {highSeverity[0] && <RecommendationCard icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} title="React to Critical Signal" text={`"${highSeverity[0].title}" — ${highSeverity[0].salesImplication.split(".")[0]}.`} />}
        </div>
      </ReportSection>
    </div>
  );
}

function generateCompetitiveLandscape(industries: Industry[], signals: Signal[], prospects: Prospect[], aiImpactData: AIImpactAnalysis[]): React.ReactNode {
  const sorted = [...industries].sort((a, b) => b.healthScore - a.healthScore);
  return (
    <div className="space-y-0">
      <ReportSection title="Industry Comparison" icon={<BarChart3 className="h-4 w-4 text-primary" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold text-muted-foreground">Industry</th>
                <th className="text-center py-2 font-semibold text-muted-foreground">Health</th>
                <th className="text-center py-2 font-semibold text-muted-foreground">Trend</th>
                <th className="text-center py-2 font-semibold text-muted-foreground">Signals</th>
                <th className="text-center py-2 font-semibold text-muted-foreground">Prospects</th>
                <th className="text-center py-2 font-semibold text-muted-foreground">AI Rate</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(ind => {
                const ai = aiImpactData.find(a => a.industryId === ind.id);
                const sigCount = signals.filter(s => s.industryTags.includes(ind.id)).length;
                const prosCount = prospects.filter(p => p.industryId === ind.id).length;
                return (
                  <tr key={ind.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-2.5 font-medium text-foreground">{ind.name}</td>
                    <td className="py-2.5 text-center font-mono font-bold" style={{ color: getScoreColorHsl(ind.healthScore) }}>{ind.healthScore}</td>
                    <td className="py-2.5 text-center">
                      {ind.trendDirection === "improving" ? <TrendingUp className="h-3 w-3 text-emerald-500 mx-auto" /> : ind.trendDirection === "declining" ? <TrendingDown className="h-3 w-3 text-rose-500 mx-auto" /> : <Minus className="h-3 w-3 text-slate-400 mx-auto" />}
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">{sigCount}</td>
                    <td className="py-2.5 text-center text-muted-foreground">{prosCount}</td>
                    <td className="py-2.5 text-center font-mono text-violet-600">{ai ? `${ai.automationRate}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportSection>

      <ReportSection title="Opportunity Ranking" icon={<Target className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {sorted.slice(0, 5).map((ind, i) => {
            const prosCount = prospects.filter(p => p.industryId === ind.id).length;
            const ai = aiImpactData.find(a => a.industryId === ind.id);
            return (
              <div key={ind.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{ind.name}</p>
                  <p className="text-[10px] text-muted-foreground">{prosCount} prospects · Health {ind.healthScore} · {ind.trendDirection}{ai ? ` · ${ai.automationRate}% AI adoption` : ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>

      <ReportSection title="Strategic Insights" icon={<Lightbulb className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {sorted[0] && <RecommendationCard icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} title={`Strongest: ${sorted[0].name}`} text={`Health score of ${sorted[0].healthScore}. This is your highest-opportunity market right now.`} />}
          {sorted[sorted.length - 1] && <RecommendationCard icon={<TrendingDown className="h-4 w-4 text-rose-600" />} title={`Weakest: ${sorted[sorted.length - 1].name}`} text={`Health score of ${sorted[sorted.length - 1].healthScore}. Focus on risk-mitigation messaging or reduce investment here.`} />}
        </div>
      </ReportSection>
    </div>
  );
}

function generateAIReadiness(industry: Industry, aiImpact: AIImpactAnalysis | undefined, prospects: Prospect[]): React.ReactNode {
  if (!aiImpact) {
    return <p className="text-sm text-muted-foreground py-8 text-center">AI impact data not yet available for {industry.name}. Generate AI impact analysis first.</p>;
  }
  const relatedProspects = prospects.filter(p => p.industryId === industry.id);
  const allFunctions = [...aiImpact.aiLedFunctions, ...aiImpact.collaborativeFunctions, ...aiImpact.humanLedFunctions];
  const avgAutomation = allFunctions.length > 0 ? Math.round(allFunctions.reduce((s, f) => s + f.automationLevel, 0) / allFunctions.length) : 0;
  const maturity = avgAutomation >= 70 ? "Leading" : avgAutomation >= 50 ? "Scaling" : avgAutomation >= 30 ? "Piloting" : "Exploring";
  const nowFunctions = allFunctions.filter(f => f.timeline === "now");
  const nearFunctions = allFunctions.filter(f => f.timeline === "6_months");
  const futureFunctions = allFunctions.filter(f => f.timeline === "1_year" || f.timeline === "2_plus_years");

  return (
    <div className="space-y-0">
      <ReportSection title="AI Maturity Assessment" icon={<Brain className="h-4 w-4 text-primary" />}>
        <div className="rounded-lg bg-primary/[0.03] border border-primary/10 p-4 mb-3">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-bold">{industry.name}</span> is at the <span className="font-bold text-primary">{maturity}</span> stage of AI adoption with an average automation level of <span className="font-bold">{avgAutomation}%</span> across {allFunctions.length} business functions.
            {aiImpact.collaborativeOpportunityIndex >= 60 && " The collaborative opportunity index is high — this industry is ripe for AI augmentation tools."}
            {aiImpact.jobDisplacementIndex >= 50 && " Significant workforce displacement is underway, creating urgency for reskilling and transition solutions."}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="AI Maturity" value={maturity} color="text-primary" />
          <MetricCard label="Avg Automation" value={`${avgAutomation}%`} />
          <MetricCard label="Functions Analyzed" value={allFunctions.length} />
          <MetricCard label="Active Now" value={nowFunctions.length} sub={`${nearFunctions.length} in 6 months`} />
        </div>
      </ReportSection>

      <ReportSection title="Transformation Timeline" icon={<Clock className="h-4 w-4 text-primary" />}>
        <div className="space-y-4">
          {nowFunctions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Active Now ({nowFunctions.length})</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {nowFunctions.map((f, i) => (
                  <div key={i} className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-2.5">
                    <p className="text-xs font-semibold text-foreground">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.automationLevel}% automated · {f.opportunityType.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {nearFunctions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Next 6 Months ({nearFunctions.length})</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {nearFunctions.map((f, i) => (
                  <div key={i} className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-2.5">
                    <p className="text-xs font-semibold text-foreground">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.automationLevel}% automated · {f.opportunityType.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {futureFunctions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-2">1-2+ Years ({futureFunctions.length})</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {futureFunctions.map((f, i) => (
                  <div key={i} className="rounded-md border border-sky-200 bg-sky-50 p-2.5">
                    <p className="text-xs font-semibold text-foreground">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.automationLevel}% automated · {f.opportunityType.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ReportSection>

      <ReportSection title="What to Sell" icon={<Lightbulb className="h-4 w-4 text-primary" />}>
        <div className="space-y-2">
          {aiImpact.collaborativeFunctions.length > 0 && (
            <RecommendationCard icon={<Handshake className="h-4 w-4 text-violet-600" />} title={`AI Co-Pilot Solutions (${aiImpact.collaborativeFunctions.length} functions)`} text={`Functions like ${aiImpact.collaborativeFunctions.slice(0, 2).map(f => f.name).join(" and ")} need human+AI tools — not full automation. This is your biggest opportunity.`} />
          )}
          {aiImpact.aiLedFunctions.length > 0 && (
            <RecommendationCard icon={<Bot className="h-4 w-4 text-rose-600" />} title={`Automation Infrastructure (${aiImpact.aiLedFunctions.length} functions)`} text={`Functions like ${aiImpact.aiLedFunctions.slice(0, 2).map(f => f.name).join(" and ")} are being fully automated. Sell infrastructure, integration, and management tools.`} />
          )}
          {aiImpact.humanLedFunctions.length > 0 && (
            <RecommendationCard icon={<User className="h-4 w-4 text-sky-600" />} title="Human Enablement" text={`${aiImpact.humanLedFunctions.length} functions remain human-led. Sell training, workflow optimization, and decision-support tools — not automation.`} />
          )}
        </div>
      </ReportSection>
    </div>
  );
}

export {
  ReportSection,
  MetricCard,
  RecommendationCard,
  generateIndustryDeepDive,
  generateProspectDossier,
  generateWeeklyBrief,
  generateCompetitiveLandscape,
  generateAIReadiness,
};
