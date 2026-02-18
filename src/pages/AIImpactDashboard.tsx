import { useState, useMemo, useCallback } from "react";
import {
  Brain, Bot, User, Handshake, Sparkles, Loader2, RefreshCw,
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, BarChart3,
  TrendingUp, TrendingDown, Minus, Search, Columns2, X,
  Zap, Shield, DollarSign, Lightbulb
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";
import { supabase } from "@/integrations/supabase/client";
import type { AIZone, AIFunction, AIImpactAnalysis } from "@/data/mockData";

const ZONE_CONFIG: Record<AIZone, { label: string; color: string; bg: string; border: string; icon: typeof Bot; accent: string }> = {
  ai_led: { label: "AI-Led", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: Bot, accent: "from-rose-500 to-rose-600" },
  collaborative: { label: "Collaborative", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", icon: Handshake, accent: "from-violet-500 to-violet-600" },
  human_led: { label: "Human-Led", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", icon: User, accent: "from-sky-500 to-sky-600" },
};

const OPPORTUNITY_ICONS: Record<string, typeof Zap> = {
  cost_reduction: DollarSign, revenue_growth: TrendingUp, efficiency: Zap, new_capability: Lightbulb, risk_reduction: Shield,
};

type ViewState = "overview" | "detail" | "compare";

function AutomationGauge({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const radius = size === "sm" ? 28 : 36;
  const stroke = size === "sm" ? 5 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const dim = (radius + stroke) * 2;
  const color = value >= 70 ? "#e11d48" : value >= 40 ? "#7c3aed" : "#0284c7";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/20" />
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className={`absolute font-mono font-bold ${size === "sm" ? "text-xs" : "text-sm"}`} style={{ color }}>{value}%</span>
    </div>
  );
}

function ZonePill({ zone, count }: { zone: AIZone; count: number }) {
  const cfg = ZONE_CONFIG[zone];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
      <Icon className="h-2.5 w-2.5" />{cfg.label} ({count})
    </span>
  );
}

function IndustryCard({ analysis, onClick, onCompare, isCompareMode, isSelected }: {
  analysis: AIImpactAnalysis; onClick: () => void; onCompare: () => void; isCompareMode: boolean; isSelected: boolean;
}) {
  const totalFunctions = analysis.aiLedFunctions.length + analysis.humanLedFunctions.length + analysis.collaborativeFunctions.length;
  const dominantZone: AIZone =
    analysis.aiLedFunctions.length >= analysis.humanLedFunctions.length && analysis.aiLedFunctions.length >= analysis.collaborativeFunctions.length
      ? "ai_led" : analysis.collaborativeFunctions.length >= analysis.humanLedFunctions.length ? "collaborative" : "human_led";
  const topOpportunity = analysis.collaborativeFunctions[0];

  return (
    <div className={`group relative rounded-xl border bg-card p-4 hover:shadow-md transition-all cursor-pointer ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`} onClick={onClick}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{analysis.industryName}</h3>
          <div className="flex items-center gap-2 mt-1"><ZonePill zone={dominantZone} count={totalFunctions} /></div>
        </div>
        <AutomationGauge value={analysis.automationRate} size="sm" />
      </div>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary mb-3">
        {totalFunctions > 0 && (<>
          <div className="bg-rose-500 transition-all" style={{ width: `${(analysis.aiLedFunctions.length / totalFunctions) * 100}%` }} />
          <div className="bg-violet-500 transition-all" style={{ width: `${(analysis.collaborativeFunctions.length / totalFunctions) * 100}%` }} />
          <div className="bg-sky-500 transition-all" style={{ width: `${(analysis.humanLedFunctions.length / totalFunctions) * 100}%` }} />
        </>)}
      </div>
      {topOpportunity && (
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          <span className="font-medium text-violet-600">Top opportunity:</span> {topOpportunity.name} — {topOpportunity.description.split(".")[0]}.
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
        <div className="text-center"><p className="text-[10px] text-muted-foreground">Displacement</p><p className="text-xs font-mono font-bold text-rose-600">{analysis.jobDisplacementIndex}</p></div>
        <div className="text-center"><p className="text-[10px] text-muted-foreground">Opportunity</p><p className="text-xs font-mono font-bold text-violet-600">{analysis.collaborativeOpportunityIndex}</p></div>
        <div className="text-center"><p className="text-[10px] text-muted-foreground">Resilience</p><p className="text-xs font-mono font-bold text-sky-600">{analysis.humanResilienceScore}</p></div>
      </div>
      {isCompareMode && (
        <button onClick={(e) => { e.stopPropagation(); onCompare(); }}
          className="absolute top-2 right-2 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">+ Compare</button>
      )}
    </div>
  );
}

function FunctionRow({ fn }: { fn: AIFunction }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ZONE_CONFIG[fn.zone];
  const OpIcon = OPPORTUNITY_ICONS[fn.opportunityType] || Zap;
  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg}/30 transition-all`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${cfg.accent} text-white`}><OpIcon className="h-3.5 w-3.5" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{fn.name}</p>
          <p className="text-[10px] text-muted-foreground">{fn.automationLevel}% automated · {fn.timeline === "now" ? "Active now" : fn.timeline.replace("_", " ")}</p>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{fn.description}</p>
          <div className="flex flex-wrap gap-1">{fn.jobsAffected.map((job) => (<span key={job} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{job}</span>))}</div>
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>{fn.opportunityType.replace("_", " ")}</span>
        </div>
      )}
    </div>
  );
}

