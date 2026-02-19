import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart3, TrendingUp, TrendingDown, Minus, Info, Brain, Bot, Handshake, User, Sparkles, Loader2, RefreshCw } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import type { Industry, AIImpactAnalysis } from "@/data/mockData";

type Timeframe = "7d" | "30d" | "90d";

const timeframeConfig: Record<Timeframe, { label: string; days: number; description: string }> = {
  "7d": { label: "7D", days: 7, description: "Past week" },
  "30d": { label: "30D", days: 30, description: "Past month" },
  "90d": { label: "90D", days: 90, description: "Past quarter" },
};

function getTrendContext(industry: Industry, days: number) {
  const history = industry.scoreHistory || [];
  const len = history.length;
  const currentScore = len > 0 ? history[len - 1].score : industry.healthScore;
  const startIdx = Math.max(0, len - days);
  const delta = len > 0 ? currentScore - (history[startIdx]?.score ?? currentScore) : 0;
  const shortStartIdx = Math.max(0, len - 7);
  const shortDelta = len > 0 ? currentScore - (history[shortStartIdx]?.score ?? currentScore) : 0;
  const longStartIdx = 0;
  const longDelta = len > 1 ? currentScore - history[longStartIdx].score : 0;
  const shortDirection = shortDelta > 2 ? "up" : shortDelta < -2 ? "down" : "flat";
  const longDirection = longDelta > 5 ? "up" : longDelta < -5 ? "down" : "flat";
  const isBlip = shortDirection !== longDirection && shortDirection !== "flat";

  let contextLabel = "";
  let contextColor = "text-muted-foreground";
  if (isBlip && shortDirection === "down" && longDirection === "up") {
    contextLabel = "Short-term dip in a longer uptrend"; contextColor = "text-amber-600";
  } else if (isBlip && shortDirection === "up" && longDirection === "down") {
    contextLabel = "Short-term bounce in a longer downtrend"; contextColor = "text-amber-600";
  } else if (longDirection === "up") {
    contextLabel = days <= 7 ? "Part of sustained growth trend" : "Consistent improvement over time"; contextColor = "text-emerald-600";
  } else if (longDirection === "down") {
    contextLabel = days <= 7 ? "Part of longer decline" : "Extended downward trend"; contextColor = "text-rose-600";
  } else {
    contextLabel = "Stable with minor fluctuations";
  }
  return { delta, shortDelta, longDelta, isBlip, contextLabel, contextColor };
}

function VolatilityDots({ history, days }: { history: { date: string; score: number }[]; days: number }) {
  const slice = history.slice(-days);
  if (slice.length < 3) return null;
  const avg = slice.reduce((s, h) => s + h.score, 0) / slice.length;
  const variance = slice.reduce((s, h) => s + Math.pow(h.score - avg, 2), 0) / slice.length;
  const stdDev = Math.sqrt(variance);
  const level = stdDev < 3 ? "low" : stdDev < 7 ? "medium" : "high";
  const colors = { low: "bg-emerald-400", medium: "bg-amber-400", high: "bg-rose-400" };
  const labels = { low: "Low volatility", medium: "Moderate swings", high: "High volatility" };
  return (
    <div className="flex items-center gap-1" title={labels[level]}>
      <div className={`h-1.5 w-1.5 rounded-full ${colors[level]}`} />
      <span className="text-[9px] text-muted-foreground">{labels[level]}</span>
    </div>
  );
}

// AI Impact mini badge — displayed on its own row for clarity
function AIImpactBadge({ impact }: { impact: AIImpactAnalysis }) {
  const automColor = impact.automationRate >= 70 ? "text-rose-600" : impact.automationRate >= 40 ? "text-amber-600" : "text-emerald-600";
  const dominantZone = impact.aiLedFunctions.length >= impact.collaborativeFunctions.length && impact.aiLedFunctions.length >= impact.humanLedFunctions.length
    ? "ai_led" : impact.collaborativeFunctions.length >= impact.humanLedFunctions.length ? "collaborative" : "human_led";
  const zoneConfig = {
    ai_led: { icon: Bot, color: "text-rose-500", label: "AI-Led" },
    collaborative: { icon: Handshake, color: "text-violet-500", label: "Collab" },
    human_led: { icon: User, color: "text-sky-500", label: "Human-Led" },
  };
  const zone = zoneConfig[dominantZone];
  const ZoneIcon = zone.icon;

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <div className="flex items-center gap-1">
        <div className="w-8 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500" style={{ width: `${impact.automationRate}%` }} />
        </div>
        <span className={`font-mono font-bold ${automColor}`}>{impact.automationRate}%</span>
      </div>
      <span className={`flex items-center gap-0.5 font-medium ${zone.color}`}>
        <ZoneIcon className="h-2.5 w-2.5" />{zone.label}
      </span>
      <span className="text-violet-600 font-medium">Opp:{impact.collaborativeOpportunityIndex}</span>
    </div>
  );
}

interface IndustryHealthTimelineProps {
  industries: Industry[];
  aiImpact?: AIImpactAnalysis[];
  generating?: boolean;
  onGenerateAiImpact?: () => void;
  genProgress?: { current: number; total: number; industryName: string };
}

