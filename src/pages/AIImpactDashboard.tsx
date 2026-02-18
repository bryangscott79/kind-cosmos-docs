import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Brain, Users, Zap, TrendingUp, TrendingDown, Minus, Lock, ArrowRight, ChevronDown, ChevronUp, Bot, User, Handshake, BarChart3, Sparkles, Loader2, RefreshCw, CheckCircle2, Search, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";
import { supabase } from "@/integrations/supabase/client";
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
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? industries.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : industries;

  return (
    <div className="space-y-2">
      {industries.length > 3 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter industries..."
            className="w-full rounded-md border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {filtered.map((ind) => (
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
        {filtered.length === 0 && (
          <span className="text-xs text-muted-foreground italic py-1">No industries match "{search}"</span>
        )}
      </div>
    </div>
  );
}

export default function AIImpactDashboard() {
  const { data, loading } = useIntelligence();
  const { tier, profile } = useAuth();
  const canViewFull = hasAccess(tier, "starter");

  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("");
  const [aiImpactData, setAiImpactData] = useState<AIImpactAnalysis[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0, industryName: "" });
  const abortRef = useRef(false);

  // Use data from context if available, otherwise use local state
  const effectiveAiImpact = useMemo(() => {
    if (aiImpactData.length > 0) return aiImpactData;
    if (data.aiImpact && data.aiImpact.length > 0) return data.aiImpact;
    return [];
  }, [aiImpactData, data.aiImpact]);

  // Detect which industries are missing from existing results
  const missingIndustries = useMemo(() => {
    if (data.industries.length === 0) return [];
    const existingIds = new Set(effectiveAiImpact.map((a) => a.industryId));
    return data.industries
      .map((i) => ({ id: i.id, name: i.name }))
      .filter((i) => !existingIds.has(i.id));
  }, [data.industries, effectiveAiImpact]);

  const generateAiImpact = useCallback(async (industriesToProcess?: { id: string; name: string }[]) => {
    const industries = industriesToProcess || data.industries.map((i) => ({ id: i.id, name: i.name }));
    if (industries.length === 0) return;

    abortRef.current = false;
    setGenerating(true);
    setGenError(null);
    // If doing a full refresh, clear; if resuming, keep existing
    if (!industriesToProcess) setAiImpactData([]);

    const total = industries.length;
    const results: AIImpactAnalysis[] = industriesToProcess ? [...effectiveAiImpact] : [];

    for (let idx = 0; idx < total; idx++) {
      if (abortRef.current) break;
      const ind = industries[idx];
      setGenProgress({ current: idx + 1, total, industryName: ind.name });

      try {
        const { data: result, error } = await supabase.functions.invoke("generate-ai-impact", {
          body: {
            industry: ind,
            profile: profile || {},
          },
        });

        if (abortRef.current) break;
        if (error) throw new Error(error.message);
        if (!result?.success) throw new Error(result?.error || `Failed for ${ind.name}`);

        // Add or replace in results array
        const existingIdx = results.findIndex((r) => r.industryId === result.data.industryId);
        if (existingIdx >= 0) {
          results[existingIdx] = result.data;
        } else {
          results.push(result.data);
        }
        setAiImpactData([...results]);
        if (!selectedIndustryId || idx === 0) setSelectedIndustryId(result.data.industryId);
      } catch (err: any) {
        console.error(`AI impact error for ${ind.name}:`, err);
      }
    }

    if (results.length === 0) {
      setGenError("Failed to generate AI impact analysis. Please try again.");
    }
    setGenerating(false);
  }, [data.industries, profile, effectiveAiImpact, selectedIndustryId]);

  // Cleanup: abort on unmount so we don't try to setState after unmount
  useEffect(() => {
    return () => { abortRef.current = true; };
  }, []);

  // Set default selection
  const effectiveSelected = selectedIndustryId || (effectiveAiImpact.length > 0 ? effectiveAiImpact[0].industryId : "");
  const selectedAnalysis = effectiveAiImpact.find((a) => a.industryId === effectiveSelected);

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
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">AI Impact Intelligence</h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              See where AI is creating opportunity and where humans remain essential across your target industries.
            </p>
          </div>
          {effectiveAiImpact.length > 0 && (
            <button
              onClick={() => generateAiImpact()}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </button>
          )}
        </div>

        {/* Industry selector */}
        {effectiveAiImpact.length > 0 && (
          <IndustrySelector
            industries={effectiveAiImpact.map((a) => ({ id: a.industryId, name: a.industryName }))}
            selectedId={effectiveSelected}
            onSelect={setSelectedIndustryId}
          />
        )}

        {/* Resume banner for missing industries */}
        {!generating && missingIndustries.length > 0 && effectiveAiImpact.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Play className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{missingIndustries.length}</span> {missingIndustries.length === 1 ? "industry" : "industries"} remaining
              </span>
            </div>
            <button
              onClick={() => generateAiImpact(missingIndustries)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-3 w-3" />
              Continue Analyzing
            </button>
          </div>
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

            {/* Show progress while generating more industries */}
            {generating && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-foreground">
                        Analyzing: {genProgress.industryName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {genProgress.current} of {genProgress.total}
                      </span>
                    </div>
                    <Progress value={(genProgress.current / Math.max(genProgress.total, 1)) * 100} className="h-1.5" />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty state — no AI impact data yet */
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            {generating ? (
              <div className="max-w-md mx-auto space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Generating AI Impact Analysis</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Analyzing {genProgress.total} {genProgress.total === 1 ? "industry" : "industries"} — results appear as each completes
                  </p>
                </div>

                {/* Progress bar */}
                <Progress value={(genProgress.current / Math.max(genProgress.total, 1)) * 100} className="h-2" />

                {/* Current industry indicator */}
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Industry {genProgress.current} of {genProgress.total}: <span className="font-medium text-foreground">{genProgress.industryName}</span>
                  </span>
                </div>

                {/* Completed industries */}
                {aiImpactData.length > 0 && (
                  <div className="space-y-2 text-left">
                    {aiImpactData.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-xs text-foreground">{a.industryName}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{a.automationRate}% automated</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Brain className="mx-auto h-10 w-10 text-primary/30" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {genError ? "Generation Failed" : "AI Impact Analysis Available"}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
                  {genError
                    ? genError
                    : "Click below to analyze how AI is transforming your target industries — where it's creating opportunity and where humans remain essential."}
                </p>
                <button
                  onClick={() => generateAiImpact()}
                  disabled={data.industries.length === 0}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {genError ? "Try Again" : "Generate AI Impact Analysis"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
