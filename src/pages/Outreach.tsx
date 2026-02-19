import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Copy, Check, Send, Sparkles, Kanban, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePipelineProspects } from "@/hooks/usePipelineProspects";
import { supabase } from "@/integrations/supabase/client";
import { getScoreColor, getPressureLabel, getPressureColor } from "@/data/mockData";
import { getStageLabels } from "@/lib/personas";
import { track, EVENTS } from "@/lib/analytics";

const CONTENT_TYPE_MAP: Record<string, { value: string; label: string }[]> = {
  job_seeker: [
    { value: "cover_letter", label: "Cover Letter" },
    { value: "linkedin_message", label: "LinkedIn Message" },
    { value: "interview_prep", label: "Interview Prep" },
    { value: "engagement_post", label: "Engagement Post" },
  ],
  default: [
    { value: "cold_email", label: "Cold Email" },
    { value: "follow_up", label: "Follow-Up" },
    { value: "linkedin_message", label: "LinkedIn Message" },
    { value: "meeting_brief", label: "Meeting Brief" },
    { value: "engagement_post", label: "Engagement Post" },
  ],
};

export default function Outreach() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("prospect");
  const { data } = useIntelligence();
  const { prospects: intelProspects, industries, signals } = data;
  const { persona, profile } = useAuth();
  const stageLabels = useMemo(() => getStageLabels(persona), [persona]);
  const contentTypes = CONTENT_TYPE_MAP[persona.key] || CONTENT_TYPE_MAP.default;

  // Merge intelligence prospects with DB pipeline items
  const { allProspects } = usePipelineProspects(intelProspects);

  const [selectedProspectId, setSelectedProspectId] = useState(preselectedId || allProspects[0]?.id || "");
  const [contentType, setContentType] = useState<string>(contentTypes[0]?.value || "cold_email");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [markedSent, setMarkedSent] = useState(false);
  const [genError, setGenError] = useState("");

  const selectedProspect = allProspects.find((p) => p.id === selectedProspectId);

  // Auto-select first prospect when list loads (if no preselection or preselection not found)
  useEffect(() => {
    if (!selectedProspect && allProspects.length > 0 && !preselectedId) {
      setSelectedProspectId(allProspects[0].id);
    }
  }, [selectedProspect, allProspects, preselectedId]);

  const industry = selectedProspect 
    ? (industries.find((i) => i.id === selectedProspect.industryId)
      || industries.find((i) => i.name.toLowerCase() === (selectedProspect.industryId || "").toLowerCase()))
    : null;
  const relatedSignals = selectedProspect
    ? signals.filter((s) => (selectedProspect.relatedSignals || []).includes(s.id))
    : [];

  const handleGenerate = async () => {
    if (!selectedProspect) return;
    setGenerating(true);
    setGenError("");
    setGeneratedContent("");
    setGeneratedSubject("");
    setMarkedSent(false);

    try {
      const { data: result, error } = await supabase.functions.invoke("generate-outreach", {
        body: {
          prospect: {
            companyName: selectedProspect.companyName,
            whyNow: selectedProspect.whyNow,
            pressureResponse: selectedProspect.pressureResponse,
            decisionMakers: selectedProspect.decisionMakers,
            annualRevenue: selectedProspect.annualRevenue,
            employeeCount: selectedProspect.employeeCount,
            location: selectedProspect.location,
            vigylScore: selectedProspect.vigylScore,
          },
          industry: industry ? { name: industry.name, healthScore: industry.healthScore } : null,
          signals: relatedSignals.map((s) => ({
            title: s.title,
            summary: s.summary,
            salesImplication: s.salesImplication,
            signalType: s.signalType,
          })),
          contentType,
          userProfile: profile ? {
            company_name: profile.company_name,
            role_title: profile.role_title,
            business_summary: profile.business_summary,
            ai_summary: profile.ai_summary,
          } : null,
          persona: persona.key,
        },
      });

      if (error) throw error;
      setGeneratedSubject(result.subject || "");
      setGeneratedContent(result.body || "");
      track(EVENTS.OUTREACH_GENERATED, { company: selectedProspect.companyName, type: contentType });
    } catch (err: any) {
      console.error("Outreach generation failed:", err);
      setGenError("AI generation unavailable — using basic template.");
      const firstName = selectedProspect.decisionMakers[0]?.name?.split(" ")[0] || "there";
      if (contentType === "cold_email" || contentType === "cover_letter") {
        setGeneratedSubject(`Re: ${selectedProspect.companyName} — ${industry?.name || "Market"} Opportunity`);
        setGeneratedContent(`Hi ${firstName},\n\n${selectedProspect.whyNow}\n\nI'd love to discuss how this affects ${selectedProspect.companyName}'s strategy. Are you open to a quick conversation?\n\nBest,\n[Your Name]`);
      } else if (contentType === "linkedin_message") {
        setGeneratedContent(`Hi ${firstName} — ${selectedProspect.whyNow.split(".")[0].toLowerCase()}. Interesting time for ${selectedProspect.companyName}. Open to connecting?`);
      } else {
        setGeneratedContent(`## ${selectedProspect.companyName}\n\n**Industry:** ${industry?.name}\n**Why Now:** ${selectedProspect.whyNow}\n**Pressure Response:** ${getPressureLabel(selectedProspect.pressureResponse)}\n\n**Key signals:**\n${relatedSignals.map((s) => "- " + s.title).join("\n") || "No specific signals."}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText((generatedSubject ? `Subject: ${generatedSubject}\n\n` : "") + generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showSubjectLine = ["cold_email", "follow_up", "cover_letter"].includes(contentType);

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{persona.outreachLabel}</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI-generated content powered by your market intelligence</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr_260px]">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select {persona.prospectLabelSingular}</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1.5 lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[calc(100vh-220px)] lg:pb-0">
              {allProspects.map((p) => {
                const ind = industries.find((i) => i.id === p.industryId) || industries.find((i) => i.name.toLowerCase() === (p.industryId || "").toLowerCase());
                const isSelected = p.id === selectedProspectId;
                const isDbProspect = p.id.startsWith("db-");
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProspectId(p.id); setGeneratedContent(""); setGeneratedSubject(""); setMarkedSent(false); setGenError(""); }}
                    className={`shrink-0 text-left rounded-md border p-3 transition-colors lg:w-full min-w-[180px] lg:min-w-0 ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{p.companyName}</span>
                      <span className={`font-mono text-xs font-bold text-${getScoreColor(p.vigylScore)}`}>{p.vigylScore}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {ind?.name || p.industryId || "Uncategorized"}
                      {isDbProspect && <span className="ml-1.5 text-primary/60">★ added</span>}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {contentTypes.map((ct) => (
                <button key={ct.value} onClick={() => { setContentType(ct.value); setGeneratedContent(""); setGeneratedSubject(""); }} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${contentType === ct.value ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {ct.label}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-card">
              {showSubjectLine && (
                <div className="border-b border-border px-4 py-3">
                  <input type="text" placeholder="Subject line..." value={generatedSubject} onChange={(e) => setGeneratedSubject(e.target.value)} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </div>
              )}
              <textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} placeholder={`Click '${persona.outreachCTA}' to create AI-powered content...`} className="w-full min-h-[360px] resize-none bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed" />
            </div>

            {genError && (
              <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">{genError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={handleGenerate} disabled={generating || !selectedProspect} className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating..." : persona.outreachCTA}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} disabled={!generatedContent} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
                </button>
                <button onClick={() => setMarkedSent(true)} disabled={!generatedContent || markedSent}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${markedSent ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "border-border text-foreground hover:bg-accent"}`}>
                  {markedSent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                  {markedSent ? "Done ✓" : persona.key === "job_seeker" ? "Mark Applied" : "Mark Sent"}
                </button>
              </div>
            </div>
            {markedSent && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between">
                <p className="text-xs text-emerald-700"><span className="font-semibold">Logged.</span> {selectedProspect?.companyName} updated.</p>
                <Link to="/pipeline" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors">
                  <Kanban className="h-3 w-3" /> {persona.pipelineLabel}
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {selectedProspect && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{persona.prospectLabelSingular} Context</h3>
                <p className="text-sm font-semibold text-foreground">{selectedProspect.companyName}</p>
                <p className="text-xs text-muted-foreground mt-1">{industry?.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground">{persona.scoreLabel}</span>
                    <p className={`font-mono text-lg font-bold text-${getScoreColor(selectedProspect.vigylScore)}`}>{selectedProspect.vigylScore}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Response</span>
                    <p className={`text-xs font-medium text-${getPressureColor(selectedProspect.pressureResponse)}`}>{getPressureLabel(selectedProspect.pressureResponse)}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">{persona.whyNowLabel}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedProspect.whyNow}</p>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related Signals</h3>
              {relatedSignals.length > 0 ? (
                <div className="space-y-2.5">
                  {relatedSignals.map((s) => (
                    <div key={s.id} className="border-b border-border pb-2.5 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-foreground leading-snug">{s.title}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{s.summary.slice(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No signals linked.</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
