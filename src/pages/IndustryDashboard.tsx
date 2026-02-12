import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IndustryCard from "@/components/IndustryCard";
import GlobalSignalBanner from "@/components/GlobalSignalBanner";
import { industries } from "@/data/mockData";

type SortBy = "score" | "name" | "trend";

export default function IndustryDashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("score");

  const filtered = useMemo(() => {
    let result = industries.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === "score") result.sort((a, b) => b.healthScore - a.healthScore);
    else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else result.sort((a, b) => {
      const order = { improving: 0, stable: 1, declining: 2 };
      return order[a.trendDirection] - order[b.trendDirection];
    });

    return result;
  }, [search, sortBy]);

  return (
    <DashboardLayout>
      <GlobalSignalBanner />

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-foreground">Industry Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time health scores across {industries.length} tracked industries
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search industries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1.5">
          {(["score", "name", "trend"] as SortBy[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sortBy === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "score" ? "Health Score" : s === "name" ? "Name" : "Trend"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((industry) => (
          <IndustryCard key={industry.id} industry={industry} />
        ))}
      </div>
    </DashboardLayout>
  );
}
