import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Send, Sparkles, Kanban, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { getScoreColor, getPressureLabel, getPressureColor, pipelineStageLabels } from "@/data/mockData";

const contentTypes = [
  { value: "cold_email", label: "Cold Email" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "linkedin_message", label: "LinkedIn Message" },
  { value: "meeting_brief", label: "Meeting Brief" },
  { value: "engagement_post", label: "Engagement Post" },
] as const;

export default function Outreach() {
  const { data } = useIntelligence();
  const { prospects, industries, signals } = data;

  const [selectedProspectId, setSelectedProspectId] = useState(prospects[0]?.id || "");
  const [contentType, setContentType] = useState<string>("cold_email");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [markedSent, setMarkedSent] = useState(false);

  const selectedProspect = prospects.find((p) => p.id === selectedProspectId);
  const industry = selectedProspect ? industries.find((i) => i.id === selectedProspect.industryId) : null;
  const relatedSignals = selectedProspect
    ? signals.filter((s) => selectedProspect.relatedSignals.includes(s.id))
    : [];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      if (contentType === "cold_email" && selectedProspect) {
        setGeneratedSubject(`Helping ${selectedProspect.companyName} capitalize on current market shifts`);
        setGeneratedContent(`Hi ${selectedProspect.decisionMakers[0]?.name?.split(" ")[0] || "there"},\n\nI noticed ${selectedProspect.companyName} is navigating some significant industry changes right now — ${selectedProspect.whyNow.split(".")[0].toLowerCase()}.\n\nWe work with companies in the ${industry?.name || "your"} space to turn these market shifts into competitive advantages. Our clients typically see a 30-40% improvement in their response time to regulatory and market changes.\n\nWould you be open to a brief conversation about how we could help ${selectedProspect.companyName} stay ahead of these developments?\n\nBest regards,\n[Your Name]`);
      } else if (contentType === "linkedin_message" && selectedProspect) {
        setGeneratedSubject("");
        setGeneratedContent(`Hi ${selectedProspect.decisionMakers[0]?.name?.split(" ")[0] || "there"} — I've been following the developments in ${industry?.name || "your industry"} closely. With ${selectedProspect.whyNow.split(".")[0].toLowerCase()}, it seems like an interesting time for ${selectedProspect.companyName}.\n\nI'd love to share some insights on how similar companies are navigating these changes. Open to connecting?`);
      } else {
        setGeneratedSubject("Meeting Preparation Brief");
        setGeneratedContent(`**Prospect:** ${selectedProspect?.companyName}\n**Industry:** ${industry?.name}\n**VIGYL Score:** ${selectedProspect?.vigylScore}/100\n**Pressure Response:** ${selectedProspect ? getPressureLabel(selectedProspect.pressureResponse) : "N/A"}\n\n**Key Context:**\n${selectedProspect?.whyNow}\n\n**Recommended Approach:**\nFocus on immediate ROI and quick implementation timeline given current market pressures.`);
      }
      setGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText((generatedSubject ? `Subject: ${generatedSubject}\n\n` : "") + generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outreach Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate signal-aware outreach content</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr_260px]">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Prospect</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1.5 lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[calc(100vh-220px)] lg:pb-0">
              {prospects.map((p) => {
                const ind = industries.find((i) => i.id === p.industryId);
                const isSelected = p.id === selectedProspectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProspectId(p.id); setGeneratedContent(""); setGeneratedSubject(""); setMarkedSent(false); }}
                    className={`shrink-0 text-left rounded-md border p-3 transition-colors lg:w-full min-w-[180px] lg:min-w-0 ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{p.companyName}</span>
                      <span className={`font-mono text-xs font-bold text-${getScoreColor(p.vigylScore)}`}>{p.vigylScore}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ind?.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {contentTypes.map((ct) => (
                <button key={ct.value} onClick={() => setContentType(ct.value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${contentType === ct.value ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {ct.label}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-card">
              {(contentType === "cold_email" || contentType === "follow_up") && (
                <div className="border-b border-border px-4 py-3">
                  <input type="text" placeholder="Subject line..." value={generatedSubject} onChange={(e) => setGeneratedSubject(e.target.value)} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </div>
              )}
              <textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} placeholder="Click 'Generate' to create AI-powered outreach content..." className="w-full min-h-[360px] resize-none bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={handleGenerate} disabled={generating || !selectedProspect} className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                <Sparkles className="h-4 w-4" />{generating ? "Generating..." : "Generate"}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} disabled={!generatedContent} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setMarkedSent(true)}
                  disabled={!generatedContent || markedSent}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    markedSent
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {markedSent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                  {markedSent ? "Sent ✓" : "Mark as Sent"}
                </button>
              </div>
            </div>
            {markedSent && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between">
                <p className="text-xs text-emerald-700">
                  <span className="font-semibold">Outreach logged.</span> {selectedProspect?.companyName} has been contacted.
                </p>
                <Link to="/pipeline" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
                  <Kanban className="h-3 w-3" /> View Pipeline
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {selectedProspect && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Prospect Context</h3>
                <p className="text-sm font-semibold text-foreground">{selectedProspect.companyName}</p>
                <p className="text-xs text-muted-foreground mt-1">{industry?.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground">VIGYL Score</span>
                    <p className={`font-mono text-lg font-bold text-${getScoreColor(selectedProspect.vigylScore)}`}>{selectedProspect.vigylScore}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Response</span>
                    <p className={`text-xs font-medium text-${getPressureColor(selectedProspect.pressureResponse)}`}>{getPressureLabel(selectedProspect.pressureResponse)}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-medium text-muted-foreground">Pipeline Stage</p>
                    <Link to="/pipeline" className="text-[10px] font-medium text-primary hover:text-primary/80 flex items-center gap-0.5">
                      <Kanban className="h-2.5 w-2.5" /> View
                    </Link>
                  </div>
                  <span className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {pipelineStageLabels[selectedProspect.pipelineStage]}
                  </span>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">Why Now</p>
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
                <p className="text-xs text-muted-foreground">No signals linked to this prospect.</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
