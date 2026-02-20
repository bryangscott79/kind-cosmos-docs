import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Brain, Bot, User, Handshake, Sparkles, Loader2, RefreshCw,
  Search, X, HelpCircle, Lock, CreditCard, ChevronUp, ChevronDown,
  Columns2, ArrowLeft
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";
import type { AIZone, AIImpactAnalysis } from "@/data/mockData";
import { DetailView, CompareView, ZONE_CONFIG, AutomationGauge } from "@/components/ai-impact/AIImpactViews";

type ViewState = "overview" | "detail" | "compare";

function HowToReadGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">How to read this page</span>
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-rose-50 border border-rose-200 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bot className="h-3.5 w-3.5 text-rose-600" />
                <p className="text-xs font-semibold text-rose-700">AI-Led Zone</p>
              </div>
              <p className="text-[11px] text-rose-600/80 leading-relaxed">Functions where AI handles &gt;60% of work. These represent <span className="font-semibold">cost reduction</span> opportunities — sell automation tools here, but also recognize these roles are most at risk of displacement.</p>
            </div>
            <div className="rounded-md bg-violet-50 border border-violet-200 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Handshake className="h-3.5 w-3.5 text-violet-600" />
                <p className="text-xs font-semibold text-violet-700">Collaborative Edge</p>
              </div>
              <p className="text-[11px] text-violet-600/80 leading-relaxed">The <span className="font-semibold">highest-value zone</span>. AI augments human capability (20-60%). This is where the best business opportunities exist — companies need tools that make their people more effective, not replace them.</p>
            </div>
            <div className="rounded-md bg-sky-50 border border-sky-200 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <User className="h-3.5 w-3.5 text-sky-600" />
                <p className="text-xs font-semibold text-sky-700">Human-Led Zone</p>
              </div>
              <p className="text-[11px] text-sky-600/80 leading-relaxed">Functions where humans remain essential (&lt;20% automation). Relationship-driven, judgment-intensive roles. These represent <span className="font-semibold">job security</span> — and areas where AI solutions should support, not supplant.</p>
            </div>
          </div>
          <div className="rounded-md bg-secondary p-3">
            <p className="text-xs font-semibold text-foreground mb-2">Key Metrics Explained</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold text-rose-600 w-20 shrink-0">Displacement</span>
                <p className="text-[11px] text-muted-foreground">How many roles in this industry are at risk of AI replacement. Higher = more disruption, more urgency to act.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold text-violet-600 w-20 shrink-0">Opportunity</span>
                <p className="text-[11px] text-muted-foreground">How much room exists for AI+human collaboration. Higher = bigger market for augmentation tools and services.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold text-sky-600 w-20 shrink-0">Resilience</span>
                <p className="text-[11px] text-muted-foreground">How stable human-essential roles are. Higher = more job security, but potentially harder to sell pure automation.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold text-foreground w-20 shrink-0">Automation %</span>
                <p className="text-[11px] text-muted-foreground">The overall percentage of industry functions that AI currently handles. The circular gauge on each card.</p>
              </div>
            </div>
          </div>
          <div className="rounded-md bg-secondary p-3">
            <p className="text-xs font-semibold text-foreground mb-1">How to use this</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Click any industry card to see the full breakdown — value chain, business functions, KPIs, and connected prospects and signals. Use <span className="font-medium text-foreground">Compare</span> to evaluate two industries side-by-side. Industries with high Opportunity scores and active signals are your best sales targets. The detail view shows which specific companies in that industry are potential customers and what market signals are driving urgency.
            </p>
          </div>
        </div>
      )}
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
    <div className={`group relative rounded-xl border bg-card p-4 hover:shadow-md transition-all cursor-pointer min-h-[200px] flex flex-col ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`} onClick={onClick}>
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
      <div className="flex-grow" />
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

