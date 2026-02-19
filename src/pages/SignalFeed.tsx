import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Globe, Scale, DollarSign, Users, Cpu, Truck, TrendingUp, TrendingDown, Minus, MessageCircle, Swords, Leaf, Bookmark, Bell, BellOff, Download, LayoutGrid, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SignalCard from "@/components/SignalCard";
import GlobalSignalBanner from "@/components/GlobalSignalBanner";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useSavedSignals } from "@/hooks/useSavedSignals";
import { useSignalWatchlist } from "@/hooks/useSignalWatchlist";
import { useToast } from "@/hooks/use-toast";
import { Signal, getSignalTypeLabel } from "@/data/mockData";

type FilterType = "all" | "saved" | "watched" | Signal["signalType"];

const categoryConfig: Record<Signal["signalType"], { icon: typeof Globe; label: string; description: string; color: string }> = {
  political: { icon: Globe, label: "Political & Geopolitical", description: "Trade wars, sanctions, elections, defense spending shifts, and international policy changes", color: "hsl(var(--score-red))" },
  regulatory: { icon: Scale, label: "Regulatory", description: "New compliance mandates, industry-specific regulations, and government enforcement actions", color: "hsl(var(--brand-purple))" },
  economic: { icon: DollarSign, label: "Economic", description: "Interest rates, inflation data, sector spending trends, and market confidence indicators", color: "hsl(var(--score-yellow))" },
  hiring: { icon: Users, label: "Hiring & Talent", description: "Hiring surges and freezes, key executive movements, talent wars, and workforce shifts", color: "hsl(var(--brand-blue))" },
  tech: { icon: Cpu, label: "Technology", description: "Platform shifts, AI adoption milestones, infrastructure investments, and breakthrough innovations", color: "hsl(var(--brand-teal))" },
  supply_chain: { icon: Truck, label: "Supply Chain", description: "Disruptions, reshoring trends, inventory shifts, and logistics cost changes", color: "hsl(var(--score-green))" },
  social: { icon: MessageCircle, label: "Social & Media", description: "Brand sentiment shifts, viral trends, influencer moves, and public perception changes", color: "hsl(var(--brand-purple))" },
  competitive: { icon: Swords, label: "Competitive", description: "Competitor launches, M&A activity, market share shifts, and strategic pivots", color: "hsl(var(--score-yellow))" },
  environmental: { icon: Leaf, label: "Environmental", description: "Climate policy, sustainability mandates, ESG requirements, and green transitions", color: "hsl(var(--score-green))" },
};

const categoryOrder: Signal["signalType"][] = ["political", "regulatory", "economic", "hiring", "tech", "supply_chain", "social", "competitive", "environmental"];