function DetailView({ analysis, onBack }: { analysis: AIImpactAnalysis; onBack: () => void }) {
  const [activeZone, setActiveZone] = useState<AIZone | "all">("all");
  const allFunctions = useMemo(() => [...analysis.aiLedFunctions, ...analysis.collaborativeFunctions, ...analysis.humanLedFunctions], [analysis]);
  const filteredFunctions = activeZone === "all" ? allFunctions : allFunctions.filter((f) => f.zone === activeZone);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"><ArrowLeft className="h-3.5 w-3.5" /> All Industries</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{analysis.industryName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{allFunctions.length} business functions analyzed · {analysis.automationRate}% overall automation</p>
          </div>
          <AutomationGauge value={analysis.automationRate} size="md" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Automation Rate", value: analysis.automationRate, color: "text-foreground", desc: "Overall AI penetration" },
          { label: "Job Displacement", value: analysis.jobDisplacementIndex, color: "text-rose-600", desc: "Roles at risk" },
          { label: "Collaborative Opportunity", value: analysis.collaborativeOpportunityIndex, color: "text-violet-600", desc: "AI+Human potential" },
          { label: "Human Resilience", value: analysis.humanResilienceScore, color: "text-sky-600", desc: "Human role stability" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-mono font-bold ${s.color} mt-1`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>
      {analysis.valueChain.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Value Chain</h3>
          <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
            {analysis.valueChain.map((stage, i) => {
              const cfg = ZONE_CONFIG[stage.zone];
              return (
                <div key={stage.id} className="flex items-stretch gap-1">
                  <div className={`flex-shrink-0 w-40 rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
                    <p className="text-xs font-semibold text-foreground leading-tight">{stage.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${cfg.accent}`} style={{ width: `${stage.automationLevel}%` }} /></div>
                      <span className="text-[10px] font-mono text-muted-foreground">{stage.automationLevel}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{stage.opportunity}</p>
                  </div>
                  {i < analysis.valueChain.length - 1 && (<div className="flex items-center px-0.5 text-muted-foreground/30"><ArrowRight className="h-3.5 w-3.5" /></div>)}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Business Functions</h3>
          <div className="flex gap-1">
            <button onClick={() => setActiveZone("all")} className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${activeZone === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>All ({allFunctions.length})</button>
            {(["ai_led", "collaborative", "human_led"] as AIZone[]).map((z) => {
              const cfg = ZONE_CONFIG[z];
              const count = z === "ai_led" ? analysis.aiLedFunctions.length : z === "collaborative" ? analysis.collaborativeFunctions.length : analysis.humanLedFunctions.length;
              return (<button key={z} onClick={() => setActiveZone(z)} className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${activeZone === z ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{cfg.label} ({count})</button>);
            })}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">{filteredFunctions.map((fn, i) => (<FunctionRow key={`${fn.zone}-${fn.name}-${i}`} fn={fn} />))}</div>
      </div>
      {analysis.kpis.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Key AI Impact Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {analysis.kpis.map((kpi, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{kpi.name}</p>
                  {kpi.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : kpi.trend === "down" ? <TrendingDown className="h-3 w-3 text-rose-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="text-lg font-mono font-bold text-foreground">{kpi.value}<span className="text-xs text-muted-foreground ml-0.5">{kpi.unit}</span></p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{kpi.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareView({ left, right, onBack, onSwap }: { left: AIImpactAnalysis; right: AIImpactAnalysis; onBack: () => void; onSwap: () => void }) {
  const metrics = [
    { key: "automationRate", label: "Automation Rate", desc: "Overall AI penetration" },
    { key: "jobDisplacementIndex", label: "Job Displacement", desc: "Roles at risk of replacement" },
    { key: "collaborativeOpportunityIndex", label: "Collaborative Opportunity", desc: "AI+Human augmentation potential" },
    { key: "humanResilienceScore", label: "Human Resilience", desc: "Stability of human-essential roles" },
  ] as const;
  const getBarWidth = (val: number, maxVal: number) => Math.max(8, (val / Math.max(maxVal, 1)) * 100);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"><ArrowLeft className="h-3.5 w-3.5" /> All Industries</button>
        <div className="flex items-center gap-3"><Columns2 className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold text-foreground">Industry Comparison</h2></div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <h3 className="text-sm font-semibold text-foreground">{left.industryName}</h3>
          <div className="mt-2"><AutomationGauge value={left.automationRate} size="sm" /></div>
        </div>
        <button onClick={onSwap} className="rounded-full border border-border p-2 hover:bg-accent transition-colors" title="Swap"><ArrowRight className="h-4 w-4 text-muted-foreground" /></button>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <h3 className="text-sm font-semibold text-foreground">{right.industryName}</h3>
          <div className="mt-2"><AutomationGauge value={right.automationRate} size="sm" /></div>
        </div>
      </div>
      <div className="space-y-4">
        {metrics.map(({ key, label, desc }) => {
          const lv = left[key]; const rv = right[key]; const maxVal = Math.max(lv, rv);
          return (
            <div key={key} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-foreground mb-0.5">{label}</p>
              <p className="text-[10px] text-muted-foreground mb-3">{desc}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-24 truncate">{left.industryName}</span>
                  <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full flex items-center justify-end pr-2 transition-all duration-500" style={{ width: `${getBarWidth(lv, maxVal)}%` }}>
                      <span className="text-[10px] font-mono font-bold text-primary-foreground">{lv}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-24 truncate">{right.industryName}</span>
                  <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500/80 to-violet-600 rounded-full flex items-center justify-end pr-2 transition-all duration-500" style={{ width: `${getBarWidth(rv, maxVal)}%` }}>
                      <span className="text-[10px] font-mono font-bold text-white">{rv}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Zone Distribution</p>
        <div className="grid grid-cols-2 gap-4">
          {[left, right].map((a) => {
            const total = a.aiLedFunctions.length + a.collaborativeFunctions.length + a.humanLedFunctions.length;
            return (
              <div key={a.industryId}>
                <p className="text-[11px] font-medium text-foreground mb-2 truncate">{a.industryName}</p>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary mb-2">
                  {total > 0 && (<>
                    <div className="bg-rose-500" style={{ width: `${(a.aiLedFunctions.length / total) * 100}%` }} />
                    <div className="bg-violet-500" style={{ width: `${(a.collaborativeFunctions.length / total) * 100}%` }} />
                    <div className="bg-sky-500" style={{ width: `${(a.humanLedFunctions.length / total) * 100}%` }} />
                  </>)}
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span><span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1" />AI-Led: {a.aiLedFunctions.length}</span>
                  <span><span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1" />Collab: {a.collaborativeFunctions.length}</span>
                  <span><span className="inline-block w-2 h-2 rounded-full bg-sky-500 mr-1" />Human: {a.humanLedFunctions.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((a) => (
          <div key={a.industryId}>
            <p className="text-[11px] font-semibold text-foreground mb-2 truncate">{a.industryName} — Top Functions</p>
            <div className="space-y-1.5">
              {[...a.collaborativeFunctions.slice(0, 2), ...a.aiLedFunctions.slice(0, 1), ...a.humanLedFunctions.slice(0, 1)].map((fn, i) => {
                const cfg = ZONE_CONFIG[fn.zone];
                return (<div key={i} className={`rounded-md border ${cfg.border} ${cfg.bg}/30 px-2.5 py-1.5`}>
                  <p className="text-[11px] font-medium text-foreground truncate">{fn.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fn.automationLevel}% · {cfg.label}</p>
                </div>);
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIImpactDashboard() {
  const { data } = useIntelligence();
  const { tier, profile } = useAuth();
  const canViewFull = hasAccess(tier, "starter");
  const [view, setView] = useState<ViewState>("overview");
  const [selectedId, setSelectedId] = useState<string>("");
  const [compareIds, setCompareIds] = useState<[string, string]>(["", ""]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [aiImpactData, setAiImpactData] = useState<AIImpactAnalysis[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const effectiveAiImpact = useMemo(() => {
    if (aiImpactData.length > 0) return aiImpactData;
    if (data.aiImpact && data.aiImpact.length > 0) return data.aiImpact;
    return [];
  }, [aiImpactData, data.aiImpact]);

  const filteredIndustries = useMemo(() => {
    if (!searchFilter) return effectiveAiImpact;
    return effectiveAiImpact.filter((a) => a.industryName.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [effectiveAiImpact, searchFilter]);

  const selectedAnalysis = effectiveAiImpact.find((a) => a.industryId === selectedId);
  const compareLeft = effectiveAiImpact.find((a) => a.industryId === compareIds[0]);
  const compareRight = effectiveAiImpact.find((a) => a.industryId === compareIds[1]);

  const generateAiImpact = useCallback(async () => {
    if (data.industries.length === 0) return;
    setGenerating(true); setGenError(null);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-ai-impact", {
        body: { industries: data.industries.map((i) => ({ id: i.id, name: i.name })), profile: profile || {} },
      });
      if (error) throw new Error(error.message);
      if (!result?.success) throw new Error(result?.error || "Failed to generate");
      setAiImpactData(result.data);
    } catch (err: any) {
      console.error("AI impact error:", err); setGenError(err.message || "Generation failed");
    } finally { setGenerating(false); }
  }, [data.industries, profile]);

  const handleIndustryClick = (id: string) => {
    if (isCompareMode) {
      if (!compareIds[0]) { setCompareIds([id, ""]); }
      else if (compareIds[0] !== id) { setCompareIds([compareIds[0], id]); setView("compare"); setIsCompareMode(false); }
      return;
    }
    setSelectedId(id); setView("detail");
  };

  const handleAddToCompare = (id: string) => {
    if (!compareIds[0]) { setCompareIds([id, ""]); }
    else if (compareIds[0] !== id) { setCompareIds([compareIds[0], id]); setView("compare"); setIsCompareMode(false); }
  };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="space-y-5">
          {view === "overview" && (<>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h1 className="text-lg font-bold text-foreground">AI Impact Intelligence</h1></div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {effectiveAiImpact.length > 0
                    ? `${effectiveAiImpact.length} industries analyzed. Select an industry to explore, or compare two side-by-side.`
                    : "Analyze how AI is transforming your target industries — where it creates opportunity and where humans remain essential."}
                </p>
              </div>
              {effectiveAiImpact.length > 0 && (
                <button onClick={generateAiImpact} disabled={generating}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50">
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Refresh
                </button>
              )}
            </div>

            {effectiveAiImpact.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-12 text-center">
                <Brain className="mx-auto h-12 w-12 text-primary/30 mb-4" />
                <h3 className="text-base font-semibold text-foreground">
                  {generating ? "Analyzing Your Industries..." : genError ? "Generation Failed" : "Ready to Analyze"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  {generating ? "Mapping AI impact across your industries. This takes 15-30 seconds..."
                    : genError ? genError
                    : `We'll analyze ${data.industries.length} industries to show where AI creates opportunity and where humans remain essential.`}
                </p>
                <button onClick={generateAiImpact} disabled={generating || data.industries.length === 0}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {genError ? "Try Again" : "Generate AI Impact Analysis"}
                </button>
              </div>
            )}

            {effectiveAiImpact.length > 0 && (<>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Filter industries..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <button onClick={() => { setIsCompareMode(!isCompareMode); if (isCompareMode) setCompareIds(["", ""]); }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${isCompareMode ? "bg-violet-100 text-violet-700 border border-violet-200" : "border border-border text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                  <Columns2 className="h-3.5 w-3.5" />{isCompareMode ? (compareIds[0] ? "Select second industry..." : "Select first industry...") : "Compare"}
                </button>
                {isCompareMode && compareIds[0] && (
                  <button onClick={() => { setIsCompareMode(false); setCompareIds(["", ""]); }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[10px] text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /> Cancel</button>
                )}
              </div>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> AI-Led (&gt;60%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Collaborative (20-60%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Human-Led (&lt;20%)</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredIndustries.map((analysis) => (
                  <IndustryCard key={analysis.industryId} analysis={analysis}
                    onClick={() => handleIndustryClick(analysis.industryId)}
                    onCompare={() => handleAddToCompare(analysis.industryId)}
                    isCompareMode={isCompareMode}
                    isSelected={isCompareMode && compareIds[0] === analysis.industryId} />
                ))}
              </div>
            </>)}
          </>)}

          {view === "detail" && selectedAnalysis && (<DetailView analysis={selectedAnalysis} onBack={() => setView("overview")} />)}
          {view === "compare" && compareLeft && compareRight && (
            <CompareView left={compareLeft} right={compareRight} onBack={() => { setView("overview"); setCompareIds(["", ""]); }} onSwap={() => setCompareIds([compareIds[1], compareIds[0]])} />
          )}
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
