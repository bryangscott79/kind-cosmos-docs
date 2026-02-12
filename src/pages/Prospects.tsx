import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProspectCard from "@/components/ProspectCard";
import { prospects, industries, PressureResponse } from "@/data/mockData";

type SortBy = "score" | "name" | "industry";

export default function Prospects() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [pressureFilter, setPressureFilter] = useState<PressureResponse | "all">("all");

  const filtered = useMemo(() => {
    let result = prospects
      .filter((p) => p.companyName.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => pressureFilter === "all" || p.pressureResponse === pressureFilter);

    if (sortBy === "score") result.sort((a, b) => b.vigylScore - a.vigylScore);
    else if (sortBy === "name") result.sort((a, b) => a.companyName.localeCompare(b.companyName));
    else result.sort((a, b) => a.industryId.localeCompare(b.industryId));

    return result;
  }, [search, sortBy, pressureFilter]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prospect Engine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-scored prospects with real-time opportunity signals
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search prospects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1.5">
            {(["all", "growth_mode", "strategic_investment", "contracting"] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setPressureFilter(pr)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  pressureFilter === pr
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {pr === "all" ? "All" : pr === "growth_mode" ? "Growth" : pr === "strategic_investment" ? "Strategic" : "Contracting"}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["score", "name", "industry"] as SortBy[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortBy === s
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "score" ? "Score" : s === "name" ? "Name" : "Industry"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prospect) => (
          <ProspectCard key={prospect.id} prospect={prospect} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No prospects match your filters.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