export default function IndustryHealthTimeline({ industries, aiImpact, generating, onGenerateAiImpact, genProgress }: IndustryHealthTimelineProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");
  const days = timeframeConfig[timeframe].days;

  // Map AI impact by industry name for quick lookup
  const aiImpactMap = useMemo(() => {
    const map = new Map<string, AIImpactAnalysis>();
    if (aiImpact) {
      aiImpact.forEach((a) => {
        map.set(a.industryId, a);
        map.set(a.industryName.toLowerCase(), a);
      });
    }
    return map;
  }, [aiImpact]);

  const getImpact = (ind: Industry) => aiImpactMap.get(ind.id) || aiImpactMap.get(ind.name.toLowerCase());

  const rankedIndustries = useMemo(() => {
    return [...industries]
      .map((ind) => ({ ...ind, trend: getTrendContext(ind, days) }))
      .sort((a, b) => Math.abs(b.trend.delta) - Math.abs(a.trend.delta));
  }, [industries, days]);

  const improving = rankedIndustries.filter((i) => i.trend.delta > 0).slice(0, 5);
  const declining = rankedIndustries.filter((i) => i.trend.delta < 0).slice(0, 5);
  const stable = rankedIndustries.filter((i) => i.trend.delta === 0).slice(0, 3);

  const hasAiData = aiImpact && aiImpact.length > 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Industry Health</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Impact generation button */}
          {onGenerateAiImpact && (
            <button
              onClick={onGenerateAiImpact}
              disabled={generating}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              title={hasAiData ? "Refresh AI Impact analysis" : "Generate AI Impact analysis"}
            >
              {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
              {generating ? (genProgress ? `${genProgress.current}/${genProgress.total}` : "...") : hasAiData ? "Refresh AI" : "Analyze AI"}
            </button>
          )}
          {/* Timeframe selector */}
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary/60 p-0.5">
            {(Object.keys(timeframeConfig) as Timeframe[]).map((tf) => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${timeframe === tf ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {timeframeConfig[tf].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Impact legend when data exists */}
      {hasAiData && (
        <div className="flex items-center gap-3 mb-2 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> AI-Led</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Collaborative</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Human-Led</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Bars show automation rate</span>
        </div>
      )}

      {/* Generation progress */}
      {generating && genProgress && genProgress.total > 0 && (
        <div className="mb-2 rounded-md bg-primary/[0.04] border border-primary/10 p-2">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-[10px] text-muted-foreground">Analyzing: {genProgress.industryName}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(genProgress.current / genProgress.total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {improving.map((ind) => (
          <IndustryHealthRow key={ind.id} industry={ind} trend={ind.trend} days={days} impact={getImpact(ind)} />
        ))}
        {improving.length > 0 && declining.length > 0 && <div className="border-t border-border/50 my-1" />}
        {declining.map((ind) => (
          <IndustryHealthRow key={ind.id} industry={ind} trend={ind.trend} days={days} impact={getImpact(ind)} />
        ))}
        {stable.length > 0 && (
          <>
            <div className="border-t border-border/50 my-1" />
            {stable.map((ind) => (
              <IndustryHealthRow key={ind.id} industry={ind} trend={ind.trend} days={days} impact={getImpact(ind)} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function IndustryHealthRow({ industry, trend, days, impact }: {
  industry: Industry; trend: ReturnType<typeof getTrendContext>; days: number; impact?: AIImpactAnalysis;
}) {
  const [showContext, setShowContext] = useState(false);
  const { delta, isBlip, contextLabel, contextColor } = trend;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? "text-emerald-500" : delta < 0 ? "text-rose-500" : "text-muted-foreground";
  const deltaColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-500" : "text-muted-foreground";
  const trendLabel = delta > 0 ? "Improving" : delta < 0 ? "Declining" : "Stable";
  const trendLabelColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-muted-foreground";
  const sparkData = (industry.scoreHistory || []).slice(-days);

  return (
    <div className="group">
      <Link
        to={`/industries/${industry.slug}`}
        className="block rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors"
        onMouseEnter={() => setShowContext(true)}
        onMouseLeave={() => setShowContext(false)}
      >
        {/* Row 1: Name + Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <TrendIcon className={`h-3.5 w-3.5 ${trendColor} shrink-0`} />
            <span className="text-sm font-medium text-foreground truncate">{industry.name}</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {delta !== 0 && (
              <span className={`text-[10px] font-mono font-semibold ${deltaColor}`}>{delta > 0 ? "+" : ""}{delta}</span>
            )}
            {sparkData.length > 2 && (
              <div className="w-16 hidden sm:block">
                <Sparkline data={sparkData} healthScore={industry.healthScore} width={64} height={20} />
              </div>
            )}
            <span className="text-lg font-mono font-bold text-foreground w-8 text-right">{industry.healthScore}</span>
          </div>
        </div>

        {/* Row 2: Trend label + AI impact */}
        <div className="mt-1.5 flex items-center justify-between gap-2 ml-6">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium ${trendLabelColor}`}>{trendLabel}</span>
            {isBlip && (
              <span className="text-[9px] px-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 font-medium">blip</span>
            )}
          </div>
          {impact && <AIImpactBadge impact={impact} />}
        </div>
      </Link>

      {/* Hover context row */}
      {showContext && (
        <div className="mt-1 ml-8 flex items-center gap-2 px-1 animate-in fade-in duration-200">
          <Info className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className={`text-[10px] ${contextColor}`}>{contextLabel}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <VolatilityDots history={industry.scoreHistory || []} days={days} />
          {trend.longDelta !== 0 && days <= 30 && (
            <>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">
                90d: <span className={trend.longDelta > 0 ? "text-emerald-600" : "text-rose-500"}>{trend.longDelta > 0 ? "+" : ""}{trend.longDelta}</span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
