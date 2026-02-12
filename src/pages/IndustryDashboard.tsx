import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, ArrowUpRight, ArrowDownRight, Radio, Users, BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, RefreshCw, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IndustryCard from "@/components/IndustryCard";
import GlobalSignalBanner from "@/components/GlobalSignalBanner";
import Sparkline from "@/components/Sparkline";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { getSignalTypeLabel } from "@/data/mockData";

const signalTypeColors: Record<string, string> = {
  political: "bg-purple-100 text-purple-700 border-purple-200",
  regulatory: "bg-blue-100 text-blue-700 border-blue-200",
  economic: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hiring: "bg-amber-100 text-amber-700 border-amber-200",
  tech: "bg-cyan-100 text-cyan-700 border-cyan-200",
  supply_chain: "bg-rose-100 text-rose-700 border-rose-200",
};

const sentimentIcon = (s: string) => {
  if (s === "positive") return <ArrowUpRight className="h-3.5 w-3.5 text-score-green" />;
  if (s === "negative") return <ArrowDownRight className="h-3.5 w-3.5 text-score-red" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

export default function IndustryDashboard() {
  const [search, setSearch] = useState("");
  const { data, loading, refresh } = useIntelligence();
  const { industries, signals, prospects } = data;

  const getIndustryName = (id: string) => industries.find((i) => i.id === id)?.name ?? "Unknown";

  const recentSignals = useMemo(
    () => [...signals].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5),
    [signals]
  );

  const criticalAlerts = useMemo(
    () => signals.filter((s) => s.severity >= 5 && s.sentiment !== "positive").slice(0, 3),
    [signals]
  );

  const topProspects = useMemo(
    () => [...prospects].sort((a, b) => b.vigylScore - a.vigylScore).slice(0, 5),
    [prospects]
  );

  const industryMovers = useMemo(() => {
    const improving = [...industries].filter((i) => i.trendDirection === "improving").sort((a, b) => b.healthScore - a.healthScore).slice(0, 3);
    const declining = [...industries].filter((i) => i.trendDirection === "declining").sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);
    return { improving, declining };
  }, [industries]);

  const filtered = useMemo(() => {
    if (!search) return [];
    return industries.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, industries]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <GlobalSignalBanner />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Intelligence Briefing</h1>
            <p className="mt-1 text-sm text-muted-foreground">{today} · {signals.length} signals · {industries.length} industries tracked</p>
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

        {search && filtered.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((industry) => (
              <IndustryCard key={industry.id} industry={industry} />
            ))}
          </div>
        )}

        {!search && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {criticalAlerts.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-score-red" />
                    <h2 className="text-sm font-semibold text-foreground">Critical Alerts</h2>
                  </div>
                  <div className="space-y-2">
                    {criticalAlerts.map((signal) => (
                      <div key={signal.id} className="rounded-lg border border-score-red/20 bg-score-red/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${signalTypeColors[signal.signalType] || ""}`}>
                                {signal.signalType.replace("_", " ")}
                              </span>
                              {sentimentIcon(signal.sentiment)}
                              <span className="text-[10px] text-muted-foreground">{new Date(signal.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground leading-snug">{signal.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{signal.salesImplication}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Latest Signals</h2>
                  </div>
                  <Link to="/signals" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentSignals.map((signal) => (
                    <div key={signal.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${signalTypeColors[signal.signalType] || ""}`}>
                              {signal.signalType.replace("_", " ")}
                            </span>
                            {sentimentIcon(signal.sentiment)}
                            <span className="text-[10px] text-muted-foreground">
                              {signal.industryTags.map((t) => getIndustryName(t)).join(", ")}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground leading-snug">{signal.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{signal.summary}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] text-muted-foreground">{new Date(signal.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <div className="mt-1 flex items-center gap-0.5 justify-end">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < signal.severity ? "bg-primary" : "bg-muted"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Top Prospects</h2>
                  </div>
                  <Link to="/prospects" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {topProspects.map((p) => (
                    <div key={p.id} className="rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{p.companyName}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.pressureResponse === "growth_mode" ? (
                            <TrendingUp className="h-3 w-3 text-score-green" />
                          ) : p.pressureResponse === "contracting" ? (
                            <TrendingDown className="h-3 w-3 text-score-red" />
                          ) : (
                            <Minus className="h-3 w-3 text-info" />
                          )}
                          <span className="text-sm font-mono font-bold text-primary">{p.vigylScore}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        <span className="font-medium text-foreground/70">Why now:</span> {p.whyNow.split(".")[0]}.
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{getIndustryName(p.industryId)}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          p.pressureResponse === "growth_mode" ? "bg-green-100 text-green-700" :
                          p.pressureResponse === "contracting" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {p.pressureResponse.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Industry Health</h2>
                  </div>
                </div>
                <div className="space-y-2">
                  {industryMovers.improving.map((ind) => (
                    <Link
                      key={ind.id}
                      to={`/industries/${ind.slug}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <TrendingUp className="h-3.5 w-3.5 text-score-green shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">{ind.name}</span>
                          <span className="text-[10px] text-score-green font-medium">Improving</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {ind.scoreHistory && (
                          <div className="w-16 hidden sm:block">
                            <Sparkline data={ind.scoreHistory} healthScore={ind.healthScore} width={64} height={24} />
                          </div>
                        )}
                        <span className="text-sm font-mono font-bold text-foreground w-7 text-right">{ind.healthScore}</span>
                      </div>
                    </Link>
                  ))}
                  {industryMovers.declining.map((ind) => (
                    <Link
                      key={ind.id}
                      to={`/industries/${ind.slug}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <TrendingDown className="h-3.5 w-3.5 text-score-red shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">{ind.name}</span>
                          <span className="text-[10px] text-score-red font-medium">Declining</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {ind.scoreHistory && (
                          <div className="w-16 hidden sm:block">
                            <Sparkline data={ind.scoreHistory} healthScore={ind.healthScore} width={64} height={24} />
                          </div>
                        )}
                        <span className="text-sm font-mono font-bold text-foreground w-7 text-right">{ind.healthScore}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today's Snapshot
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-secondary p-3 text-center">
                    <p className="text-lg font-mono font-bold text-primary">{signals.filter((s) => s.severity >= 4).length}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">High-Impact Signals</p>
                  </div>
                  <div className="rounded-md bg-secondary p-3 text-center">
                    <p className="text-lg font-mono font-bold text-primary">{prospects.filter((p) => p.vigylScore >= 80).length}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Hot Prospects</p>
                  </div>
                  <div className="rounded-md bg-secondary p-3 text-center">
                    <p className="text-lg font-mono font-bold text-score-green">{industries.filter((i) => i.trendDirection === "improving").length}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Improving</p>
                  </div>
                  <div className="rounded-md bg-secondary p-3 text-center">
                    <p className="text-lg font-mono font-bold text-score-red">{industries.filter((i) => i.trendDirection === "declining").length}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Declining</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
