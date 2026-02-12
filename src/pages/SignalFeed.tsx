import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SignalCard from "@/components/SignalCard";
import GlobalSignalBanner from "@/components/GlobalSignalBanner";
import { signals, Signal } from "@/data/mockData";

type FilterType = "all" | Signal["signalType"];

export default function SignalFeed() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    return signals
      .filter((s) => filter === "all" || s.signalType === filter)
      .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.summary.toLowerCase().includes(search.toLowerCase()));
  }, [search, filter]);

  const types: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "political", label: "Political" },
    { value: "regulatory", label: "Regulatory" },
    { value: "economic", label: "Economic" },
    { value: "hiring", label: "Hiring" },
    { value: "tech", label: "Tech" },
    { value: "supply_chain", label: "Supply Chain" },
  ];

  return (
    <DashboardLayout>
      <GlobalSignalBanner />
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-foreground">Signal Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-processed market signals with sales implications</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No signals match your filters.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
