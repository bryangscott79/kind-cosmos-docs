import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BarChart3, Columns2,
  TrendingUp, TrendingDown, Minus, Sparkles,
  Zap, Shield, Users, Target, Radio, Share2,
  Bot, Handshake, User
} from "lucide-react";
import type { AIZone, AIFunction, AIImpactAnalysis, Signal, Prospect, Industry } from "@/data/mockData";
import ShareableAIReport from "@/components/ShareableAIReport";

// ─── Shared config ───────────────────────────────
export const ZONE_CONFIG: Record<AIZone, { label: string; color: string; bg: string; border: string; icon: typeof Bot; accent: string }> = {
  ai_led: { label: "AI-Led", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: Bot, accent: "from-rose-500 to-rose-600" },
  collaborative: { label: "Collaborative", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", icon: Handshake, accent: "from-violet-500 to-violet-600" },
  human_led: { label: "Human-Led", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", icon: User, accent: "from-sky-500 to-sky-600" },
};

export const signalTypeColors: Record<string, string> = {
  political: "bg-purple-100 text-purple-700", regulatory: "bg-blue-100 text-blue-700",
  economic: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", hiring: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  tech: "bg-cyan-100 text-cyan-700", supply_chain: "bg-rose-100 text-rose-700",
  social: "bg-pink-100 text-pink-700", competitive: "bg-slate-100 text-slate-700",
  environmental: "bg-lime-100 text-lime-700",
};

export function AutomationGauge({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const r = size === "sm" ? 24 : 32;
  const stroke = size === "sm" ? 4 : 5;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = value >= 70 ? "text-rose-500" : value >= 40 ? "text-amber-500" : "text-emerald-500";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={(r + stroke) * 2} height={(r + stroke) * 2} className="-rotate-90">
        <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" className="stroke-secondary" strokeWidth={stroke} />
        <circle cx={r + stroke} cy={r + stroke} r={r} fill="none" className={`stroke-current ${color}`}
          strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className={`absolute text-xs font-mono font-bold ${color}`}>{value}%</span>
    </div>
  );
}

export function FunctionRow({ fn }: { fn: AIFunction }) {
  const cfg = ZONE_CONFIG[fn.zone];
  const Icon = cfg.accent.includes("rose") ? Zap : cfg.accent.includes("violet") ? Users : Shield;
  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg}/30 p-3 transition-colors hover:shadow-sm`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`h-3.5 w-3.5 ${cfg.color} shrink-0`} />
          <p className="text-xs font-semibold text-foreground truncate">{fn.name}</p>
        </div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border} shrink-0`}>{cfg.label}</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${cfg.accent}`} style={{ width: `${fn.automationLevel}%` }} />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{fn.automationLevel}%</span>
      </div>
      {fn.description && <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{fn.description}</p>}
    </div>
  );
}

// ─── Detail View ─────────────────────────────────
export function DetailView({ analysis, onBack, prospects, signals, industries }: {
  analysis: AIImpactAnalysis; onBack: () => void;
  prospects: Prospect[]; signals: Signal[]; industries: Industry[];
}) {
  const navigate = useNavigate();
  const [activeZone, setActiveZone] = useState<AIZone | "all">("all");
  const [showShare, setShowShare] = useState(false);
  const allFunctions = useMemo(() => [...analysis.aiLedFunctions, ...analysis.collaborativeFunctions, ...analysis.humanLedFunctions], [analysis]);
  const filteredFunctions = activeZone === "all" ? allFunctions : allFunctions.filter((f) => f.zone === activeZone);

  const matchedIndustry = industries.find(
    (i) => i.id === analysis.industryId || i.name.toLowerCase() === analysis.industryName.toLowerCase()
  );
  const connectedProspects = useMemo(() => {
    if (!matchedIndustry) return [];
    return prospects.filter((p) => p.industryId === matchedIndustry.id).sort((a, b) => b.vigylScore - a.vigylScore).slice(0, 6);
  }, [prospects, matchedIndustry]);
  const connectedSignals = useMemo(() => {
    if (!matchedIndustry) return [];
    return signals.filter((s) => s.industryTags.includes(matchedIndustry.id)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5);
  }, [signals, matchedIndustry]);

  const actionableInsights = useMemo(() => {
    const insights: { icon: typeof Target; color: string; title: string; description: string }[] = [];
    if (analysis.collaborativeOpportunityIndex >= 70) {
      insights.push({ icon: Target, color: "text-violet-600", title: "High Augmentation Demand", description: `This industry scores ${analysis.collaborativeOpportunityIndex}/100 on collaborative opportunity. Companies here want AI that makes their teams better — not replacement. Lead with augmentation messaging.` });
    }
    if (analysis.jobDisplacementIndex >= 50) {
      insights.push({ icon: Zap, color: "text-rose-600", title: "Disruption Creates Urgency", description: `With a displacement index of ${analysis.jobDisplacementIndex}/100, companies are feeling pressure to adapt. Decision-makers are more receptive to solutions that future-proof their workforce.` });
    }
    if (analysis.humanResilienceScore >= 70) {
      insights.push({ icon: Shield, color: "text-sky-600", title: "Human Roles Are Stable", description: `High resilience (${analysis.humanResilienceScore}/100) means pure automation sells are harder here. Position solutions around augmenting existing human expertise, not replacing it.` });
    }
    if (connectedProspects.filter(p => p.vigylScore >= 80).length >= 2) {
      insights.push({ icon: Users, color: "text-emerald-600", title: `${connectedProspects.filter(p => p.vigylScore >= 80).length} Hot Prospects Ready`, description: `Multiple high-scoring prospects in this industry are showing buying signals. The AI impact data gives you a framework for positioning your solution.` });
    }
    return insights;
  }, [analysis, connectedProspects]);

  return (
    <div className="space-y-6">
      {showShare && <ShareableAIReport analysis={analysis} onClose={() => setShowShare(false)} />}
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"><ArrowLeft className="h-3.5 w-3.5" /> All Industries</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{analysis.industryName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{allFunctions.length} business functions analyzed · {analysis.automationRate}% overall automation</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowShare(true)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Share2 className="h-3 w-3" /> Share</button>
            <AutomationGauge value={analysis.automationRate} size="md" />
          </div>
        </div>
      </div>

      {actionableInsights.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-4">
          <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> What This Means For You</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {actionableInsights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div key={i} className="rounded-md bg-card border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1"><Icon className={`h-3.5 w-3.5 ${insight.color}`} /><p className="text-[11px] font-semibold text-foreground">{insight.title}</p></div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      {(connectedProspects.length > 0 || connectedSignals.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {connectedProspects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Prospects in {analysis.industryName}</h3></div>
                <Link to="/prospects" className="text-[10px] font-medium text-primary hover:text-primary/80 flex items-center gap-0.5">View all <ArrowRight className="h-2.5 w-2.5" /></Link>
              </div>
              <div className="space-y-2">
                {connectedProspects.map((p) => (
                  <div key={p.id} onClick={() => navigate("/prospects")} className="rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{p.companyName}</span>
                      <span className="text-xs font-mono font-bold text-primary">{p.vigylScore}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{p.whyNow.split(".")[0]}.</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.pressureResponse === "growth_mode" ? "bg-green-100 text-green-700" : p.pressureResponse === "contracting" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{p.pressureResponse.replace("_", " ")}</span>
                      {p.annualRevenue && <span className="text-[10px] text-muted-foreground">{p.annualRevenue}</span>}
                      {p.employeeCount && <span className="text-[10px] text-muted-foreground">· {p.employeeCount.toLocaleString()} emp</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {connectedSignals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Active Signals</h3></div>
                <Link to="/signals" className="text-[10px] font-medium text-primary hover:text-primary/80 flex items-center gap-0.5">View all <ArrowRight className="h-2.5 w-2.5" /></Link>
              </div>
              <div className="space-y-2">
                {connectedSignals.map((s) => (
                  <div key={s.id} onClick={() => navigate("/signals")} className="rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${signalTypeColors[s.signalType] || ""}`}>{s.signalType.replace("_", " ")}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(s.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{s.salesImplication}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

// ─── Compare View ────────────────────────────────
export function CompareView({ left, right, onBack, onSwap }: { left: AIImpactAnalysis; right: AIImpactAnalysis; onBack: () => void; onSwap: () => void }) {
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
