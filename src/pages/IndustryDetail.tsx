import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HealthScoreGauge from "@/components/HealthScoreGauge";
import SignalCard from "@/components/SignalCard";
import { industries, signals, getScoreColor, getTrendIcon } from "@/data/mockData";
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

const scoreFactors = [
  { label: "News Sentiment", weight: 25 },
  { label: "Hiring Velocity", weight: 20 },
  { label: "Regulatory Activity", weight: 15 },
  { label: "Economic Indicators", weight: 15 },
  { label: "Market Momentum", weight: 15 },
  { label: "Supply Chain", weight: 10 },
];

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
  const scoreColor = getScoreColor(industry.healthScore);

  const factorScores = scoreFactors.map((f) => ({
    ...f,
    score: Math.max(10, Math.min(100, industry.healthScore + Math.round((Math.random() - 0.5) * 30))),
  }));

  return (
    <DashboardLayout>
      <Link to="/industries" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{industry.name}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-medium text-${scoreColor}`}>
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

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Score Composition</h3>
            <div className="space-y-3">
              {factorScores.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-muted-foreground">{f.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-${getScoreColor(f.score)} transition-all duration-700`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-muted-foreground">{f.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Signals</h3>
            <div className="space-y-3">
              {relatedSignals.length > 0 ? (
                relatedSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
              ) : (
                <p className="text-sm text-muted-foreground">No signals tracked for this industry yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Top Signals</h3>
            <div className="space-y-2.5">
              {industry.topSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{signal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">What This Means for Sellers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {industry.healthScore >= 70
                ? `${industry.name} is showing strong health signals. Companies in this space are likely in growth or strategic investment mode. Focus on expansion-oriented solutions and emphasize competitive advantage.`
                : industry.healthScore >= 40
                ? `${industry.name} shows mixed signals. Look for companies making strategic investments despite industry headwinds — they often have the most urgent needs and fastest decision cycles.`
                : `${industry.name} is under significant pressure. Target companies investing strategically to adapt, not those broadly cutting. Efficiency and cost-reduction solutions resonate strongest here.`}
            </p>
          </div>

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
