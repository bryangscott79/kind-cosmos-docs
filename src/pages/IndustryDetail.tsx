import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Newspaper } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import SignalCard from "@/components/SignalCard";
import { industries, signals, getScoreColorHsl, getTrendIcon } from "@/data/mockData";
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

const scoreFactors = [
  { label: "News Sentiment", weight: 25 },
  { label: "Hiring Velocity", weight: 20 },
  { label: "Regulatory Activity", weight: 15 },
  { label: "Economic Indicators", weight: 15 },
  { label: "Market Momentum", weight: 15 },
  { label: "Supply Chain", weight: 10 },
];

function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

export default function IndustryDetail() {
  const { slug } = useParams();
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-lg text-muted-foreground">Industry not found</p>
          <Link to="/industries" className="mt-4 text-sm text-primary hover:underline">Back to dashboard</Link>
        </div>
      </DashboardLayout>
    );
  }

  const relatedSignals = signals.filter((s) => s.industryTags.includes(industry.id));

  const factorScores = scoreFactors.map((f) => ({
    ...f,
    score: Math.max(10, Math.min(100, industry.healthScore + Math.round((Math.random() - 0.5) * 30))),
  }));

  const sellerInsight = industry.healthScore >= 70
    ? {
        summary: `${industry.name} is showing strong health signals. Companies in this space are likely in growth or strategic investment mode.`,
        bullets: [
          "Focus on expansion-oriented solutions and emphasize competitive advantage",
          "Decision-makers are receptive to innovation pitches — lead with differentiation",
          "Budget availability is high; longer-term contracts are feasible",
          "Reference industry momentum in your outreach to build urgency",
        ],
      }
    : industry.healthScore >= 40
    ? {
        summary: `${industry.name} shows mixed signals. Look for companies making strategic investments despite industry headwinds.`,
        bullets: [
          "Target companies investing strategically — they have the most urgent needs",
          "Lead with ROI and efficiency messaging, not aspirational pitches",
          "Decision cycles may be faster due to urgency — capitalize on timing",
          "Position solutions as risk mitigation rather than growth enablers",
        ],
      }
    : {
        summary: `${industry.name} is under significant pressure. Target companies investing strategically to adapt.`,
        bullets: [
          "Focus on cost-reduction and efficiency solutions — avoid luxury positioning",
          "Identify companies still hiring or investing despite the downturn",
          "Shorter contract terms may be more palatable — offer flexibility",
          "Emphasize proven ROI with case studies from similar market conditions",
        ],
      };

  return (
    <DashboardLayout>
      <Link to="/industries" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
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
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--brand-blue))" fill="url(#scoreGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Score Composition — fixed with inline styles */}
          <CollapsibleSection title="Score Composition" defaultOpen={true}>
            <div className="space-y-3">
              {factorScores.map((f) => {
                const color = getScoreColorHsl(f.score);
                return (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="w-36 text-xs text-muted-foreground">{f.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${f.score}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-mono font-semibold text-foreground">{f.score}</span>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* Recent Signals — collapsible with sources */}
          <CollapsibleSection
            title="Recent Signals"
            defaultOpen={true}
            badge={`${relatedSignals.length} signals`}
          >
            <div className="space-y-4">
              {relatedSignals.length > 0 ? (
                relatedSignals.map((signal) => (
                  <div key={signal.id} className="space-y-2">
                    <SignalCard signal={signal} />
                    {signal.sources.length > 0 && (
                      <div className="ml-4 rounded-md border border-border bg-background p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Newspaper className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Sources ({signal.sources.length})
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {signal.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between group hover:bg-accent/50 rounded px-2 py-1 -mx-1 transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                <ExternalLink className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                                  {source.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">{source.publishedAt}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No signals tracked for this industry yet.</p>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CollapsibleSection title="Top Signals" defaultOpen={true} badge={`${industry.topSignals.length}`}>
            <div className="space-y-2.5">
              {industry.topSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{signal}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="What This Means for Sellers" defaultOpen={true}>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {sellerInsight.summary}
            </p>
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
            to="/prospects"
            className="block w-full rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Find Prospects in {industry.name}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
