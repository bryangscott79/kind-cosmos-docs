import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, DollarSign, Building2, Globe2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProspectCard from "@/components/ProspectCard";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { PressureResponse } from "@/data/mockData";

type SortBy = "score" | "name" | "revenue" | "employees";
type Scope = "all" | "local" | "national" | "international";

export default function Prospects() {
  const [searchParams] = useSearchParams();
  const industryParam = searchParams.get("industry") || "all";
  const { data } = useIntelligence();
  const { prospects, industries } = data;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [pressureFilter, setPressureFilter] = useState<PressureResponse | "all">("all");
  const [industryFilter, setIndustryFilter] = useState(industryParam);
  const [locationFilter, setLocationFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<Scope>("all");

  const states = useMemo(() => [...new Set(prospects.map(p => p.location.state))].sort(), [prospects]);
  const industriesWithProspects = useMemo(() => {
    const ids = [...new Set(prospects.map(p => p.industryId))];
    return industries.filter(i => ids.includes(i.id));
  }, [prospects, industries]);

  const parseRevenue = (rev: string): number => {
    const num = parseFloat(rev.replace(/[^0-9.]/g, ""));
    if (rev.includes("B")) return num * 1000;
    return num;
  };

  const filtered = useMemo(() => {
    let result = prospects
      .filter(p => p.companyName.toLowerCase().includes(search.toLowerCase()))
      .filter(p => pressureFilter === "all" || p.pressureResponse === pressureFilter)
      .filter(p => industryFilter === "all" || p.industryId === industryFilter)
      .filter(p => locationFilter === "all" || p.location.state === locationFilter)
      .filter(p => {
        if (scopeFilter === "all") return true;
        if (scopeFilter === "local") return p.location.country === "US" || p.location.country === "United States";
        if (scopeFilter === "national") return p.location.country === "US" || p.location.country === "United States";
        return p.location.country !== "US" && p.location.country !== "United States";
      });

    if (sortBy === "score") result.sort((a, b) => b.vigylScore - a.vigylScore);
    else if (sortBy === "name") result.sort((a, b) => a.companyName.localeCompare(b.companyName));
    else if (sortBy === "revenue") result.sort((a, b) => parseRevenue(b.annualRevenue) - parseRevenue(a.annualRevenue));
    else if (sortBy === "employees") result.sort((a, b) => b.employeeCount - a.employeeCount);

    return result;
  }, [search, sortBy, pressureFilter, industryFilter, locationFilter, scopeFilter, prospects]);

  const activeIndustry = industries.find(i => i.id === industryFilter);

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

        <div className="mt-5 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as Scope)} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none">
                <option value="all">All Regions</option>
                <option value="local">Local</option>
                <option value="national">National</option>
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prospect) => <ProspectCard key={prospect.id} prospect={prospect} />)}
          {filtered.length === 0 && <div className="col-span-full py-16 text-center text-sm text-muted-foreground">No prospects match your filters.</div>}
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
