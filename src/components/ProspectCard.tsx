import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Linkedin, MapPin, DollarSign, Building2, Radio, ChevronDown, ChevronUp, ExternalLink, Briefcase, Zap, ThumbsUp, ThumbsDown, Loader2, Globe, Swords } from "lucide-react";
import { Prospect, getPressureLabel, getScoreColorHsl } from "@/data/mockData";
import { useSavedSignals } from "@/hooks/useSavedSignals";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProspectCardProps {
  prospect: Prospect;
}

export default function ProspectCard({ prospect }: ProspectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const { getSavedForProspect } = useSavedSignals();
  const { data } = useIntelligence();
  const { industries, signals: allSignals } = data;
  const { user } = useAuth();
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
    growth_mode: "bg-green-50 text-green-700 border-green-200",
    strategic_investment: "bg-yellow-50 text-yellow-700 border-yellow-200",
    contracting: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{prospect.companyName}</h3>
            {prospect.websiteUrl && (
              <a
                href={prospect.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Visit website"
              >
                <Globe className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{industry?.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{prospect.location.city}, {prospect.location.state}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{prospect.annualRevenue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{prospect.employeeCount.toLocaleString()} employees</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-mono text-xl font-bold" style={{ color: scoreColor }}>{prospect.vigylScore}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${pressureStyles[prospect.pressureResponse]}`}>
            {getPressureLabel(prospect.pressureResponse)}
          </span>
        </div>
      </div>

      {/* Why Now */}
      <div className="mt-3 rounded-md bg-secondary p-3">
        <p className="text-xs font-medium text-foreground mb-1">Why Now</p>
        <p className={`text-xs text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
          {prospect.whyNow}
        </p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      >
        {expanded ? (
          <>Show Less <ChevronUp className="h-3 w-3" /></>
        ) : (
          <>Show More <ChevronDown className="h-3 w-3" /></>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-1 space-y-4">
          {/* Competitors */}
          {prospect.competitors && prospect.competitors.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Swords className="h-3 w-3" /> Competitive Landscape
              </p>
              <div className="space-y-1.5">
                {prospect.competitors.map((comp, i) => (
                  <div key={i} className="rounded-md border border-orange-200/50 bg-orange-50/30 dark:border-orange-500/20 dark:bg-orange-500/5 p-2.5">
                    <p className="text-xs font-semibold text-foreground">{comp.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Links & Articles */}
          {prospect.relatedLinks && prospect.relatedLinks.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Company Links & News
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prospect.relatedLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 rounded-full bg-background border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    {link.title}
                    <ExternalLink className="h-2 w-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Services */}
          {prospect.recommendedServices && prospect.recommendedServices.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Services to Sell
              </p>
              <div className="space-y-2">
                {prospect.recommendedServices.map((svc, i) => {
                  const linkedSig = svc.linkedSignalId
                    ? allSignals.find((s) => s.id === svc.linkedSignalId)
                    : null;
                  return (
                    <div key={i} className="rounded-md border border-primary/15 bg-primary/5 p-2.5">
                      <p className="text-xs font-semibold text-foreground">{svc.service}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{svc.rationale}</p>
                      {linkedSig && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary">
                          <Zap className="h-2.5 w-2.5" />
                          <span className="font-medium">Signal:</span>
                          <span className="truncate">{linkedSig.title}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Signals with Sources */}
          {relatedSignalObjects.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Radio className="h-3 w-3" /> Related Signals & Sources
              </p>
              <div className="space-y-2">
                {relatedSignalObjects.map((sig) => {
                  if (!sig) return null;
                  return (
                    <div key={sig.id} className="rounded-md border border-border bg-secondary/50 p-2.5">
                      <p className="text-xs font-semibold text-foreground">{sig.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{sig.salesImplication}</p>
                      {sig.sources && sig.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {sig.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 rounded-full bg-background border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                            >
                              {src.name}
                              <ExternalLink className="h-2 w-2" />
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

          {/* Decision Makers */}
          {prospect.decisionMakers.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Decision Makers</p>
              <div className="space-y-1">
                {prospect.decisionMakers.map((dm) => (
                  <div key={dm.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-foreground">{dm.name}</span>
                      <span className="text-[10px] text-muted-foreground">· {dm.title}</span>
                    </div>
                    <Linkedin className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed decision makers */}
      {!expanded && prospect.decisionMakers.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Decision Makers</p>
          <div className="space-y-1">
            {prospect.decisionMakers.slice(0, 2).map((dm) => (
              <div key={dm.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{dm.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {dm.title}</span>
                </div>
                <Linkedin className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      )}

      {linkedSignals.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <Radio className="h-3 w-3" /> Saved Signals
          </p>
          <div className="space-y-1">
            {linkedSignals.map((saved) => {
              const sig = allSignals.find((s) => s.id === saved.signal_id);
              if (!sig) return null;
              return (
                <div key={saved.id} className="rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1.5">
                  <p className="text-[11px] font-medium text-foreground leading-snug truncate">{sig.title}</p>
                  {saved.notes && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{saved.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback buttons */}
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <span className="text-[10px] text-muted-foreground mr-auto">Prospect quality?</span>
        <button
          onClick={() => sendFeedback("more")}
          disabled={!!feedbackGiven || !!feedbackSending}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            feedbackGiven === "more"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "border border-border bg-card text-muted-foreground hover:text-green-700 hover:border-green-200 hover:bg-green-50"
          } disabled:opacity-50`}
        >
          {feedbackSending === "more" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}
          More like this
        </button>
        <button
          onClick={() => sendFeedback("less")}
          disabled={!!feedbackGiven || !!feedbackSending}
          className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
            feedbackGiven === "less"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "border border-border bg-card text-muted-foreground hover:text-red-700 hover:border-red-200 hover:bg-red-50"
          } disabled:opacity-50`}
        >
          {feedbackSending === "less" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsDown className="h-3 w-3" />}
          Less like this
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link to={`/outreach?prospect=${prospect.id}`} className="flex-1 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-1.5 text-center text-xs font-medium text-white transition-opacity hover:opacity-90">
          Generate Outreach
        </Link>
        <button className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
          Add to Pipeline
        </button>
      </div>
    </div>
  );
}
