import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Building2, Globe2, Star, Loader2, ChevronLeft, ChevronRight, Sparkles, Navigation, RefreshCw, Download, CheckSquare, Square, ArrowRight, CheckCircle2, Plus, Layers } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProspectCard from "@/components/ProspectCard";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { Prospect, PressureResponse, ProspectScope } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { track, EVENTS } from "@/lib/analytics";
import { Slider } from "@/components/ui/slider";
import { useExpandedProspects } from "@/hooks/useExpandedProspects";
import { INDUSTRY_TAXONOMY, getUntappedVerticals, searchVerticals, type IndustryVertical } from "@/data/industryTaxonomy";

type SortBy = "score" | "name" | "revenue" | "employees";

const PROSPECTS_PER_PAGE = 9;

// Neighboring states by state code for "local" radius expansion
const NEIGHBORING_STATES: Record<string, string[]> = {
  GA: ["AL", "FL", "SC", "NC", "TN"],
  FL: ["GA", "AL"],
  AL: ["GA", "FL", "TN", "MS"],
  SC: ["GA", "NC"],
  NC: ["GA", "SC", "TN", "VA"],
  TN: ["GA", "AL", "NC", "VA", "KY", "MS", "AR", "MO"],
  CA: ["OR", "NV", "AZ"],
  TX: ["NM", "OK", "AR", "LA"],
  NY: ["NJ", "CT", "PA", "MA", "VT"],
  IL: ["WI", "IN", "MO", "IA", "KY"],
  WA: ["OR", "ID"],
  CO: ["WY", "NE", "KS", "NM", "UT"],
  VA: ["NC", "TN", "KY", "WV", "MD", "DC"],
  PA: ["NY", "NJ", "DE", "MD", "OH", "WV"],
  OH: ["PA", "WV", "KY", "IN", "MI"],
};

// US state name → abbreviation map
const STATE_ABBREV: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

function normalizeState(raw: string): string {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if (upper.length === 2) return upper;
  return STATE_ABBREV[trimmed.toLowerCase()] || upper;
}

function inferScope(prospect: Prospect, userState: string, userCountry: string, localRadius: number): ProspectScope {
  // ALWAYS compute scope from geography — don't trust AI assignment
  // because the user's radius setting changes what counts as "local"
  const pCountry = (prospect.location?.country || "").trim();
  const pState = normalizeState(prospect.location?.state || "");
  const uState = normalizeState(userState);
  
  const isUserUS = !userCountry || userCountry === "US" || userCountry === "United States";
  const isProspectUS = !pCountry || pCountry === "US" || pCountry === "United States";
  
  if (!isProspectUS && isUserUS) return "international";
  if (isProspectUS && isUserUS) {
    if (pState === uState) return "local";
    if (localRadius >= 100) {
      const neighbors = NEIGHBORING_STATES[uState] || [];
      if (neighbors.includes(pState)) return "local";
    }
    return "national";
  }
  if (pCountry === userCountry) {
    if (pState === uState) return "local";
    return "national";
  }
  return "international";
}

// Animated loading steps for company analysis
function DreamLoadingSteps({ company }: { company: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    { label: `Researching ${company}...`, desc: "Gathering company data, structure, and recent news" },
    { label: "Analyzing divisions & departments", desc: "Identifying business units and decision-making centers" },
    { label: "Evaluating market position", desc: "Assessing competitive landscape and growth signals" },
    { label: "Finding opportunities for you", desc: "Matching your services to their needs and pain points" },
    { label: "Building prospect profiles", desc: "Creating actionable dossiers with key contacts" },
  ];

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setStep(i), i === 0 ? 500 : i * 2800 + 500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div
          key={i}
          className={`flex items-center gap-2.5 transition-all duration-500 ${i <= step ? "opacity-100" : "opacity-0 translate-y-1"}`}
        >
          {i < step ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : i === step ? (
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
          ) : (
            <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
          )}
          <div>
            <p className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
            {i === step && <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProspectSection({
  title,
  icon,
  prospects,
  emptyMessage,
  emptyAction,
  selectedIds,
  onToggleSelect,
  loadMoreAction,
}: {
  title: string;
  icon: React.ReactNode;
  prospects: Prospect[];
  emptyMessage: string;
  emptyAction?: React.ReactNode;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  loadMoreAction?: React.ReactNode;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(prospects.length / PROSPECTS_PER_PAGE);
  const paged = prospects.slice(page * PROSPECTS_PER_PAGE, (page + 1) * PROSPECTS_PER_PAGE);

  if (prospects.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground">(0)</span>
        </div>
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          {emptyAction && <div className="mt-3">{emptyAction}</div>}
          {loadMoreAction && <div className="mt-3">{loadMoreAction}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground">({prospects.length})</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paged.map((prospect) => (
          <div key={prospect.id} className="relative">
            {onToggleSelect && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect(prospect.id); }}
                className="absolute top-2 left-2 z-10 rounded-md p-1 bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors"
              >
                {selectedIds?.has(prospect.id)
                  ? <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  : <Square className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </button>
            )}
            <ProspectCard prospect={prospect} />
          </div>
        ))}
      </div>
      {loadMoreAction && (
        <div className="mt-4 flex justify-center">{loadMoreAction}</div>
      )}
    </div>
  );
}

