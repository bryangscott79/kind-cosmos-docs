import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart3, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import type { Industry } from "@/data/mockData";

type Timeframe = "7d" | "30d" | "90d";

const timeframeConfig: Record<Timeframe, { label: string; days: number; description: string }> = {
  "7d": { label: "7D", days: 7, description: "Past week" },
  "30d": { label: "30D", days: 30, description: "Past month" },
  "90d": { label: "90D", days: 90, description: "Past quarter" },
};

function getTrendContext(
  industry: Industry,
  days: number
): {
  delta: number;
  shortDelta: number;
  longDelta: number;
  isBlip: boolean;
  contextLabel: string;
  contextColor: string;
} {
  const history = industry.scoreHistory || [];
  const len = history.length;

  // Current delta for the selected timeframe
  const startIdx = Math.max(0, len - days);
  const delta = len > 0 ? industry.healthScore - (history[startIdx]?.score ?? industry.healthScore) : 0;

  // Short-term delta (last 7 days)
  const shortStartIdx = Math.max(0, len - 7);
  const shortDelta = len > 0 ? industry.healthScore - (history[shortStartIdx]?.score ?? industry.healthScore) : 0;

  // Long-term delta (full history available)
  const longStartIdx = 0;
  const longDelta = len > 1 ? industry.healthScore - history[longStartIdx].score : 0;

  // Determine if this is a blip or sustained trend
  // A "blip" = short-term and long-term trends diverge
  const shortDirection = shortDelta > 2 ? "up" : shortDelta < -2 ? "down" : "flat";
  const longDirection = longDelta > 5 ? "up" : longDelta < -5 ? "down" : "flat";
  const isBlip = shortDirection !== longDirection && shortDirection !== "flat";

  let contextLabel = "";
  let contextColor = "text-muted-foreground";

  if (isBlip && shortDirection === "down" && longDirection === "up") {
    contextLabel = "Short-term dip in a longer uptrend";
    contextColor = "text-amber-600";
  } else if (isBlip && shortDirection === "up" && longDirection === "down") {
    contextLabel = "Short-term bounce in a longer downtrend";
    contextColor = "text-amber-600";
  } else if (longDirection === "up") {
    contextLabel = days <= 7 ? "Part of sustained growth trend" : "Consistent improvement over time";
    contextColor = "text-emerald-600";
  } else if (longDirection === "down") {
    contextLabel = days <= 7 ? "Part of longer decline" : "Extended downward trend";
    contextColor = "text-rose-600";
  } else {
    contextLabel = "Stable with minor fluctuations";
    contextColor = "text-muted-foreground";
  }

  return { delta, shortDelta, longDelta, isBlip, contextLabel, contextColor };
}

// Volatility indicator
function VolatilityDots({ history, days }: { history: { date: string; score: number }[]; days: number }) {
  const slice = history.slice(-days);
  if (slice.length < 3) return null;

  // Calculate standard deviation
  const avg = slice.reduce((s, h) => s + h.score, 0) / slice.length;
  const variance = slice.reduce((s, h) => s + Math.pow(h.score - avg, 2), 0) / slice.length;
  const stdDev = Math.sqrt(variance);

  // Low volatility = stable, high = choppy
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

interface IndustryHealthTimelineProps {
  industries: Industry[];
}

export default function IndustryHealthTimeline({ industries }: IndustryHealthTimelineProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");
  const days = timeframeConfig[timeframe].days;

  // Sort by absolute delta (biggest movers first), then split improving/declining
  const rankedIndustries = useMemo(() => {
    return [...industries]
      .map((ind) => ({
        ...ind,
        trend: getTrendContext(ind, days),
      }))
      .sort((a, b) => Math.abs(b.trend.delta) - Math.abs(a.trend.delta));
  }, [industries, days]);

  const improving = rankedIndustries.filter((i) => i.trend.delta > 0).slice(0, 4);
  const declining = rankedIndustries.filter((i) => i.trend.delta < 0).slice(0, 4);
  const stable = rankedIndustries.filter((i) => i.trend.delta === 0).slice(0, 2);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Industry Health</h2>
        </div>
        {/* Timeframe selector */}
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary/60 p-0.5">
          {(Object.keys(timeframeConfig) as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                timeframe === tf
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {timeframeConfig[tf].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {/* Improving */}
        {improving.map((ind) => (
          <IndustryHealthRow key={ind.id} industry={ind} trend={ind.trend} days={days} />
        ))}

        {/* Divider if both exist */}
        {improving.length > 0 && declining.length > 0 && (
          <div className="border-t border-border/50 my-1" />
        )}

        {/* Declining */}
        {declining.map((ind) => (
          <IndustryHealthRow key={ind.id} industry={ind} trend={ind.trend} days={days} />
        ))}

        {/* Stable (collapsed) */}
        {stable.length > 0 && (
          <>
            <div className="border-t border-border/50 my-1" />
            {stable.map((ind) => (
              <IndustryHealthRow key={ind.id} industry={ind} trend={ind.trend} days={days} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function IndustryHealthRow({
  industry,
  trend,
  days,
}: {
  industry: Industry;
  trend: ReturnType<typeof getTrendContext>;
  days: number;
}) {
  const [showContext, setShowContext] = useState(false);
  const { delta, isBlip, contextLabel, contextColor } = trend;

  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta > 0 ? "text-emerald-500" : delta < 0 ? "text-rose-500" : "text-muted-foreground";
  const deltaColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-500" : "text-muted-foreground";
  const trendLabel = delta > 0 ? "Improving" : delta < 0 ? "Declining" : "Stable";
  const trendLabelColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-muted-foreground";

  // Slice sparkline data to match timeframe
  const sparkData = (industry.scoreHistory || []).slice(-days);

  return (
    <div className="group">
      <Link
        to={`/industries/${industry.slug}`}
        className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors"
        onMouseEnter={() => setShowContext(true)}
        onMouseLeave={() => setShowContext(false)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <TrendIcon className={`h-3.5 w-3.5 ${trendColor} shrink-0`} />
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground truncate block">{industry.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium ${trendLabelColor}`}>{trendLabel}</span>
              {isBlip && (
                <span className="text-[9px] px-1 py-0 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 font-medium">
                  blip
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {delta !== 0 && (
            <span className={`text-[10px] font-mono font-semibold ${deltaColor}`}>
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
          {sparkData.length > 2 && (
            <div className="w-16 hidden sm:block">
              <Sparkline data={sparkData} healthScore={industry.healthScore} width={64} height={24} />
            </div>
          )}
          <span className="text-sm font-mono font-bold text-foreground w-7 text-right">{industry.healthScore}</span>
        </div>
      </Link>

      {/* Context tooltip on hover */}
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
                90d: <span className={trend.longDelta > 0 ? "text-emerald-600" : "text-rose-500"}>
                  {trend.longDelta > 0 ? "+" : ""}{trend.longDelta}
                </span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
