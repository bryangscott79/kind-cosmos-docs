import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Newspaper, Brain, Bot, Handshake, User, Users, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import SignalCard from "@/components/SignalCard";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { getScoreColorHsl, getTrendIcon } from "@/data/mockData";
import AskArgus from "@/components/AskArgus";
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

const scoreFactors = [
  { label: "News Sentiment", weight: 25 },
  { label: "Hiring Velocity", weight: 20 },
  { label: "Regulatory Activity", weight: 15 },
  { label: "Economic Indicators", weight: 15 },
  { label: "Market Momentum", weight: 15 },
  { label: "Supply Chain", weight: 10 },
];

function CollapsibleSection({ title, icon, defaultOpen = false, badge, children }: { title: string; icon?: React.ReactNode; defaultOpen?: boolean; badge?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{badge}</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

export default function IndustryDetail() {
  const { slug } = useParams();
  const { data } = useIntelligence();
  const { industries, signals, prospects, aiImpact } = data;
  const { persona } = useAuth();

  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    return (
      <IntelligenceLoader>
        <DashboardLayout>
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-lg text-muted-foreground">Industry not found</p>
            <Link to="/industries" className="mt-4 text-sm text-primary hover:underline">Back to Briefing</Link>
          </div>
        </DashboardLayout>
      </IntelligenceLoader>
    );
  }

  const relatedSignals = signals.filter((s) => s.industryTags.includes(industry.id));
  const relatedProspects = prospects.filter((p) => p.industryId === industry.id).sort((a, b) => b.vigylScore - a.vigylScore);

  // Find AI Impact data for this industry
  const impactData = aiImpact?.find((a) => {
    const slug = industry.slug || industry.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const aSlug = (a.industryId || a.industryName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return (
      a.industryId === industry.id ||
      a.industryName?.toLowerCase() === industry.name.toLowerCase() ||
      aSlug === slug ||
      a.industryId === slug
    );
  });

  const factorScores = scoreFactors.map((f) => ({
    ...f,
    score: Math.max(10, Math.min(100, industry.healthScore + Math.round((Math.random() - 0.5) * 30))),
  }));

  const sellerInsight = industry.healthScore >= 70
    ? {
        summary: `${industry.name} is showing strong health signals. Companies here are likely in growth or strategic investment mode.`,
        bullets: [
          "Focus on expansion-oriented solutions — emphasize competitive advantage",
          "Decision-makers are receptive to innovation pitches",
          "Budget availability is high; longer-term contracts are feasible",
          "Reference industry momentum in your outreach",
        ],
      }
    : industry.healthScore >= 40
    ? {
        summary: `${industry.name} shows mixed signals. Look for companies making strategic investments despite headwinds.`,
        bullets: [
          "Target companies investing strategically — they have the most urgent needs",
          "Lead with ROI and efficiency messaging",
          "Decision cycles may be faster due to urgency",
          "Position solutions as risk mitigation",
        ],
      }
    : {
        summary: `${industry.name} is under significant pressure. Target companies investing strategically to adapt.`,
        bullets: [
          "Focus on cost-reduction and efficiency solutions",
          "Identify companies still hiring or investing despite the downturn",
          "Shorter contract terms may be more palatable",
          "Emphasize proven ROI with relevant case studies",
        ],
      };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <Link to="/industries" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Briefing
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{industry.name}</h1>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: getScoreColorHsl(industry.healthScore) }}>
                      {getTrendIcon(industry.trendDirection)} {industry.trendDirection.charAt(0).toUpperCase() + industry.trendDirection.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">30-day trend</span>
                  </div>
                </div>
                <HealthScoreGauge score={industry.healthScore} />
              </div>

              {industry.scoreHistory && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">30-Day Score History</h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={industry.scoreHistory}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--brand-blue))" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="hsl(var(--brand-blue))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} />
                        <Area type="monotone" dataKey="score" stroke="hsl(var(--brand-blue))" fill="url(#scoreGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            <AskArgus
              context={`Industry: ${industry.name}\nHealth Score: ${industry.healthScore}/100\nTrend: ${industry.trendDirection}\nActive Signals: ${relatedSignals.length} (${relatedSignals.filter(s => s.severity >= 4).length} high-severity)\nProspects: ${relatedProspects.length} in pipeline\nTop Prospects: ${relatedProspects.slice(0, 3).map(p => `${p.companyName} (Score: ${p.vigylScore})`).join(", ")}\n${impactData ? `AI Automation Rate: ${impactData.automationRate}%\nAI-Led Functions: ${impactData.aiLedFunctions.length}\nCollaborative Functions: ${impactData.collaborativeFunctions.length}\nHuman-Led Functions: ${impactData.humanLedFunctions.length}\nOpportunity Index: ${impactData.collaborativeOpportunityIndex}` : "AI Impact: Not yet analyzed"}\nSeller Insight: ${sellerInsight.summary}`}
              label={industry.name}
              greeting={`I'm looking at ${industry.name} (Health Score: ${industry.healthScore}). There are ${relatedSignals.length} active signals and ${relatedProspects.length} prospects in your pipeline. What would you like to explore?`}
            />

            {/* AI Impact snapshot */}
            {impactData && (
              <CollapsibleSection title="AI Impact" icon={<Brain className="h-4 w-4 text-primary" />} defaultOpen={true} badge={`${impactData.automationRate}% automated`}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-center">
                      <Bot className="h-4 w-4 text-rose-600 mx-auto mb-1" />
                      <p className="text-lg font-mono font-bold text-rose-600">{impactData.aiLedFunctions.length}</p>
                      <p className="text-[10px] text-rose-600/70">AI-Led Functions</p>
                    </div>
                    <div className="rounded-md bg-violet-50 border border-violet-200 p-3 text-center">
                      <Handshake className="h-4 w-4 text-violet-600 mx-auto mb-1" />
                      <p className="text-lg font-mono font-bold text-violet-600">{impactData.collaborativeFunctions.length}</p>
                      <p className="text-[10px] text-violet-600/70">Collaborative</p>
                    </div>
                    <div className="rounded-md bg-sky-50 border border-sky-200 p-3 text-center">
                      <User className="h-4 w-4 text-sky-600 mx-auto mb-1" />
                      <p className="text-lg font-mono font-bold text-sky-600">{impactData.humanLedFunctions.length}</p>
                      <p className="text-[10px] text-sky-600/70">Human-Led</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 h-2 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(impactData.aiLedFunctions.length / (impactData.aiLedFunctions.length + impactData.collaborativeFunctions.length + impactData.humanLedFunctions.length)) * 100}%` }} />
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(impactData.collaborativeFunctions.length / (impactData.aiLedFunctions.length + impactData.collaborativeFunctions.length + impactData.humanLedFunctions.length)) * 100}%` }} />
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(impactData.humanLedFunctions.length / (impactData.aiLedFunctions.length + impactData.collaborativeFunctions.length + impactData.humanLedFunctions.length)) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-md bg-secondary p-2">
                      <p className="text-[10px] text-muted-foreground">Opportunity Index</p>
                      <p className="text-sm font-mono font-bold text-violet-600">{impactData.collaborativeOpportunityIndex}/100</p>
                    </div>
                    <div className="rounded-md bg-secondary p-2">
                      <p className="text-[10px] text-muted-foreground">Human Resilience</p>
                      <p className="text-sm font-mono font-bold text-sky-600">{impactData.humanResilienceScore}/100</p>
                    </div>
                  </div>
                  <Link to={`/ai-impact/${industry.slug}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    View full AI impact breakdown <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CollapsibleSection>
            )}

            {/* Score composition */}
            <CollapsibleSection title="Score Composition" defaultOpen={true}>
              <div className="space-y-3">
                {factorScores.map((f) => {
                  const color = getScoreColorHsl(f.score);
                  return (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="w-36 text-xs text-muted-foreground">{f.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${f.score}%`, backgroundColor: color }} />
                      </div>
                      <span className="w-8 text-right text-xs font-mono font-semibold text-foreground">{f.score}</span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            {/* Recent Signals */}
            <CollapsibleSection title="Recent Signals" defaultOpen={true} badge={`${relatedSignals.length}`}>
              <div className="space-y-3">
                {relatedSignals.length > 0 ? (
                  relatedSignals.slice(0, 5).map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No signals tracked for this industry yet.</p>
                )}
                {relatedSignals.length > 5 && (
                  <Link to="/signals" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80">
                    View all {relatedSignals.length} signals <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CollapsibleSection>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Prospects in this industry */}
            <CollapsibleSection title={persona.prospectLabel} icon={<Users className="h-4 w-4 text-primary" />} defaultOpen={true} badge={`${relatedProspects.length}`}>
              {relatedProspects.length > 0 ? (
                <div className="space-y-2">
                  {relatedProspects.slice(0, 6).map((p) => (
                    <Link
                      key={p.id}
                      to={`/prospects?industry=${industry.id}`}
                      className="flex items-center justify-between rounded-md border border-border p-2.5 hover:border-primary/20 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.companyName}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{p.whyNow.split(".")[0]}.</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {p.pressureResponse === "growth_mode" ? <TrendingUp className="h-3 w-3 text-emerald-500" /> :
                         p.pressureResponse === "contracting" ? <TrendingDown className="h-3 w-3 text-rose-500" /> :
                         <Minus className="h-3 w-3 text-blue-500" />}
                        <span className="text-xs font-mono font-bold text-primary">{p.vigylScore}</span>
                      </div>
                    </Link>
                  ))}
                  {relatedProspects.length > 6 && (
                    <Link to={`/prospects?industry=${industry.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 mt-1">
                      View all {relatedProspects.length} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-2">No prospects in this industry yet.</p>
                  <Link to="/prospects" className="text-xs font-medium text-primary hover:text-primary/80">Explore prospects</Link>
                </div>
              )}
            </CollapsibleSection>

            {/* Top signals summary */}
            <CollapsibleSection title="Key Takeaways" defaultOpen={true} badge={`${industry.topSignals.length}`}>
              <div className="space-y-2.5">
                {industry.topSignals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{signal}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Seller insight */}
            <CollapsibleSection title="Seller Playbook" defaultOpen={true}>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{sellerInsight.summary}</p>
              <div className="space-y-2">
                {sellerInsight.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <Link
              to={`/prospects?industry=${industry.id}`}
              className="block w-full rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Find {persona.prospectLabel} in {industry.name}
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
