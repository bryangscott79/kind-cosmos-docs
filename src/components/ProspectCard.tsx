import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Linkedin, MapPin, DollarSign, Building2, Radio,
  ChevronDown, ExternalLink, ThumbsUp, ThumbsDown, Loader2,
  Globe, Swords, Mail, ArrowRight, Copy
} from "lucide-react";
import { Prospect, getPressureLabel, getScoreColorHsl } from "@/data/mockData";
import { useSavedSignals } from "@/hooks/useSavedSignals";
import { track, EVENTS } from "@/lib/analytics";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AskArgus from "@/components/AskArgus";
import CrmPushButton from "@/components/CrmPushButton";

interface ProspectCardProps {
  prospect: Prospect;
}

export default function ProspectCard({ prospect }: ProspectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const { getSavedForProspect } = useSavedSignals();
  const { data, isUsingSeedData } = useIntelligence();
  const { industries, signals: allSignals } = data;
  const { user, persona } = useAuth();
  const { toast } = useToast();

  const sendFeedback = async (type: "more" | "less") => {
    if (!user) return;
    setFeedbackSending(type);
    try {
      await supabase.from("prospect_feedback" as any).insert({
        user_id: user.id,
        prospect_company_name: prospect.companyName,
        prospect_industry: industries.find(i => i.id === prospect.industryId)?.name || prospect.industryId,
        feedback_type: type,
        prospect_data: { vigylScore: prospect.vigylScore, pressureResponse: prospect.pressureResponse, location: prospect.location, annualRevenue: prospect.annualRevenue },
      });
      setFeedbackGiven(type);
      toast({ title: type === "more" ? "👍 Got it!" : "👎 Noted!", description: type === "more" ? "We'll find more prospects like this." : "We'll show fewer like this." });
    } catch {
      toast({ title: "Couldn't save feedback", variant: "destructive" });
    } finally {
      setFeedbackSending(null);
    }
  };

  const industry = industries.find((i) => i.id === prospect.industryId);
  const scoreColor = getScoreColorHsl(prospect.vigylScore);
  const linkedSignals = getSavedForProspect(prospect.id);
  const relatedSignalObjects = prospect.relatedSignals
    .map((sid) => allSignals.find((s) => s.id === sid))
    .filter(Boolean);

  const pressureStyles: Record<string, string> = {
    growth_mode: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    strategic_investment: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    contracting: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className={`rounded-lg border bg-card transition-all ${expanded ? "border-primary/30 shadow-md" : "border-border hover:border-primary/20"} ${isUsingSeedData ? "opacity-60" : ""}`}>
      {isUsingSeedData && (
        <div className="px-5 pt-3 pb-0">
          <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-medium text-amber-600">Sample Data</span>
        </div>
      )}
      {/* ── CLICKABLE CARD BODY ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 cursor-pointer"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{prospect.companyName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{industry?.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />{prospect.location.city}, {prospect.location.state}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <DollarSign className="h-2.5 w-2.5" />{prospect.annualRevenue}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Building2 className="h-2.5 w-2.5" />{prospect.employeeCount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="font-mono text-xl font-bold relative group" style={{ color: scoreColor }}>
              {prospect.vigylScore}
              <span className="absolute right-0 top-full mt-1 z-30 hidden group-hover:block w-48 rounded-md border border-border bg-popover px-3 py-2 text-[10px] text-popover-foreground font-normal shadow-md leading-relaxed">
                {persona.scoreTip}
              </span>
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-medium border ${pressureStyles[prospect.pressureResponse]}`}>
              {getPressureLabel(prospect.pressureResponse)}
            </span>
          </div>
        </div>

        {/* Why Now snippet */}
        <div className="mt-3 rounded-md bg-secondary/60 p-2.5">
          <p className={`text-xs text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
            {prospect.whyNow}
          </p>
        </div>

        {/* Collapsed: quick preview */}
        {!expanded && (
          <div className="mt-3 flex items-center justify-between">
            {prospect.decisionMakers.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="h-2.5 w-2.5" />
                {prospect.decisionMakers.slice(0, 2).map(d => d.name.split(" ")[0]).join(", ")}
                {prospect.decisionMakers.length > 2 ? ` +${prospect.decisionMakers.length - 2}` : ""}
              </span>
            )}
            {relatedSignalObjects.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Radio className="h-2.5 w-2.5" />{relatedSignalObjects.length} signal{relatedSignalObjects.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Expand indicator */}
        <div className="mt-2 flex items-center justify-center">
          <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* ── EXPANDED CONTENT ── */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          {/* Key Contacts */}
          {prospect.decisionMakers.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Contacts</p>
              <div className="space-y-1.5">
                {prospect.decisionMakers.map((dm) => {
                  const url = dm.linkedinUrl && dm.linkedinUrl !== "#"
                    ? dm.linkedinUrl
                    : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${dm.title} ${prospect.companyName}`)}`;
                  return (
                    <div key={dm.name + dm.title} className="flex items-center justify-between rounded-md border border-border px-2.5 py-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium text-foreground">{dm.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate">· {dm.title}</span>
                        {dm.verified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1 py-0.5 text-[7px] font-medium text-emerald-600 shrink-0">✓</span>
                        )}
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-blue-600 transition-colors shrink-0" title={dm.verified ? "View on LinkedIn" : "Search LinkedIn"}>
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Signals */}
          {relatedSignalObjects.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Related Signals</p>
              <div className="space-y-1.5">
                {relatedSignalObjects.map((sig) => {
                  if (!sig) return null;
                  return (
                    <div key={sig.id} className="rounded-md border border-border bg-secondary/30 p-2.5">
                      <p className="text-xs font-semibold text-foreground">{sig.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{sig.salesImplication}</p>
                      {sig.sources && sig.sources.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {sig.sources.slice(0, 3).map((src, i) => (
                            <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-0.5 rounded-full bg-background border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-primary transition-colors">
                              {src.name} <ExternalLink className="h-2 w-2" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Competitors */}
          {prospect.competitors && prospect.competitors.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Swords className="h-3 w-3" /> Competitive Landscape
              </p>
              <div className="space-y-1.5">
                {prospect.competitors.map((comp, i) => (
                  <div key={i} className="rounded-md border border-border p-2.5">
                    <p className="text-xs font-semibold text-foreground">{comp.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Links */}
          {prospect.relatedLinks && prospect.relatedLinks.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Links & News</p>
              <div className="flex flex-wrap gap-1.5">
                {prospect.relatedLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                    {link.title} <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Saved signals */}
          {linkedSignals.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Saved Signals</p>
              <div className="space-y-1">
                {linkedSignals.map((saved) => {
                  const sig = allSignals.find((s) => s.id === saved.signal_id);
                  if (!sig) return null;
                  return (
                    <div key={saved.id} className="rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1.5">
                      <p className="text-[11px] font-medium text-foreground truncate">{sig.title}</p>
                      {saved.notes && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{saved.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground mr-auto">Prospect quality?</span>
            <button onClick={(e) => { e.stopPropagation(); sendFeedback("more"); }} disabled={!!feedbackGiven || !!feedbackSending}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                feedbackGiven === "more" ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/25"
                : "border border-border text-muted-foreground hover:text-green-600 hover:border-green-500/30 hover:bg-green-500/10"
              } disabled:opacity-50`}>
              {feedbackSending === "more" ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ThumbsUp className="h-2.5 w-2.5" />} More
            </button>
            <button onClick={(e) => { e.stopPropagation(); sendFeedback("less"); }} disabled={!!feedbackGiven || !!feedbackSending}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                feedbackGiven === "less" ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25"
                : "border border-border text-muted-foreground hover:text-red-600 hover:border-red-500/30 hover:bg-red-500/10"
              } disabled:opacity-50`}>
              {feedbackSending === "less" ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ThumbsDown className="h-2.5 w-2.5" />} Less
            </button>
          </div>

          {/* ── ACTIONS (only in expanded view) ── */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <Link to={`/prospects/${prospect.id}`} onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              {persona.dossierLabel} <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to={`/outreach?prospect=${prospect.id}`} onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              <Mail className="h-3 w-3" /> {persona.outreachLabel}
            </Link>
            <button onClick={async (e) => {
              e.stopPropagation();
              if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
              try {
                const { error } = await supabase.from("pipeline_items").insert({
                  user_id: user.id,
                  company_name: prospect.companyName,
                  industry_name: industry?.name || prospect.industryId,
                  pipeline_stage: "researching",
                  vigyl_score: prospect.vigylScore,
                  prospect_data: {
                    whyNow: prospect.whyNow,
                    annualRevenue: prospect.annualRevenue,
                    employeeCount: prospect.employeeCount,
                    location: prospect.location,
                    pressureResponse: prospect.pressureResponse,
                    decisionMakers: prospect.decisionMakers,
                    isDreamClient: prospect.isDreamClient || false,
                  },
                } as any);
                if (error) throw error;
                toast({ title: `Added to ${persona.pipelineLabel}`, description: `${prospect.companyName} added to Researching stage.` });
                track(EVENTS.PROSPECT_ADDED_TO_PIPELINE, { company: prospect.companyName, score: prospect.vigylScore });
              } catch (err: any) {
                toast({ title: "Failed to track", description: err.message, variant: "destructive" });
              }
            }}
              className="flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              {persona.addToPipelineLabel}
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <AskArgus
                compact
                context={`Prospect: ${prospect.companyName}\nIndustry: ${industry?.name || "Unknown"}\nVIGYL Score: ${prospect.vigylScore}/100\nRevenue: ${prospect.annualRevenue}\nEmployees: ${prospect.employeeCount.toLocaleString()}\nLocation: ${prospect.location.city}, ${prospect.location.state}\nPipeline Stage: ${prospect.pipelineStage}\nPressure Response: ${getPressureLabel(prospect.pressureResponse)}\nWhy Now: ${prospect.whyNow}\nDecision Makers: ${prospect.decisionMakers.map(d => `${d.name} (${d.title})`).join(", ")}\nNotes: ${prospect.notes || "None"}`}
                label={prospect.companyName}
                greeting={`I'm looking at ${prospect.companyName} (VIGYL Score: ${prospect.vigylScore}). They're a ${prospect.annualRevenue} company in ${industry?.name || "their industry"} with ${prospect.employeeCount.toLocaleString()} employees. What would you like to explore?`}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 w-full py-1">
            <CrmPushButton prospect={prospect} industryName={industry?.name} variant="compact" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                const text = [
                  `Company: ${prospect.companyName}`,
                  `Industry: ${industry?.name || "Unknown"}`,
                  `Revenue: ${prospect.annualRevenue}`,
                  `Employees: ${prospect.employeeCount.toLocaleString()}`,
                  `Location: ${prospect.location.city}, ${prospect.location.state}`,
                  `Score: ${prospect.vigylScore}/100`,
                  `Status: ${getPressureLabel(prospect.pressureResponse)}`,
                  `Why Now: ${prospect.whyNow}`,
                  prospect.decisionMakers.length > 0 ? `Contacts: ${prospect.decisionMakers.map(d => `${d.name} (${d.title})`).join("; ")}` : "",
                ].filter(Boolean).join("\n");
                navigator.clipboard.writeText(text);
                toast({ title: "Copied to clipboard", description: "Paste into your CRM or notes." });
              }}
              className="flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-2.5 w-2.5" /> Copy for CRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
