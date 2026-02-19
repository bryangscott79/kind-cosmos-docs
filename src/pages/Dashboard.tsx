import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Radio, Users,
  TrendingUp, TrendingDown, Minus, Briefcase, MessageSquare,
  RefreshCw, Loader2, Calendar, Mail, X as XIcon, ChevronRight,
  Target, Sparkles, Zap, BarChart3
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlobalSignalBanner from "@/components/GlobalSignalBanner";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { signalTypeColors } from "@/components/dashboard/CriticalAlertCard";
import EnhancedCriticalAlerts from "@/components/dashboard/EnhancedCriticalAlerts";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDigestSubscription } from "@/hooks/useDigestSubscription";
import { useToast } from "@/hooks/use-toast";
import AskArgus from "@/components/AskArgus";

const sentimentIcon = (s: string) => {
  if (s === "positive") return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (s === "negative") return <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const pipelineStageConfig: Record<string, { label: string; color: string; bg: string; order: number }> = {
  researching: { label: "Researching", color: "text-slate-600", bg: "bg-slate-100", order: 0 },
  contacted: { label: "Contacted", color: "text-blue-600", bg: "bg-blue-100", order: 1 },
  meeting_scheduled: { label: "Meeting", color: "text-violet-600", bg: "bg-violet-100", order: 2 },
  proposal_sent: { label: "Proposal", color: "text-amber-600", bg: "bg-amber-100", order: 3 },
  won: { label: "Won", color: "text-emerald-600", bg: "bg-emerald-100", order: 4 },
  lost: { label: "Lost", color: "text-rose-600", bg: "bg-rose-100", order: 5 },
};

export default function Dashboard() {
  const [digestDismissed, setDigestDismissed] = useState(false);
  const [digestEmail, setDigestEmail] = useState("");
  const { isSubscribed, subscribe, saving: digestSaving } = useDigestSubscription();
  const { toast } = useToast();
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => localStorage.getItem("vigyl_welcome_dismissed") === "true");
  const navigate = useNavigate();
  const { data, loading, refresh } = useIntelligence();
  const { industries, signals, prospects } = data;
  const { persona, profile } = useAuth();

  const getIndustryName = (id: string) => industries.find((i) => i.id === id)?.name ?? "Unknown";
  const getIndustrySlug = (id: string) => industries.find((i) => i.id === id)?.slug;

  const recentSignals = useMemo(
    () => [...signals].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5),
    [signals]
  );

  const topProspects = useMemo(
    () => [...prospects].sort((a, b) => b.vigylScore - a.vigylScore).slice(0, 5),
    [prospects]
  );

  const pipelineActivity = useMemo(() => {
    return [...prospects]
      .filter((p) => p.pipelineStage !== "researching" && p.pipelineStage !== "lost")
      .sort((a, b) => (pipelineStageConfig[b.pipelineStage]?.order ?? 0) - (pipelineStageConfig[a.pipelineStage]?.order ?? 0))
      .slice(0, 5);
  }, [prospects]);

  const getAffectedProspects = (signalId: string) =>
    prospects.filter((p) => p.relatedSignals?.includes(signalId)).slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const highImpactSignals = signals.filter((s) => s.severity >= 4).length;
  const hotProspects = prospects.filter((p) => p.vigylScore >= 80).length;
  const activePipeline = prospects.filter((p) => !["researching", "lost"].includes(p.pipelineStage)).length;
  const improvingCount = industries.filter((i) => i.trendDirection === "improving").length;

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <GlobalSignalBanner />

        {/* Welcome card */}
        {!welcomeDismissed && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/[0.03] to-transparent p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Welcome to VIGYL</h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{persona.welcomeMessage}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/industries" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                    <BarChart3 className="h-3 w-3" /> Explore Industries <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link to="/settings" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Customize Settings
                  </Link>
                </div>
              </div>
              <button onClick={() => { setWelcomeDismissed(true); localStorage.setItem("vigyl_welcome_dismissed", "true"); }} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Snapshot */}
        {welcomeDismissed && signals.length > 0 && (() => {
          const recentCount = signals.filter(s => {
            const d = new Date(s.publishedAt);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            return d >= twoDaysAgo;
          }).length;
          const highScoreProspects = prospects.filter(p => p.vigylScore >= 80).length;
          const decliningIndustries = industries.filter(i => i.trendDirection === "declining").length;
          if (recentCount === 0 && highScoreProspects === 0) return null;
          return (
            <div className="mt-4 rounded-md bg-secondary/60 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Snapshot</span>
              {recentCount > 0 && (
                <Link to="/signals" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  {recentCount} new signal{recentCount !== 1 ? "s" : ""}
                </Link>
              )}
              {highScoreProspects > 0 && (
                <Link to="/prospects" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  {highScoreProspects} high-scoring {persona.prospectLabel.toLowerCase()}
                </Link>
              )}
              {decliningIndustries > 0 && (
                <span className="text-xs text-amber-600 font-medium">{decliningIndustries} declining industr{decliningIndustries !== 1 ? "ies" : "y"}</span>
              )}
            </div>
          );
        })()}

        {/* Header */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{today}</p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/signals" className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High-Impact Signals</p>
              <Radio className="h-3.5 w-3.5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-mono font-bold text-primary mt-2">{highImpactSignals}</p>
          </Link>
          <Link to="/prospects" className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hot Prospects</p>
              <Users className="h-3.5 w-3.5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-mono font-bold text-primary mt-2">{hotProspects}</p>
          </Link>
          <Link to="/pipeline" className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active {persona.pipelineLabel}</p>
              <Briefcase className="h-3.5 w-3.5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-mono font-bold text-primary mt-2">{activePipeline}</p>
          </Link>
          <Link to="/industries" className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Industries Improving</p>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-mono font-bold text-emerald-600 mt-2">{improvingCount}</p>
          </Link>
        </div>

        {/* Email Digest CTA */}
        {!digestDismissed && !isSubscribed && (
          <div className="mt-5 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/[0.04] to-violet-500/[0.04] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Get your daily intelligence briefing</p>
                  <p className="text-xs text-muted-foreground mt-0.5">High-impact signals, prospect alerts, and industry changes — delivered to your inbox every morning.</p>
                </div>
              </div>
              <button onClick={() => setDigestDismissed(true)} className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 ml-11">
              <input
                type="email"
                value={digestEmail}
                onChange={(e) => setDigestEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full max-w-xs rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && digestEmail) {
                    subscribe(digestEmail).then(r => {
                      if (r.success) toast({ title: "Subscribed!", description: "Your first daily briefing arrives tomorrow morning." });
                      else toast({ title: "Failed to subscribe", description: r.error, variant: "destructive" });
                    });
                  }
                }}
              />
              <button
                onClick={() => {
                  if (digestEmail) {
                    subscribe(digestEmail).then(r => {
                      if (r.success) toast({ title: "Subscribed!", description: "Your first daily briefing arrives tomorrow morning." });
                      else toast({ title: "Failed to subscribe", description: r.error, variant: "destructive" });
                    });
                  }
                }}
                disabled={!digestEmail || digestSaving}
                className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {digestSaving ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
          </div>
        )}
        {isSubscribed && !digestDismissed && (
          <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 flex items-center gap-3">
            <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300"><span className="font-semibold">You're subscribed.</span> Daily briefings arrive in your inbox every morning.</p>
            <button onClick={() => setDigestDismissed(true)} className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"><XIcon className="h-3 w-3" /></button>
          </div>
        )}

        {/* Main 2-column layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <EnhancedCriticalAlerts
              signals={signals}
              prospects={prospects}
              industries={industries}
              targetIndustryIds={profile?.target_industries?.map((name: string) => {
                const ind = industries.find(i => i.name === name);
                return ind?.id;
              }).filter(Boolean) as string[] | undefined}
              getIndustryName={getIndustryName}
            />

            {/* Signal Feed */}
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
                {recentSignals.map((signal) => {
                  const affected = getAffectedProspects(signal.id);
                  const industryNames = signal.industryTags.map((t) => getIndustryName(t)).filter(n => n !== "Unknown");
                  const firstIndustrySlug = signal.industryTags.length > 0 ? getIndustrySlug(signal.industryTags[0]) : undefined;

                  return (
                    <div
                      key={signal.id}
                      className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors cursor-pointer"
                      onClick={() => firstIndustrySlug ? navigate(`/industries/${firstIndustrySlug}`) : navigate("/signals")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${signalTypeColors[signal.signalType] || ""}`}>
                              {signal.signalType.replace("_", " ")}
                            </span>
                            {sentimentIcon(signal.sentiment)}
                            {industryNames.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">{industryNames.join(", ")}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-foreground leading-snug">{signal.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{signal.summary}</p>
                          {affected.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Users className="h-3 w-3 text-primary/50" />
                              <span className="text-[10px] text-muted-foreground">
                                Impacts: {affected.map((p) => p.companyName).join(", ")}
                              </span>
                            </div>
                          )}
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
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Pipeline Activity */}
            {pipelineActivity.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">{persona.pipelineLabel} Activity</h2>
                  </div>
                  <Link to="/pipeline" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {pipelineActivity.map((p) => {
                    const stage = pipelineStageConfig[p.pipelineStage] || pipelineStageConfig.researching;
                    return (
                      <Link
                        key={p.id}
                        to="/pipeline"
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{p.companyName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${stage.bg} ${stage.color}`}>
                              {stage.label}
                            </span>
                            {p.lastContacted && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(p.lastContacted).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top Prospects */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Top {persona.prospectLabel}</h2>
                </div>
                <Link to="/prospects" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {topProspects.map((p) => (
                  <Link
                    key={p.id}
                    to="/prospects"
                    className="rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors block"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">{p.companyName}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {p.pressureResponse === "growth_mode" ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : p.pressureResponse === "contracting" ? (
                          <TrendingDown className="h-3 w-3 text-rose-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-blue-500" />
                        )}
                        <span className="text-sm font-mono font-bold text-primary">{p.vigylScore}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      <span className="font-medium text-foreground/70">{persona.whyNowLabel}:</span> {p.whyNow.split(".")[0]}.
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Contextual next step */}
            {(() => {
              const pipelineCount = prospects.filter(p => p.pipelineStage && p.pipelineStage !== "researching").length;
              const highScored = topProspects.filter(p => p.vigylScore >= 80);
              const recentHighSignals = signals.filter(s => {
                const ago = Date.now() - new Date(s.publishedAt).getTime();
                return ago < 48 * 60 * 60 * 1000 && s.severity >= 4;
              });

              if (highScored.length > 0 && pipelineCount === 0) {
                return (
                  <Link to="/prospects" className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-3 hover:bg-primary/[0.06] transition-colors">
                    <Target className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-foreground"><span className="font-semibold">{highScored.length} high-scoring {persona.prospectLabel.toLowerCase()}</span> — add to {persona.pipelineLabel.toLowerCase()}.</p>
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                  </Link>
                );
              }
              if (pipelineCount > 0) {
                const contactedCount = prospects.filter(p => p.pipelineStage === "contacted" || p.pipelineStage === "meeting_scheduled").length;
                if (contactedCount > 0) {
                  return (
                    <Link to="/outreach" className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-3 hover:bg-primary/[0.06] transition-colors">
                      <Zap className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-foreground"><span className="font-semibold">{contactedCount} in active stages</span> — generate {persona.outreachLabel.toLowerCase()}.</p>
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                    </Link>
                  );
                }
              }
              if (recentHighSignals.length > 0) {
                return (
                  <Link to="/signals" className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-3 hover:bg-primary/[0.06] transition-colors">
                    <Radio className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-foreground"><span className="font-semibold">{recentHighSignals.length} high-severity signals</span> in the last 48h.</p>
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                  </Link>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
