import { useState, useMemo } from "react";
import { Brain, Users, Zap, TrendingUp, TrendingDown, Minus, Lock, ArrowRight, ChevronDown, ChevronUp, Bot, User, Handshake, BarChart3, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";
import { Link } from "react-router-dom";
import type { AIZone, AIFunction, ValueChainNode, AIImpactAnalysis } from "@/data/mockData";
import { getZoneLabel, getZoneBgColor, getZoneColor } from "@/data/mockData";

// Zone icons
const zoneIcons: Record<AIZone, typeof Bot> = {
  ai_led: Bot,
  human_led: User,
  collaborative: Handshake,
};

const zoneDescriptions: Record<AIZone, string> = {
  ai_led: "Functions where AI handles >60% of tasks. High automation, cost reduction potential.",
  human_led: "Functions where humans remain essential (<20% automation). Relationship and judgment driven.",
  collaborative: "The highest-opportunity zone. AI augments human capability (20-60% automation).",
};

function ZoneSummaryBar({ analysis }: { analysis: AIImpactAnalysis }) {
  const total =
    analysis.aiLedFunctions.length +
    analysis.humanLedFunctions.length +
    analysis.collaborativeFunctions.length;
  if (total === 0) return null;

  const aiPct = Math.round((analysis.aiLedFunctions.length / total) * 100);
  const humanPct = Math.round((analysis.humanLedFunctions.length / total) * 100);
  const collabPct = 100 - aiPct - humanPct;

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="bg-red-500 transition-all duration-500"
        style={{ width: `${aiPct}%` }}
        title={`AI-Led: ${aiPct}%`}
      />
      <div
        className="bg-purple-500 transition-all duration-500"
        style={{ width: `${collabPct}%` }}
        title={`Collaborative: ${collabPct}%`}
      />
      <div
        className="bg-blue-500 transition-all duration-500"
        style={{ width: `${humanPct}%` }}
        title={`Human-Led: ${humanPct}%`}
      />
    </div>
  );
}

