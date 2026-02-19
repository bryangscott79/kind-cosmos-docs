import { useMemo } from "react";
import { AlertTriangle, Flame, ShieldAlert, TrendingUp } from "lucide-react";
import CriticalAlertCard from "./CriticalAlertCard";
import type { Signal, Prospect, Industry } from "@/data/mockData";

// Urgency calculation: combines severity, count of signals, pipeline weight
interface AlertGroup {
  signal: Signal;
  affected: Prospect[];
  urgencyScore: number;
  urgencyLevel: "critical" | "high" | "moderate";
  pipelineWeight: number;
  signalDensity: number; // how many other signals hit the same prospects
}

// Pipeline stage weights (further along = more at stake)
const stageWeights: Record<string, number> = {
  researching: 1,
  contacted: 2,
  meeting_scheduled: 4,
  proposal_sent: 6,
  won: 3, // lower urgency — already closed
  lost: 0,
};

// Revenue proxy weights
function revenueWeight(rev: string): number {
  const num = parseFloat(rev.replace(/[^0-9.]/g, ""));
  if (num >= 1000) return 5; // $1B+
  if (num >= 500) return 4;
  if (num >= 100) return 3;
  if (num >= 50) return 2;
  return 1;
}

export function computeAlertGroups(
  signals: Signal[],
  prospects: Prospect[],
  industries: Industry[],
  targetIndustryIds?: string[]
): AlertGroup[] {
  // Count how many pipeline prospects are in each industry
  const industryPipelineCount: Record<string, number> = {};
  prospects.forEach((p) => {
    if (p.pipelineStage !== "researching" && p.pipelineStage !== "lost") {
      industryPipelineCount[p.industryId] = (industryPipelineCount[p.industryId] || 0) + 1;
    }
  });

  // Count signals per prospect
  const signalCountPerProspect: Record<string, number> = {};
  signals.forEach((s) => {
    prospects.forEach((p) => {
      if (p.relatedSignals?.includes(s.id)) {
        signalCountPerProspect[p.id] = (signalCountPerProspect[p.id] || 0) + 1;
      }
    });
  });

  // Only high-severity or negative signals
  const alertSignals = signals.filter(
    (s) => s.severity >= 4 || s.sentiment === "negative"
  );

  return alertSignals
    .map((signal) => {
      const affected = prospects.filter((p) =>
        p.relatedSignals?.includes(signal.id)
      );

      // Pipeline weight: sum of stage weights * revenue weight for affected prospects
      const pipelineWeight = affected.reduce(
        (sum, p) =>
          sum +
          (stageWeights[p.pipelineStage] || 0) * revenueWeight(p.annualRevenue),
        0
      );

      // Industry concentration bonus
      const industryConcentration = signal.industryTags.reduce(
        (sum, tag) => sum + (industryPipelineCount[tag] || 0),
        0
      );

      // Strategic industry bonus
      const strategicBonus = targetIndustryIds
        ? signal.industryTags.some((t) => targetIndustryIds.includes(t))
          ? 10
          : 0
        : 0;

      // Signal density: max signals hitting any one affected prospect
      const signalDensity = affected.reduce(
        (max, p) => Math.max(max, signalCountPerProspect[p.id] || 0),
        0
      );

      const urgencyScore =
        signal.severity * 3 +
        pipelineWeight * 2 +
        industryConcentration * 1.5 +
        strategicBonus +
        (signal.sentiment === "negative" ? 5 : 0);

      const urgencyLevel: "critical" | "high" | "moderate" =
        urgencyScore >= 30 ? "critical" : urgencyScore >= 15 ? "high" : "moderate";

      return {
        signal,
        affected,
        urgencyScore,
        urgencyLevel,
        pipelineWeight,
        signalDensity,
      };
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 5);
}

// Urgency badge component
function UrgencyBadge({ group }: { group: AlertGroup }) {
  const { urgencyLevel, affected, signalDensity } = group;

  if (urgencyLevel === "critical") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5">
          <Flame className="h-3 w-3 text-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Critical</span>
        </div>
        {affected.length > 0 && (
          <span className="text-[10px] text-rose-500 font-medium">
            {affected.length} prospect{affected.length !== 1 ? "s" : ""} at risk
          </span>
        )}
      </div>
    );
  }

  if (urgencyLevel === "high") {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5">
          <ShieldAlert className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">High</span>
        </div>
        {signalDensity > 1 && (
          <span className="text-[10px] text-amber-600 font-medium">
            {signalDensity} signals converging
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Monitor</span>
    </div>
  );
}

// Signal density dots — visual cue for volume vs intensity
function SignalHeatIndicator({ group }: { group: AlertGroup }) {
  const { signal, signalDensity } = group;
  const severity = signal.severity;

  // High severity, low density = one big pulse (like Apex with 1 urgent story)
  // Low severity, high density = many small dots (like GlobalFreight with 4 minor stories)
  if (severity >= 5 && signalDensity <= 1) {
    return (
      <div className="flex items-center gap-1" title={`Severity ${severity}/5 — single high-impact signal`}>
        <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
      </div>
    );
  }

  if (signalDensity >= 3) {
    return (
      <div className="flex items-center gap-0.5" title={`${signalDensity} signals affecting these prospects`}>
        {Array.from({ length: Math.min(signalDensity, 5) }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full ${
              severity >= 4
                ? "bg-amber-500"
                : "bg-muted-foreground/40"
            }`}
            style={{ width: 5, height: 5 }}
          />
        ))}
        {signalDensity > 5 && (
          <span className="text-[9px] text-muted-foreground ml-0.5">+{signalDensity - 5}</span>
        )}
      </div>
    );
  }

  // Default: severity dots
  return (
    <div className="flex items-center gap-0.5" title={`Severity ${severity}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < severity
              ? severity >= 4
                ? "bg-rose-500"
                : "bg-amber-500"
              : "bg-muted"
          }`}
        />
      ))}
    </div>
  );
}

interface EnhancedCriticalAlertsProps {
  signals: Signal[];
  prospects: Prospect[];
  industries: Industry[];
  targetIndustryIds?: string[];
  getIndustryName: (id: string) => string;
}

export default function EnhancedCriticalAlerts({
  signals,
  prospects,
  industries,
  targetIndustryIds,
  getIndustryName,
}: EnhancedCriticalAlertsProps) {
  const alertGroups = useMemo(
    () => computeAlertGroups(signals, prospects, industries, targetIndustryIds),
    [signals, prospects, industries, targetIndustryIds]
  );

  if (alertGroups.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-rose-500" />
        <h2 className="text-sm font-semibold text-foreground">Critical Alerts</h2>
        <span className="text-[10px] text-muted-foreground ml-auto">
          Weighted by pipeline exposure & strategic fit
        </span>
      </div>
      <div className="space-y-2">
        {alertGroups.map((group) => (
          <div key={group.signal.id} className="relative">
            {/* Urgency overlay */}
            <div className="flex items-center justify-between mb-1 px-1">
              <UrgencyBadge group={group} />
              <SignalHeatIndicator group={group} />
            </div>
            <div
              className={`rounded-lg transition-all ${
                group.urgencyLevel === "critical"
                  ? "ring-1 ring-rose-400/40 shadow-sm shadow-rose-500/10"
                  : group.urgencyLevel === "high"
                  ? "ring-1 ring-amber-400/30"
                  : ""
              }`}
            >
              <CriticalAlertCard
                signal={group.signal}
                affected={group.affected}
                getIndustryName={getIndustryName}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