function SentimentSummary({ signals }: { signals: Signal[] }) {
  const positive = signals.filter(s => s.sentiment === "positive").length;
  const negative = signals.filter(s => s.sentiment === "negative").length;
  const neutral = signals.filter(s => s.sentiment === "neutral").length;
  return (
    <div className="flex items-center gap-3">
      {positive > 0 && <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-score-green" /><span className="text-[10px] font-medium text-score-green">{positive} positive</span></div>}
      {negative > 0 && <div className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-score-red" /><span className="text-[10px] font-medium text-score-red">{negative} negative</span></div>}
      {neutral > 0 && <div className="flex items-center gap-1"><Minus className="h-3 w-3 text-muted-foreground" /><span className="text-[10px] font-medium text-muted-foreground">{neutral} neutral</span></div>}
    </div>
  );
}

function AffectedIndustries({ signalList, industries }: { signalList: Signal[]; industries: any[] }) {
  const industryIds = [...new Set(signalList.flatMap(s => s.industryTags))];
  const affected = industryIds.map(id => industries.find(i => i.id === id)).filter(Boolean);
  if (affected.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
      <span className="text-[10px] text-muted-foreground mr-1 self-center">Affected industries:</span>
      {affected.map(ind => (
        <Link key={ind!.id} to={`/industries/${ind!.slug}`} className="rounded-full bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors">
          {ind!.name}
        </Link>
      ))}
    </div>
  );
}

function CategorySection({ type, signalList, defaultOpen, industries, isWatched, onToggleWatch }: { type: Signal["signalType"]; signalList: Signal[]; defaultOpen: boolean; industries: any[]; isWatched: boolean; onToggleWatch: () => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const config = categoryConfig[type];
  const Icon = config.icon;
  const avgSeverity = Math.round(signalList.reduce((sum, s) => sum + s.severity, 0) / signalList.length * 10) / 10;

  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${isWatched ? "border-primary/30" : "border-border"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex flex-col gap-2 p-4 sm:p-5 text-left hover:bg-accent/30 transition-colors sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${config.color}15` }}>
            <Icon className="h-5 w-5" style={{ color: config.color }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">{config.label}</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{signalList.length} signal{signalList.length !== 1 ? "s" : ""}</span>
              <span className="text-[10px] text-muted-foreground">Avg severity: <span className="font-mono font-semibold">{avgSeverity}</span>/5</span>
              {isWatched && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-medium text-primary"><Bell className="h-2.5 w-2.5" /> Watching</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-13 sm:ml-0">
          <SentimentSummary signals={signalList} />
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWatch(); }}
            className={`p-1.5 rounded-md transition-colors ${isWatched ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            title={isWatched ? "Stop watching" : "Watch this category"}
          >
            {isWatched ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          </button>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <div className="space-y-3">
            {signalList.map(signal => <SignalCard key={signal.id} signal={signal} />)}
          </div>
          <AffectedIndustries signalList={signalList} industries={industries} />
        </div>
      )}
    </div>
  );
}

export default function SignalFeed() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<"categories" | "timeline">("categories");
  const { data } = useIntelligence();
  const { signals, industries } = data;
  const { savedSignals } = useSavedSignals();
  const { rules, addRule, removeRule, isWatching, isSignalWatched } = useSignalWatchlist();
  const { toast } = useToast();

  const savedSignalIds = useMemo(() => new Set(savedSignals.map(s => s.signal_id)), [savedSignals]);
  const watchedCount = useMemo(() => signals.filter(s => isSignalWatched(s.signalType, s.industryTags)).length, [signals, rules]);

  const filtered = useMemo(() => {
    if (filter === "saved") {
      return signals
        .filter(s => savedSignalIds.has(s.id))
        .filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.summary.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter === "watched") {
      return signals
        .filter(s => isSignalWatched(s.signalType, s.industryTags))
        .filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.summary.toLowerCase().includes(search.toLowerCase()));
    }
    return signals
      .filter(s => filter === "all" || s.signalType === filter)
      .filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.summary.toLowerCase().includes(search.toLowerCase()));
  }, [search, filter, signals, savedSignalIds, rules]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Signal[]> = {};
    for (const type of categoryOrder) {
      const typeSignals = filtered.filter(s => s.signalType === type);
      if (typeSignals.length > 0) groups[type] = typeSignals;
    }
    return groups;
  }, [filtered]);

  const types: { value: FilterType; label: string; count: number; icon?: typeof Bookmark }[] = [
    { value: "all", label: "All", count: signals.length },
    { value: "saved", label: "Saved", count: savedSignalIds.size, icon: Bookmark },
    { value: "watched", label: "Watched", count: watchedCount, icon: Bell },
    ...categoryOrder.map(type => ({
      value: type as FilterType,
      label: categoryConfig[type].label.split(" ")[0],
      count: signals.filter(s => s.signalType === type).length,
    })),
  ];

  const totalSources = filtered.reduce((sum, s) => sum + (s.sources?.length || 0), 0);

  // Timeline grouping
  const timelineGroups = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sorted = [...filtered].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const groups: { label: string; signals: Signal[] }[] = [];
    const buckets: Record<string, Signal[]> = { today: [], yesterday: [], thisWeek: [], earlier: [] };

    for (const s of sorted) {
      const d = s.publishedAt.slice(0, 10);
      if (d === todayStr) buckets.today.push(s);
      else if (d === yesterdayStr) buckets.yesterday.push(s);
      else if (new Date(s.publishedAt) > weekAgo) buckets.thisWeek.push(s);
      else buckets.earlier.push(s);
    }

    if (buckets.today.length) groups.push({ label: "Today", signals: buckets.today });
    if (buckets.yesterday.length) groups.push({ label: "Yesterday", signals: buckets.yesterday });
    if (buckets.thisWeek.length) groups.push({ label: "This Week", signals: buckets.thisWeek });
    if (buckets.earlier.length) groups.push({ label: "Earlier", signals: buckets.earlier });
    return groups;
  }, [filtered]);

  const exportSignals = () => {
    const headers = ["Title", "Type", "Sentiment", "Severity", "Summary", "Sales Implication", "Published", "Sources"];
    const rows = filtered.map(s => [
      `"${s.title.replace(/"/g, '""')}"`,
      getSignalTypeLabel(s.signalType),
      s.sentiment,
      s.severity,
      `"${s.summary.replace(/"/g, '""')}"`,
      `"${(s.salesImplication || "").replace(/"/g, '""')}"`,
      s.publishedAt,
      (s.sources || []).map(src => src.name).join("; "),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vigyl-signals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} signals exported to CSV.` });
  };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <GlobalSignalBanner />
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground">Signal Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-processed market signals with sales implications — <span className="font-medium text-foreground">{filtered.length} signals</span> from <span className="font-medium text-foreground">{totalSources} sources</span>
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search signals..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-border bg-secondary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={exportSignals} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <div className="flex rounded-md border border-border overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("categories")}
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium transition-colors ${viewMode === "categories" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                title="Group by category"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium transition-colors border-l border-border ${viewMode === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                title="Timeline view"
              >
                <Clock className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === t.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {t.icon && <t.icon className="h-3 w-3" />}
                {t.label}<span className="ml-1 opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {filter === "all" && viewMode === "timeline" ? (
          <div className="mt-6 space-y-6">
            {timelineGroups.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground">{group.signals.length} signal{group.signals.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-primary/10">
                  {group.signals.map(signal => (
                    <div key={signal.id} className="relative">
                      <div className="absolute -left-[calc(1rem+5px)] top-3 h-2 w-2 rounded-full bg-primary/40" />
                      <SignalCard signal={signal} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {timelineGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No signals to display.</p>
              </div>
            )}
          </div>
        ) : filter === "all" ? (
          <div className="mt-6 space-y-4">
            {categoryOrder.filter(type => groupedByCategory[type]).map((type, i) => (
              <CategorySection
                key={type}
                type={type}
                signalList={groupedByCategory[type]}
                defaultOpen={i < 2}
                industries={industries}
                isWatched={isWatching(type)}
                onToggleWatch={() => {
                  if (isWatching(type)) {
                    const rule = rules.find(r => r.signalType === type && !r.industryId);
                    if (rule) removeRule(rule.id);
                  } else {
                    addRule(type);
                  }
                  toast({ title: isWatching(type) ? "Stopped watching" : "Now watching", description: `${categoryConfig[type].label} signals` });
                }}
              />
            ))}
          </div>
        ) : filter === "saved" ? (
          <div className="mt-6 space-y-3">
            {filtered.length > 0 ? (
              filtered.map(signal => <SignalCard key={signal.id} signal={signal} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-3">
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No saved signals yet</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">Save signals from expanded cards to build a watchlist of the market movements that matter most to your business.</p>
              </div>
            )}
          </div>
        ) : filter === "watched" ? (
          <div className="mt-6 space-y-3">
            {filtered.length > 0 ? (
              filtered.map(signal => <SignalCard key={signal.id} signal={signal} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No watched categories yet</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">Click the bell icon on any signal category to start watching it. Watched signals will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map(signal => <SignalCard key={signal.id} signal={signal} />)}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No signals match your filters</p>
                <p className="mt-1 text-xs text-muted-foreground">Try broadening your search or selecting a different category.</p>
              </div>
            )}
            <AffectedIndustries signalList={filtered} industries={industries} />
          </div>
        )}
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