function FunctionCard({ fn }: { fn: AIFunction }) {
  const [expanded, setExpanded] = useState(false);
  const ZoneIcon = zoneIcons[fn.zone];
  const zoneColor = getZoneColor(fn.zone);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-accent/50 ${getZoneBgColor(fn.zone)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ZoneIcon className={`h-3.5 w-3.5 shrink-0 ${zoneColor}`} />
          <span className="text-xs font-semibold text-foreground truncate">{fn.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-medium text-muted-foreground">
            {fn.automationLevel}% automated
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{fn.description}</p>
          {fn.jobsAffected.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {fn.jobsAffected.map((job, i) => (
                <span
                  key={i}
                  className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {job}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="capitalize">{fn.opportunityType.replace("_", " ")}</span>
            <span>•</span>
            <span>{fn.timeline === "now" ? "Happening now" : fn.timeline === "6_months" ? "6 months" : fn.timeline === "1_year" ? "1 year" : "2+ years"}</span>
          </div>
        </div>
      )}
    </button>
  );
}

function KPICard({ kpi }: { kpi: { name: string; value: number; unit: string; trend: string; context: string } }) {
  const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const trendColor = kpi.trend === "up" ? "text-green-400" : kpi.trend === "down" ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.name}</span>
        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground">{kpi.value}</span>
        <span className="text-[10px] text-muted-foreground">{kpi.unit}</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">{kpi.context}</p>
    </div>
  );
}

function ValueChainMap({ nodes }: { nodes: ValueChainNode[] }) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <BarChart3 className="h-3.5 w-3.5 text-primary" />
        Value Chain Map
      </h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center">
            <div className={`rounded-md border p-2.5 min-w-[120px] ${getZoneBgColor(node.zone)}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {(() => { const Icon = zoneIcons[node.zone]; return <Icon className={`h-3 w-3 ${getZoneColor(node.zone)}`} />; })()}
                <span className="text-[10px] font-semibold text-foreground">{node.name}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    node.zone === "ai_led" ? "bg-red-500" : node.zone === "human_led" ? "bg-blue-500" : "bg-purple-500"
                  }`}
                  style={{ width: `${node.automationLevel}%` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground mt-0.5 block">{node.automationLevel}% AI</span>
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IndustrySelector({
  industries,
  selectedId,
  onSelect,
}: {
  industries: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {industries.map((ind) => (
        <button
          key={ind.id}
          onClick={() => onSelect(ind.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedId === ind.id
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          }`}
        >
          {ind.name}
        </button>
      ))}
    </div>
  );
}

export default function AIImpactDashboard() {
  const { data, loading } = useIntelligence();
  const { tier } = useAuth();
  const canViewFull = hasAccess(tier, "starter");

  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("");

  // Build AI impact data from intelligence context
  const aiImpactData = useMemo(() => {
    if (data.aiImpact && data.aiImpact.length > 0) {
      return data.aiImpact;
    }
    // Generate placeholder analysis from existing industry data if no AI impact data yet
    return data.industries.map((ind) => ({
      industryId: ind.id,
      industryName: ind.name,
      aiLedFunctions: [] as AIFunction[],
      humanLedFunctions: [] as AIFunction[],
      collaborativeFunctions: [] as AIFunction[],
      automationRate: 0,
      jobDisplacementIndex: 0,
      humanResilienceScore: 0,
      collaborativeOpportunityIndex: 0,
      valueChain: [] as ValueChainNode[],
      kpis: [],
      entityOverlays: {} as any,
      generatedAt: new Date().toISOString(),
    }));
  }, [data]);

  // Set default selection
  const effectiveSelected = selectedIndustryId || (aiImpactData.length > 0 ? aiImpactData[0].industryId : "");
  const selectedAnalysis = aiImpactData.find((a) => a.industryId === effectiveSelected);

  const hasRealData = selectedAnalysis && (
    selectedAnalysis.aiLedFunctions.length > 0 ||
    selectedAnalysis.humanLedFunctions.length > 0 ||
    selectedAnalysis.collaborativeFunctions.length > 0
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Brain className="mx-auto h-8 w-8 text-primary animate-pulse" />
            <p className="mt-2 text-sm text-muted-foreground">Loading AI Impact Intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">AI Impact Intelligence</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            See where AI is creating opportunity and where humans remain essential across your target industries.
          </p>
        </div>

        {/* Industry selector */}
        {aiImpactData.length > 0 && (
          <IndustrySelector
            industries={aiImpactData.map((a) => ({ id: a.industryId, name: a.industryName }))}
            selectedId={effectiveSelected}
            onSelect={setSelectedIndustryId}
          />
        )}

        {/* Zone Legend */}
        <div className="grid grid-cols-3 gap-3">
          {(["ai_led", "collaborative", "human_led"] as AIZone[]).map((zone) => {
            const Icon = zoneIcons[zone];
            return (
              <div key={zone} className={`rounded-md border p-3 ${getZoneBgColor(zone)}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${getZoneColor(zone)}`} />
                  <span className="text-xs font-semibold text-foreground">{getZoneLabel(zone)}</span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
                  {zoneDescriptions[zone]}
                </p>
              </div>
            );
          })}
        </div>

        {selectedAnalysis && hasRealData ? (
          <>
            {/* Zone Summary Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">AI Automation Distribution — {selectedAnalysis.industryName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {selectedAnalysis.automationRate}% overall automation
                </span>
              </div>
              <ZoneSummaryBar analysis={selectedAnalysis} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> AI-Led</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Collaborative</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Human-Led</span>
              </div>
            </div>

            {/* Value Chain Map */}
            {selectedAnalysis.valueChain.length > 0 && (
              <ValueChainMap nodes={selectedAnalysis.valueChain} />
            )}

            {/* Three Zone Columns */}
            {canViewFull ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["ai_led", "collaborative", "human_led"] as AIZone[]).map((zone) => {
                  const functions =
                    zone === "ai_led"
                      ? selectedAnalysis.aiLedFunctions
                      : zone === "human_led"
                      ? selectedAnalysis.humanLedFunctions
                      : selectedAnalysis.collaborativeFunctions;
                  const Icon = zoneIcons[zone];

                  return (
                    <div key={zone} className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${getZoneColor(zone)}`} />
                        <span className="text-xs font-semibold text-foreground">
                          {getZoneLabel(zone)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({functions.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {functions.map((fn, i) => (
                          <FunctionCard key={i} fn={fn} />
                        ))}
                        {functions.length === 0 && (
                          <p className="text-[10px] text-muted-foreground italic py-4 text-center">
                            No functions in this zone yet
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                <Lock className="mx-auto h-8 w-8 text-primary/40" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">Upgrade to see full AI Impact breakdown</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Get detailed function-level AI impact analysis for every industry.
                </p>
                <Link
                  to="/pricing"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  View Plans <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* KPIs */}
            {selectedAnalysis.kpis && selectedAnalysis.kpis.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Key AI Impact Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedAnalysis.kpis.map((kpi, i) => (
                    <KPICard key={i} kpi={kpi} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty state — no AI impact data yet */
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <Brain className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">AI Impact data generating...</h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
              We're analyzing AI's impact across your target industries. This data populates when your intelligence refreshes.
              You can also visit your <Link to="/industries" className="text-primary underline underline-offset-2">Industry Dashboard</Link> to trigger a refresh.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