export default function AIImpactDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data } = useIntelligence();
  const { tier } = useAuth();
  const canViewFull = hasAccess(tier, "starter");
  const [view, setView] = useState<ViewState>("overview");
  const [selectedId, setSelectedId] = useState<string>("");
  const [compareIds, setCompareIds] = useState<[string, string]>(["", ""]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Use context's AI impact data and generation (handles one-at-a-time edge function calls)
  const { aiImpactGen, generateAiImpact } = useIntelligence();
  const generating = aiImpactGen.generating;
  const genError = aiImpactGen.error;

  const effectiveAiImpact = useMemo(() => {
    if (data.aiImpact && data.aiImpact.length > 0) return data.aiImpact;
    return [];
  }, [data.aiImpact]);

  // Auto-open detail view when navigated with a slug
  useEffect(() => {
    if (slug && effectiveAiImpact.length > 0) {
      const match = effectiveAiImpact.find(
        (a) => a.industryId === slug || a.industryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
      );
      if (match) {
        setSelectedId(match.industryId);
        setView("detail");
      }
    }
  }, [slug, effectiveAiImpact]);

  const filteredIndustries = useMemo(() => {
    if (!searchFilter) return effectiveAiImpact;
    return effectiveAiImpact.filter((a) => a.industryName.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [effectiveAiImpact, searchFilter]);

  const selectedAnalysis = effectiveAiImpact.find((a) => a.industryId === selectedId);
  const compareLeft = effectiveAiImpact.find((a) => a.industryId === compareIds[0]);
  const compareRight = effectiveAiImpact.find((a) => a.industryId === compareIds[1]);

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
                <button onClick={() => generateAiImpact()} disabled={generating}
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
                  {generating
                    ? `Processing ${aiImpactGen.progress.current} of ${aiImpactGen.progress.total}: ${aiImpactGen.progress.industryName}...`
                    : genError ? genError
                    : `We'll analyze ${data.industries.length} industries to show where AI creates opportunity and where humans remain essential.`}
                </p>
                {generating && aiImpactGen.progress.total > 0 && (
                  <div className="mt-4 mx-auto max-w-xs">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(aiImpactGen.progress.current / aiImpactGen.progress.total) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{aiImpactGen.progress.current}/{aiImpactGen.progress.total} complete</p>
                  </div>
                )}
                <button onClick={() => generateAiImpact()} disabled={generating || data.industries.length === 0}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {genError ? "Try Again" : "Generate AI Impact Analysis"}
                </button>
              </div>
            )}

            {effectiveAiImpact.length > 0 && (<>
              <HowToReadGuide />
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

          {view === "detail" && selectedAnalysis && (
            canViewFull ? (
              <DetailView
                analysis={selectedAnalysis}
                onBack={() => slug ? navigate(-1) : setView("overview")}
                backLabel={slug ? "Back to Industry" : undefined}
                prospects={data.prospects}
                signals={data.signals}
                industries={data.industries}
              />
            ) : (
              <div className="space-y-4">
                <button onClick={() => slug ? navigate(-1) : setView("overview")} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-3.5 w-3.5" /> {slug ? "Back to Industry" : "All Industries"}</button>
                <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-12 text-center max-w-lg mx-auto">
                  <Lock className="mx-auto h-10 w-10 text-primary/30 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">Unlock Full AI Impact Analysis</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Detailed breakdowns, value chain analysis, business functions, connected prospects, and KPIs require a Starter plan.</p>
                  <Link to="/pricing" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    <CreditCard className="h-4 w-4" /> View Plans
                  </Link>
                </div>
              </div>
            )
          )}
          {view === "compare" && compareLeft && compareRight && (
            canViewFull ? (
              <CompareView left={compareLeft} right={compareRight} onBack={() => { setView("overview"); setCompareIds(["", ""]); }} onSwap={() => setCompareIds([compareIds[1], compareIds[0]])} />
            ) : (
              <div className="space-y-4">
                <button onClick={() => { setView("overview"); setCompareIds(["", ""]); }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-3.5 w-3.5" /> All Industries</button>
                <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/[0.02] p-12 text-center max-w-lg mx-auto">
                  <Lock className="mx-auto h-10 w-10 text-primary/30 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">Unlock Industry Comparison</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Side-by-side industry comparison with AI impact metrics requires a Starter plan.</p>
                  <Link to="/pricing" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    <CreditCard className="h-4 w-4" /> View Plans
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