export default function Prospects() {
  const [searchParams] = useSearchParams();
  const industryParam = searchParams.get("industry") || "all";
  const { data, refresh } = useIntelligence();
  const { prospects, industries } = data;
  const { profile, persona } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [pressureFilter, setPressureFilter] = useState<PressureResponse | "all">("all");
  const [industryFilter, setIndustryFilter] = useState(industryParam);
  const [locationFilter, setLocationFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<ProspectScope | "all">("all");
  const [localRadius, setLocalRadius] = useState(100);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const refreshCTA = (
    <button
      onClick={handleRefresh}
      disabled={refreshing}
      className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
    >
      {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      {refreshing ? "Generating..." : "Refresh Intelligence Data"}
    </button>
  );

  // Dream client state
  const [dreamInput, setDreamInput] = useState("");
  const [dreamLoading, setDreamLoading] = useState(false);
  const [dreamProspects, setDreamProspects] = useState<Prospect[]>([]);
  const [dreamOverview, setDreamOverview] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // selectAll and exportSelected moved below `filtered` declaration

  const userState = (profile?.location_state || "").trim();
  const userCity = (profile?.location_city || "").trim();
  const userCountry = (profile?.location_country || "US").trim();

  // Enrich prospects with inferred scope
  const enrichedCoreProspects = useMemo(() => {
    const result = prospects.map(p => ({
      ...p,
      scope: inferScope(p, userState, userCountry, localRadius),
    }));
    const counts = { local: 0, national: 0, international: 0 };
    result.forEach(p => { if (p.scope in counts) counts[p.scope as keyof typeof counts]++; });
    if (result.length > 0) {
      console.log(`[Prospects] Scope distribution: local=${counts.local}, national=${counts.national}, international=${counts.international} | userState="${userState}" radius=${localRadius}`);
    }
    return result;
  }, [prospects, userState, userCountry, localRadius]);

  // Expanded prospects system
  const {
    allProspects: mergedWithExpanded,
    expanding,
    expandVertical,
    exploredVerticals,
    scopeCounts,
  } = useExpandedProspects(enrichedCoreProspects);

  // Use merged list (core + expanded) for all filtering
  const enrichedProspects = mergedWithExpanded;

  const states = useMemo(() => [...new Set(enrichedProspects.map(p => p.location.state))].sort(), [enrichedProspects]);
  const industriesWithProspects = useMemo(() => {
    const ids = [...new Set(enrichedProspects.map(p => p.industryId))];
    return industries.filter(i => ids.includes(i.id));
  }, [enrichedProspects, industries]);

  const parseRevenue = (rev: string): number => {
    const num = parseFloat(rev.replace(/[^0-9.]/g, ""));
    if (rev.includes("B")) return num * 1000;
    return num;
  };

  const filtered = useMemo(() => {
    let result = enrichedProspects
      .filter(p => p.companyName.toLowerCase().includes(search.toLowerCase()))
      .filter(p => pressureFilter === "all" || p.pressureResponse === pressureFilter)
      .filter(p => industryFilter === "all" || p.industryId === industryFilter)
      .filter(p => locationFilter === "all" || p.location.state === locationFilter)
      .filter(p => scopeFilter === "all" || p.scope === scopeFilter);

    if (sortBy === "score") result.sort((a, b) => b.vigylScore - a.vigylScore);
    else if (sortBy === "name") result.sort((a, b) => a.companyName.localeCompare(b.companyName));
    else if (sortBy === "revenue") result.sort((a, b) => parseRevenue(b.annualRevenue) - parseRevenue(a.annualRevenue));
    else if (sortBy === "employees") result.sort((a, b) => b.employeeCount - a.employeeCount);

    return result;
  }, [search, sortBy, pressureFilter, industryFilter, locationFilter, scopeFilter, enrichedProspects]);

  const selectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  }, [filtered, selectedIds.size]);

  const exportSelected = useCallback(() => {
    const selected = filtered.filter(p => selectedIds.has(p.id));
    if (selected.length === 0) return;
    const headers = ["Company", "Industry", "Location", "Revenue", "Employees", "Score", "Why Now"];
    const rows = selected.map(p => {
      const ind = industries.find(i => i.id === p.industryId);
      return [
        `"${p.companyName}"`, `"${ind?.name || ""}"`,
        `"${p.location.city}, ${p.location.state}"`,
        `"${p.annualRevenue}"`, p.employeeCount, p.vigylScore,
        `"${p.whyNow.replace(/"/g, '""')}"`,
      ];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vigyl-selected-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${selected.length} prospects exported.` });
    track(EVENTS.SIGNALS_EXPORTED, { type: "bulk_prospects", count: selected.length });
  }, [filtered, selectedIds, industries, toast]);

  // Group by scope
  const localProspects = useMemo(() => filtered.filter(p => p.scope === "local"), [filtered]);
  const nationalProspects = useMemo(() => filtered.filter(p => p.scope === "national"), [filtered]);
  const internationalProspects = useMemo(() => filtered.filter(p => p.scope === "international"), [filtered]);

  const activeIndustry = industries.find(i => i.id === industryFilter);

  const exportCSV = () => {
    const headers = ["Company", "Industry", "Location", "Revenue", "Employees", `${persona.scoreLabel}`, "Pressure Response", persona.whyNowLabel, "Decision Makers", "Scope"];
    const rows = filtered.map(p => {
      const ind = industries.find(i => i.id === p.industryId);
      return [
        p.companyName,
        ind?.name || "",
        `${p.location.city}, ${p.location.state}`,
        p.annualRevenue,
        p.employeeCount,
        p.vigylScore,
        p.pressureResponse.replace("_", " "),
        `"${p.whyNow.replace(/"/g, '""')}"`,
        p.decisionMakers.map(d => `${d.name} (${d.title})`).join("; "),
        p.scope || "",
      ];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vigyl-${persona.prospectLabel.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} records exported to CSV.` });
    track(EVENTS.SIGNALS_EXPORTED, { type: "prospects", count: filtered.length });
  };

  const analyzeDreamClient = async () => {
    if (!dreamInput.trim() || !profile) return;
    setDreamLoading(true);
    setDreamOverview(null);
    setDreamProspects([]);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-dream-client", {
        body: { companyName: dreamInput.trim(), profile },
      });
      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || "Analysis failed");
      setDreamOverview(result.data.companyOverview);
      setDreamProspects(result.data.prospects);
      toast({ title: "✨ Dream Client Analyzed", description: `Found ${result.data.prospects.length} opportunities within ${dreamInput}` });
      track(EVENTS.DREAM_CLIENT_ANALYZED, { company: dreamInput, opportunities: result.data.prospects.length });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setDreamLoading(false);
    }
  };

  // ── Discover Industries state ──
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [discoverExpanded, setDiscoverExpanded] = useState(false);

  const untappedVerticals = useMemo(() => {
    const tracked = [
      ...(profile?.target_industries || []),
      ...industries.map(i => i.name),
    ];
    return getUntappedVerticals(tracked);
  }, [profile?.target_industries, industries]);

  const discoverResults = useMemo(() => {
    if (discoverSearch.trim()) return searchVerticals(discoverSearch);
    return untappedVerticals.slice(0, discoverExpanded ? 60 : 12);
  }, [discoverSearch, untappedVerticals, discoverExpanded]);

  // Load More button factory for each scope
  const makeLoadMoreButton = (scope: "local" | "national" | "international") => {
    const scopeLabels = { local: "Local", national: "National", international: "International" };
    return (
      <button
        onClick={() => {
          // Pick a random untapped vertical to expand, or use a tracked one
          const trackedIndustries = profile?.target_industries || [];
          const randomIndustry = trackedIndustries.length > 0
            ? trackedIndustries[Math.floor(Math.random() * trackedIndustries.length)]
            : "Technology & SaaS";
          
          // Find matching vertical from taxonomy
          const match = searchVerticals(randomIndustry)[0];
          const sector = match
            ? INDUSTRY_TAXONOMY.find(s => s.verticals.some(v => v.id === match.id))
            : INDUSTRY_TAXONOMY[0];
          
          expandVertical({
            verticalId: match?.id || randomIndustry.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            verticalName: match?.name || randomIndustry,
            sectorName: sector?.name || "General",
            scope,
            exampleCompanies: match?.exampleCompanies,
          });
        }}
        disabled={!!expanding}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-5 py-3 text-sm font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors disabled:opacity-50"
      >
        {expanding === scope ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {expanding ? "Generating..." : `Load More ${scopeLabels[scope]} Prospects`}
      </button>
    );
  };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{persona.prospectLabel}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeIndustry
                ? <><span className="font-medium text-foreground">{filtered.length}</span> in {activeIndustry.name}</>
                : <><span className="font-medium text-foreground">{filtered.length}</span> across all industries</>
              }
            </p>
          </div>
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={selectAll} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title={selectedIds.size === filtered.length ? "Deselect all" : "Select all"}>
                {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select"}
              </button>
              {selectedIds.size > 0 && (
                <button onClick={exportSelected} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                  <Download className="h-3.5 w-3.5" /> Export {selectedIds.size}
                </button>
              )}
              <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Download className="h-3.5 w-3.5" /> Export All
              </button>
            </div>
          )}
        </div>

        {/* Local context banner with radius slider */}
        {userCity && (
          <div className="mt-4 rounded-md bg-secondary px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">
                Your location: <span className="font-medium text-foreground">{userCity}{userState ? `, ${userState}` : ""}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Local radius:</span>
              <Slider
                value={[localRadius]}
                onValueChange={(v) => setLocalRadius(v[0])}
                min={10}
                max={200}
                step={10}
                className="flex-1 max-w-[200px]"
              />
              <span className="text-xs font-medium text-foreground whitespace-nowrap w-16">{localRadius} miles</span>
              <span className="text-[10px] text-muted-foreground">
                {localRadius < 50 ? "Same metro only" : localRadius < 100 ? "Extended metro" : localRadius < 150 ? "Includes neighboring states" : "Wide regional"}
              </span>
            </div>
          </div>
        )}

        {/* Company Analyzer */}
        <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Analyze Any Company</h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Search for any company to get AI-powered intelligence — divisions, opportunities, key contacts, and why they need your services right now.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search any company — Nike, Olipop, your next client..."
                  value={dreamInput}
                  onChange={(e) => setDreamInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && analyzeDreamClient()}
                  className="flex-1 rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={analyzeDreamClient}
                  disabled={dreamLoading || !dreamInput.trim()}
                  className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
                >
                  {dreamLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {dreamLoading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>
          </div>

          {/* Loading progress steps */}
          {dreamLoading && (
            <div className="mt-4 ml-[52px] space-y-2">
              <DreamLoadingSteps company={dreamInput} />
            </div>
          )}
        </div>

        {/* Company Analysis Results */}
        {(dreamOverview || dreamProspects.length > 0) && !dreamLoading && (
          <div className="mt-4">
            {dreamOverview && (
              <div className="mb-4 rounded-lg bg-secondary/60 border border-border p-4">
                <p className="text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Company Overview — {dreamInput}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{dreamOverview}</p>
              </div>
            )}
            <ProspectSection
              title={`Analysis: ${dreamInput}`}
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              prospects={dreamProspects}
              emptyMessage="No opportunities found. Try a different company name."
            />
          </div>
        )}

        {/* Filters */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search prospects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
                <option value="all">All Industries</option>
                {industriesWithProspects.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
                <option value="all">All Locations</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
              <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as ProspectScope | "all")} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
                <option value="all">All Regions</option>
                <option value="local">Local ({userCity || "nearby"})</option>
                <option value="national">National ({userCountry || "US"})</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1.5">
              {(["all", "growth_mode", "strategic_investment", "contracting"] as const).map((pr) => (
                <button key={pr} onClick={() => setPressureFilter(pr)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${pressureFilter === pr ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {pr === "all" ? "All" : pr === "growth_mode" ? "Growth" : pr === "strategic_investment" ? "Strategic" : "Contracting"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sort:</span>
              {(["score", "revenue", "employees", "name"] as SortBy[]).map((s) => (
                <button key={s} onClick={() => setSortBy(s)} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${sortBy === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {s === "score" ? "VIGYL Score" : s === "revenue" ? "Revenue" : s === "employees" ? "Size" : "Name"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grouped Prospect Sections */}
        <div className="mt-6">
          {scopeFilter === "all" ? (
            <>
              <ProspectSection
                title={`Local Prospects — ${userCity || "Your Area"}${userState ? `, ${userState}` : ""}`}
                icon={<MapPin className="h-5 w-5 text-emerald-500" />}
                prospects={localProspects}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyMessage={`No prospects within ${localRadius} miles of ${userCity || "your location"}. Try loading more or increasing the radius.`}
                emptyAction={refreshCTA}
                loadMoreAction={makeLoadMoreButton("local")}
              />
              <ProspectSection
                title={`National Prospects — ${userCountry || "United States"}`}
                icon={<Building2 className="h-5 w-5 text-blue-500" />}
                prospects={nationalProspects}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyMessage="No national prospects found. Load more to discover companies across the US."
                emptyAction={refreshCTA}
                loadMoreAction={makeLoadMoreButton("national")}
              />
              <ProspectSection
                title="International Prospects"
                icon={<Globe2 className="h-5 w-5 text-violet-500" />}
                prospects={internationalProspects}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyMessage="No international prospects found. Load more to discover global opportunities."
                emptyAction={refreshCTA}
                loadMoreAction={makeLoadMoreButton("international")}
              />
            </>
          ) : (
            <ProspectSection
              title={
                scopeFilter === "local" ? `Local Prospects — ${userCity || "Your Area"}` :
                scopeFilter === "national" ? `National Prospects — ${userCountry || "United States"}` :
                "International Prospects"
              }
              icon={
                scopeFilter === "local" ? <MapPin className="h-5 w-5 text-emerald-500" /> :
                scopeFilter === "national" ? <Building2 className="h-5 w-5 text-blue-500" /> :
                <Globe2 className="h-5 w-5 text-violet-500" />
              }
              prospects={filtered}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              emptyMessage="No prospects match your filters."
            />
          )}
        </div>

        {/* ── Discover Industries ── */}
        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Discover Industries</h2>
              <span className="text-xs text-muted-foreground">
                {INDUSTRY_TAXONOMY.reduce((sum, s) => sum + s.verticals.length, 0)} verticals across {INDUSTRY_TAXONOMY.length} sectors
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Expand your prospect pipeline into new industries. Click any vertical to generate targeted prospects.
          </p>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={discoverSearch}
              onChange={(e) => setDiscoverSearch(e.target.value)}
              placeholder="Search verticals... (e.g. QSR, C-Store, CPG, production studios, controls)"
              className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {discoverResults.map((v) => {
              const sector = INDUSTRY_TAXONOMY.find(s => s.verticals.some(sv => sv.id === v.id));
              const explored = exploredVerticals.find(ev => ev.vertical_id === v.id);
              const isExpanding = expanding === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => expandVertical({
                    verticalId: v.id,
                    verticalName: v.name,
                    sectorName: sector?.name || v.sector,
                    scope: "all",
                    exampleCompanies: v.exampleCompanies,
                  })}
                  disabled={!!expanding}
                  className={`group relative rounded-lg border p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 ${
                    explored ? "border-primary/20 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{sector?.icon || "📊"}</span>
                        <span className="text-xs font-semibold text-foreground truncate">{v.name}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground truncate">
                        {v.exampleCompanies.slice(0, 3).join(", ")}
                        {v.exampleCompanies.length > 3 && ` +${v.exampleCompanies.length - 3} more`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {explored && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                          {explored.times_expanded}x
                        </span>
                      )}
                      {v.aiOpportunityLevel === "high" && (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:text-emerald-400">
                          High AI
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanding && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-card/80 backdrop-blur-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {!discoverSearch && !discoverExpanded && untappedVerticals.length > 12 && (
            <button
              onClick={() => setDiscoverExpanded(true)}
              className="mt-3 w-full rounded-md border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Show all {untappedVerticals.length} verticals
            </button>
          )}

          {exploredVerticals.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recently Explored</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {exploredVerticals.slice(0, 8).map((v) => (
                  <span key={v.vertical_id} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary">
                    {v.vertical_name}
                    <span className="text-primary/50">·</span>
                    <span className="text-primary/60">{v.times_expanded}x</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
