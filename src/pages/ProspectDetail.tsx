import { useMemo, useState, useCallback, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, DollarSign, Users, Globe, Briefcase,
  Radio, Calendar, TrendingUp, TrendingDown, Minus, ExternalLink,
  Mail, ChevronRight, Bot, Handshake, User, Brain, Sparkles,
  Target, Lightbulb, Shield, Zap, AlertTriangle, Clock, Star, Swords,
  MessageSquare, LinkIcon, Loader2, Presentation, Copy, Check, Search, CheckCircle2, CircleDashed, RefreshCw,
  FileText, Crosshair, PenTool, Bookmark
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePipelineProspects } from "@/hooks/usePipelineProspects";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamMembers";
import { track, EVENTS } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import AskArgus from "@/components/AskArgus";
import CrmPushButton from "@/components/CrmPushButton";
import ProspectContacts from "@/components/prospect-detail/ProspectContacts";
import ProspectDetailSidebar from "@/components/prospect-detail/ProspectDetailSidebar";
import ClientReport from "@/components/ClientReport";
import {
  getScoreColorHsl, getPressureLabel, pipelineStageLabels,
  getSignalTypeLabel, PipelineStage, isSignalRelevantToIndustry
} from "@/data/mockData";

const stageOrder: PipelineStage[] = ["researching", "contacted", "meeting_scheduled", "proposal_sent", "won", "lost"];

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={getScoreColorHsl(score)} strokeWidth={6} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono font-bold" style={{ color: getScoreColorHsl(score) }}>{score}</span>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h2>
      {badge && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{badge}</span>}
    </div>
  );
}

