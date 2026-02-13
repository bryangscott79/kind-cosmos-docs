import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Globe, Scale, DollarSign, Users, Cpu, Truck, TrendingUp, TrendingDown, Minus, MessageCircle, Swords, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SignalCard from "@/components/SignalCard";
import GlobalSignalBanner from "@/components/GlobalSignalBanner";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { Signal, getSignalTypeLabel } from "@/data/mockData";

type FilterType = "all" | Signal["signalType"];

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

function CategorySection({ type, signalList, defaultOpen, industries }: { type: Signal["signalType"]; signalList: Signal[]; defaultOpen: boolean; industries: any[] }) {
  const [open, setOpen] = useState(defaultOpen);
  const config = categoryConfig[type];
  const Icon = config.icon;
  const avgSeverity = Math.round(signalList.reduce((sum, s) => sum + s.severity, 0) / signalList.length * 10) / 10;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
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
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-13 sm:ml-0">
          <SentimentSummary signals={signalList} />
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
  const { data } = useIntelligence();
  const { signals, industries } = data;

  const filtered = useMemo(() => {
    return signals
      .filter(s => filter === "all" || s.signalType === filter)
      .filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.summary.toLowerCase().includes(search.toLowerCase()));
  }, [search, filter, signals]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Signal[]> = {};
    for (const type of categoryOrder) {
      const typeSignals = filtered.filter(s => s.signalType === type);
      if (typeSignals.length > 0) groups[type] = typeSignals;
    }
    return groups;
  }, [filtered]);

  const types: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "All", count: signals.length },
    ...categoryOrder.map(type => ({
      value: type as FilterType,
      label: categoryConfig[type].label.split(" ")[0],
      count: signals.filter(s => s.signalType === type).length,
    })),
  ];

  const totalSources = filtered.reduce((sum, s) => sum + (s.sources?.length || 0), 0);

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
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search signals..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-border bg-secondary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === t.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {t.label}<span className="ml-1 opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {filter === "all" ? (
          <div className="mt-6 space-y-4">
            {categoryOrder.filter(type => groupedByCategory[type]).map((type, i) => (
              <CategorySection key={type} type={type} signalList={groupedByCategory[type]} defaultOpen={i < 2} industries={industries} />
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map(signal => <SignalCard key={signal.id} signal={signal} />)}
            {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No signals match your filters.</p>}
            <AffectedIndustries signalList={filtered} industries={industries} />
          </div>
        )}
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
