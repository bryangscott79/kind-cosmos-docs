import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Building2, Globe2, Star, Loader2, ChevronLeft, ChevronRight, Sparkles, Navigation, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProspectCard from "@/components/ProspectCard";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { Prospect, PressureResponse, ProspectScope } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

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

function ProspectSection({
  title,
  icon,
  prospects,
  emptyMessage,
  emptyAction,
}: {
  title: string;
  icon: React.ReactNode;
  prospects: Prospect[];
  emptyMessage: string;
  emptyAction?: React.ReactNode;
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
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
      </div>
    </div>
  );
}

export default function Prospects() {
  const [searchParams] = useSearchParams();
  const industryParam = searchParams.get("industry") || "all";
  const { data, refresh } = useIntelligence();
  const { prospects, industries } = data;
  const { profile } = useAuth();
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

  const userState = (profile?.location_state || "").trim();
  const userCity = (profile?.location_city || "").trim();
  const userCountry = (profile?.location_country || "US").trim();

  // Enrich prospects with inferred scope
  const enrichedProspects = useMemo(() => 
    prospects.map(p => ({
      ...p,
      scope: inferScope(p, userState, userCountry, localRadius),
    })),
    [prospects, userState, userCountry, localRadius]
  );

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

  // Group by scope
  const localProspects = useMemo(() => filtered.filter(p => p.scope === "local"), [filtered]);
  const nationalProspects = useMemo(() => filtered.filter(p => p.scope === "national"), [filtered]);
  const internationalProspects = useMemo(() => filtered.filter(p => p.scope === "international"), [filtered]);

  const activeIndustry = industries.find(i => i.id === industryFilter);

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
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setDreamLoading(false);
    }
  };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prospect Engine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeIndustry
              ? <><span className="font-medium text-foreground">{filtered.length} prospects</span> in {activeIndustry.name}</>
              : <><span className="font-medium text-foreground">{filtered.length} prospects</span> across all industries</>
            }
          </p>
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

        {/* Dream Client */}
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Dream Client Analyzer</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Enter any company name to discover divisions and opportunities within it.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Nike, Tesla, Johnson & Johnson..."
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeDreamClient()}
              className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={analyzeDreamClient}
              disabled={dreamLoading || !dreamInput.trim()}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {dreamLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analyze
            </button>
          </div>
        </div>

        {/* Dream Client Results */}
        {(dreamOverview || dreamProspects.length > 0) && (
          <div className="mt-4">
            {dreamOverview && (
              <div className="mb-4 rounded-md bg-secondary p-3">
                <p className="text-xs font-medium text-foreground mb-1">Company Overview</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{dreamOverview}</p>
              </div>
            )}
            <ProspectSection
              title={`Dream Client: ${dreamInput}`}
              icon={<Star className="h-5 w-5 text-primary" />}
              prospects={dreamProspects}
              emptyMessage="No opportunities found."
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
                emptyMessage="No local prospects found."
                emptyAction={refreshCTA}
              />
              <ProspectSection
                title={`National Prospects — ${userCountry || "United States"}`}
                icon={<Building2 className="h-5 w-5 text-blue-500" />}
                prospects={nationalProspects}
                emptyMessage="No national prospects found."
                emptyAction={refreshCTA}
              />
              <ProspectSection
                title="International Prospects"
                icon={<Globe2 className="h-5 w-5 text-violet-500" />}
                prospects={internationalProspects}
                emptyMessage="No international prospects found."
                emptyAction={refreshCTA}
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
              emptyMessage="No prospects match your filters."
            />
          )}
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