function MetricPill({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div>
        <p className="text-[9px] text-muted-foreground leading-none">{label}</p>
        <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function buildPresentationPrompt(prospect: any, industry: any, relatedSignals: any[], impactData: any, teamMembers?: TeamMember[]) {
  const teamBlock = teamMembers && teamMembers.length > 0
    ? `## OUR TEAM (for "Meet The Team" slide)
${teamMembers.map(m => `- ${m.name}, ${m.title}${m.bio ? ` — ${m.bio}` : ""}${m.linkedin_url ? ` (${m.linkedin_url})` : ""}`).join("\n")}
Include a headshot/photo placeholder for each team member.`
    : `## OUR TEAM
No team data provided — use a generic "Your Dedicated Team" slide with placeholder headshots.`;

  return `Create a professional, visually structured presentation (10-15 slides) for a prospective client meeting with ${prospect.companyName}. The goal is to demonstrate deep understanding of their business, industry challenges, and position our services as the ideal solution.

## COMPANY OVERVIEW
- Company: ${prospect.companyName}
- Industry: ${industry?.name || "Unknown"}
- Location: ${prospect.location.city}, ${prospect.location.state}
- Revenue: ${prospect.annualRevenue}
- Employees: ${prospect.employeeCount.toLocaleString()}
- Current Status: ${getPressureLabel(prospect.pressureResponse)}

## WHY NOW — TIMING & URGENCY
${prospect.whyNow}

## KEY MARKET SIGNALS
${relatedSignals.length > 0 ? relatedSignals.map(s => `- [${s.sentiment?.toUpperCase()}] ${s.title} (Severity: ${s.severity}/5)\n  Impact: ${s.salesImplication}`).join("\n") : "No direct signals currently tracked."}

## DECISION MAKERS
${prospect.decisionMakers.map((d: any) => `- ${d.name}, ${d.title}`).join("\n")}

${prospect.competitors && prospect.competitors.length > 0 ? `## COMPETITIVE LANDSCAPE
${prospect.competitors.map((c: any) => `- ${c.name}: ${c.description}`).join("\n")}` : ""}

${prospect.recommendedServices && prospect.recommendedServices.length > 0 ? `## RECOMMENDED SERVICES TO HIGHLIGHT
${prospect.recommendedServices.map((s: any) => `- ${s.service}: ${s.rationale}`).join("\n")}` : ""}

${impactData ? `## INDUSTRY AI IMPACT
- Automation Rate: ${impactData.automationRate}%
- AI-Led Functions: ${impactData.aiLedFunctions.length}
- Collaborative Functions: ${impactData.collaborativeFunctions.length}
- Human-Led Functions: ${impactData.humanLedFunctions.length}` : ""}

${teamBlock}

${prospect.notes ? `## INTERNAL NOTES (DO NOT include in presentation, use for context)
${prospect.notes}` : ""}

## PRESENTATION STRUCTURE
1. Title Slide — Meeting with ${prospect.companyName}
2. Their World — Industry landscape and position
3. Market Forces — Key signals affecting their business right now
4. Why Now — The convergence of timing and opportunity
5. The Challenge — What they're up against
6. Our Understanding — Mirror their priorities
7. Our Approach — How we solve this specifically for them
8. Relevant Experience — Similar work, case studies
9. Proposed Engagement — Phased approach with clear milestones
10. Expected Outcomes — Measurable results
11. The Team — Who they'll work with (use team data above for names, titles, bios, and headshot placeholders)
12. Next Steps — Clear call to action

## STYLE GUIDELINES
- Professional, confident, not salesy
- Use their language and industry terminology
- Lead with their challenges, not our capabilities
- Include data points and specific signal references
- Keep text minimal, use visuals where possible
- End with a clear, specific next step`;
}

export default function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, isUsingSeedData } = useIntelligence();
  const { prospects, industries, signals, aiImpact } = data;
  const { persona, profile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Resolve prospect from intelligence data OR pipeline DB
  const { findProspect, loading: pipelineLoading } = usePipelineProspects(prospects);
  const prospect = findProspect(id);

  // Team data for presentations
  const { members: teamMembers } = useTeamMembers();

  // Track view — MUST be before any early returns to satisfy React hooks rules
  useEffect(() => {
    if (prospect) track(EVENTS.PROSPECT_VIEWED, { company: prospect.companyName, score: prospect.vigylScore });
  }, [prospect?.id]);

  // Derived data — safe to compute even if prospect is null (useMemo keeps hook order stable)
  const industry = useMemo(() => prospect
    ? industries.find(i => i.id === prospect.industryId)
      || industries.find(i => i.name.toLowerCase() === (prospect.industryId || "").toLowerCase())
    : undefined,
  [prospect, industries]);

  const relatedSignals = useMemo(() => prospect
    ? signals.filter(s => prospect.relatedSignals?.includes(s.id))
    : [],
  [prospect, signals]);

  const industrySignals = useMemo(() => prospect
    ? signals.filter(s => isSignalRelevantToIndustry(s, prospect.industryId)).filter(s => !prospect.relatedSignals?.includes(s.id))
    : [],
  [prospect, signals]);

  const industryProspects = useMemo(() => prospect
    ? prospects.filter(p => p.industryId === prospect.industryId && p.id !== prospect.id).sort((a, b) => b.vigylScore - a.vigylScore)
    : [],
  [prospect, prospects]);

  const impactData = useMemo(() => prospect
    ? aiImpact?.find(a => a.industryId === prospect.industryId || a.industryName?.toLowerCase() === industry?.name?.toLowerCase())
    : undefined,
  [prospect, aiImpact, industry]);

  const stageIdx = prospect ? stageOrder.indexOf(prospect.pipelineStage) : -1;

  // Contacts with LinkedIn URL fixing (enrichment happens inside ProspectContacts)
  const displayContacts = useMemo(() => {
    if (!prospect) return [];
    return prospect.decisionMakers.map(dm => ({
      ...dm,
      linkedinUrl: dm.linkedinUrl && dm.linkedinUrl !== "#"
        ? dm.linkedinUrl
        : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${dm.title} ${prospect.companyName}`)}`,
    }));
  }, [prospect]);

  // Build Argus context
  const argusContext = prospect ? `Prospect Dossier: ${prospect.companyName}
Industry: ${industry?.name || "Unknown"}
VIGYL Score: ${prospect.vigylScore}/100
Revenue: ${prospect.annualRevenue}
Employees: ${prospect.employeeCount.toLocaleString()}
Location: ${prospect.location.city}, ${prospect.location.state}
Pipeline Stage: ${pipelineStageLabels[prospect.pipelineStage]}
Pressure Response: ${getPressureLabel(prospect.pressureResponse)}
Why Now: ${prospect.whyNow}
Decision Makers: ${displayContacts.map(d => `${d.name} (${d.title})${d.verified ? " [verified]" : " [suggested role]"}`).join(", ")}
Notes: ${prospect.notes || "None"}
Related Signals: ${relatedSignals.map(s => `${s.title} (${s.sentiment}, severity ${s.severity}/5)`).join("; ") || "None"}
${prospect.competitors ? `Competitors: ${prospect.competitors.map(c => c.name).join(", ")}` : ""}
${impactData ? `Industry AI Automation: ${impactData.automationRate}%, Opportunity Index: ${impactData.collaborativeOpportunityIndex}` : ""}` : "";

  // ── Early returns AFTER all hooks ──

  // If prospect not found but still loading or using seed data, show loading
  if (!prospect && (loading || isUsingSeedData || pipelineLoading)) {
    return (
      <IntelligenceLoader>
        <DashboardLayout>
          <div className="space-y-4">
            <Link to="/prospects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading prospect dossier...</p>
              <p className="text-xs text-muted-foreground/60">Your personalized data is still generating.</p>
            </div>
          </div>
        </DashboardLayout>
      </IntelligenceLoader>
    );
  }

  if (!prospect) return <Navigate to="/prospects" replace />;

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Back nav */}
          <Link to="/prospects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          {/* Hero card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{prospect.companyName}</h1>
                  {prospect.isDreamClient && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      <Star className="h-3 w-3" /> Dream Client
                    </span>
                  )}
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    prospect.pressureResponse === "growth_mode" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" :
                    prospect.pressureResponse === "contracting" ? "bg-rose-100 text-rose-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {getPressureLabel(prospect.pressureResponse)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{industry?.name}</p>

                <div className="flex flex-wrap gap-3 mt-4">
                  <MetricPill icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={`${prospect.location.city}, ${prospect.location.state}`} />
                  <MetricPill icon={<DollarSign className="h-3.5 w-3.5" />} label="Revenue" value={prospect.annualRevenue} />
                  <MetricPill icon={<Users className="h-3.5 w-3.5" />} label="Employees" value={prospect.employeeCount.toLocaleString()} />
                  <MetricPill icon={<Briefcase className="h-3.5 w-3.5" />} label="Pipeline" value={pipelineStageLabels[prospect.pipelineStage]} />
                  {prospect.lastContacted && (
                    <MetricPill icon={<Calendar className="h-3.5 w-3.5" />} label="Last Contact" value={new Date(prospect.lastContacted).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <ScoreRing score={prospect.vigylScore} />
                <p className="text-[9px] text-center text-muted-foreground mt-1">{persona.scoreLabel}</p>
              </div>
            </div>

            {/* Pipeline progress */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                {stageOrder.filter(s => s !== "lost").map((stage, i) => {
                  const isActive = stageOrder.indexOf(stage) <= stageIdx && prospect.pipelineStage !== "lost";
                  const isCurrent = stage === prospect.pipelineStage;
                  return (
                    <div key={stage} className="flex items-center gap-1 flex-1">
                      <div className={`h-1.5 flex-1 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-border"}`} />
                      {isCurrent && (
                        <span className="text-[8px] font-bold text-primary uppercase tracking-wider whitespace-nowrap">{pipelineStageLabels[stage]}</span>
                      )}
                    </div>
                  );
                })}
                {prospect.pipelineStage === "lost" && <span className="text-[8px] font-bold text-rose-500 uppercase">Lost</span>}
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {/* 1. Track This */}
              <CrmPushButton prospect={prospect} industryName={industry?.name} variant="full" />

              {/* 2. Run Report */}
              <button
                onClick={() => setShowReport(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" /> Run Report
              </button>

              {/* 3. Generate Outreach */}
              <Link to={`/outreach?prospect=${prospect.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                <PenTool className="h-3.5 w-3.5" /> Generate Outreach
              </Link>

              {/* 4. Find Competitors */}
              {prospect.competitors && prospect.competitors.length > 0 ? (
                <a href="#competitors"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Crosshair className="h-3.5 w-3.5" /> Competitors ({prospect.competitors.length})
                </a>
              ) : (
                <AskArgus
                  context={`Find competitors for ${prospect.companyName} in ${industry?.name || "their industry"}. ${argusContext}`}
                  label="Find Competitors"
                  greeting={`Let me find competitors for ${prospect.companyName}. I'll look at companies offering similar services in ${industry?.name || "their industry"}.`}
                />
              )}
            </div>

            {/* Secondary actions */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <AskArgus context={argusContext} label={prospect.companyName}
                greeting={`I'm looking at the full dossier for ${prospect.companyName} (VIGYL Score: ${prospect.vigylScore}). They're a ${prospect.annualRevenue} ${industry?.name || ""} company with ${prospect.employeeCount.toLocaleString()} employees. What would you like to explore?`} />
              {prospect.websiteUrl && (
                <a href={prospect.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}

              {/* Generate Presentation Prompt */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Presentation className="h-3.5 w-3.5" /> Deck Prompt
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Presentation className="h-5 w-5 text-primary" />
                      Presentation Prompt for {prospect.companyName}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">Copy this prompt into ChatGPT, Claude, or any AI tool to generate a client-facing presentation.</p>
                  </DialogHeader>
                  <div className="relative mt-3">
                    <button
                      onClick={() => {
                        const prompt = buildPresentationPrompt(prospect, industry, relatedSignals, impactData, teamMembers);
                        navigator.clipboard.writeText(prompt);
                        setCopied(true);
                        toast({ title: "Prompt copied to clipboard!" });
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors z-10"
                    >
                      {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Prompt</>}
                    </button>
                    <pre className="rounded-lg bg-secondary/50 border border-border p-4 pr-24 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                      {buildPresentationPrompt(prospect, industry, relatedSignals, impactData, teamMembers)}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Client Report Modal */}
            {showReport && (
              <ClientReport
                prospect={prospect}
                industry={industry}
                signals={data.signals}
                aiImpact={impactData}
                userProfile={profile}
                onClose={() => setShowReport(false)}
              />
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Why Now */}
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader icon={<Clock className="h-4 w-4 text-primary" />} title={persona.whyNowLabel} />
                <p className="text-sm text-foreground leading-relaxed">{prospect.whyNow}</p>
              </div>

              {/* Key Contacts */}
              <ProspectContacts
                companyName={prospect.companyName}
                industryName={industry?.name}
                whyNow={prospect.whyNow}
                contacts={prospect.decisionMakers}
              />

              {/* Related Signals */}
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader icon={<Radio className="h-4 w-4 text-primary" />} title="Direct Signals" badge={`${relatedSignals.length}`} />
                {relatedSignals.length > 0 ? (
                  <div className="space-y-2">
                    {relatedSignals.map(s => (
                      <div key={s.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${s.sentiment === "positive" ? "bg-emerald-500" : s.sentiment === "negative" ? "bg-rose-500" : "bg-slate-400"}`} />
                          <span className="text-xs font-semibold text-foreground">{s.title}</span>
                          <span className="text-[9px] rounded-full bg-secondary px-1.5 py-0.5 text-muted-foreground">{s.severity}/5</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed ml-4">{s.salesImplication}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No directly linked signals. See industry signals below.</p>
                )}

                {industrySignals.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Other {industry?.name} signals ({industrySignals.length})
                    </p>
                    <div className="space-y-1.5">
                      {industrySignals.slice(0, 4).map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.sentiment === "positive" ? "bg-emerald-500" : s.sentiment === "negative" ? "bg-rose-500" : "bg-slate-400"}`} />
                          <span className="text-[11px] text-muted-foreground truncate">{s.title}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{getSignalTypeLabel(s.signalType)}</span>
                        </div>
                      ))}
                      {industrySignals.length > 4 && (
                        <Link to="/signals" className="text-[10px] text-primary font-medium hover:underline">
                          View all {industrySignals.length} signals →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Competitors */}
              {prospect.competitors && prospect.competitors.length > 0 && (
                <div id="competitors" className="rounded-xl border border-border bg-card p-5">
                  <SectionHeader icon={<Swords className="h-4 w-4 text-primary" />} title="Competitive Landscape" badge={`${prospect.competitors.length}`} />
                  <div className="space-y-2">
                    {prospect.competitors.map((c, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="text-xs font-semibold text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Services */}
              {prospect.recommendedServices && prospect.recommendedServices.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <SectionHeader icon={<Lightbulb className="h-4 w-4 text-primary" />} title="Recommended Services" badge={`${prospect.recommendedServices.length}`} />
                  <div className="space-y-2">
                    {prospect.recommendedServices.map((svc, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="text-xs font-semibold text-foreground">{svc.service}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{svc.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Links */}
              {prospect.relatedLinks && prospect.relatedLinks.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <SectionHeader icon={<LinkIcon className="h-4 w-4 text-primary" />} title="Related Links" />
                  <div className="space-y-1.5">
                    {prospect.relatedLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:bg-accent/50 transition-colors group">
                        <span className="text-xs font-medium text-foreground group-hover:text-primary">{link.title}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <ProspectDetailSidebar
              prospect={prospect}
              displayContacts={displayContacts}
              relatedSignals={relatedSignals}
              industry={industry}
              impactData={impactData}
              industryProspects={industryProspects}
            />
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
