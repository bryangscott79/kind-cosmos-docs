import { useState, useMemo } from "react";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import IndustryHealthTimeline from "@/components/dashboard/IndustryHealthTimeline";
import IndustryCard from "@/components/IndustryCard";
import { useIntelligence } from "@/contexts/IntelligenceContext";

export default function IndustryDashboard() {
  const [search, setSearch] = useState("");
  const { data, loading, refresh, aiImpactGen, generateAiImpact } = useIntelligence();
  const { industries, aiImpact } = data;

  const filtered = useMemo(() => {
    if (!search) return [];
    return industries.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, industries]);

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        {/* Header */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Industry Health</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Health scores, AI impact analysis & trends across {industries.length} industries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </button>
            <div className="relative max-w-xs w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search industries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Search results */}
        {search && filtered.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((industry) => (
              <IndustryCard key={industry.id} industry={industry} />
            ))}
          </div>
        )}

        {/* Full industry health timeline */}
        {!search && (
          <div className="mt-6">
            <IndustryHealthTimeline
              industries={industries}
              aiImpact={aiImpact}
              generating={aiImpactGen.generating}
              onGenerateAiImpact={generateAiImpact}
              genProgress={aiImpactGen.progress}
            />
          </div>
        )}
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
