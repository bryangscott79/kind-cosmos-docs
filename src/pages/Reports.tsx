import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Building2, Users, BarChart3, Calendar, Sparkles, Lock, ArrowRight,
  Loader2, Brain, ArrowLeft, User, Printer, Copy
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";
import type { Industry, Prospect, AIImpactAnalysis } from "@/data/mockData";
import AskArgus from "@/components/AskArgus";
import { track, EVENTS } from "@/lib/analytics";
import {
  ReportSection, MetricCard, RecommendationCard,
  generateIndustryDeepDive, generateProspectDossier,
  generateWeeklyBrief, generateCompetitiveLandscape, generateAIReadiness,
} from "@/components/reports/ReportGenerators";
import { useReportHistory } from "@/hooks/useReportHistory";

// ─── Report type config ───
const reportTypes = [
  { id: "industry_deep_dive", icon: Building2, title: "Industry Deep Dive", description: "Full analysis of one industry — AI impact, value chain, active signals, prospect landscape, and strategic recommendations.", tier: "pro" as const, estimatedTime: "30 seconds", dataPoints: "200+" },
  { id: "prospect_dossier", icon: Users, title: "Prospect Dossier", description: "Complete profile of a prospect — company background, why-now triggers, related signals, decision makers, and recommended outreach approach.", tier: "starter" as const, estimatedTime: "15 seconds", dataPoints: "50+" },
  { id: "competitive_landscape", icon: BarChart3, title: "Competitive Landscape", description: "Compare target industries side-by-side — automation rates, opportunity zones, workforce impact, and market positioning.", tier: "pro" as const, estimatedTime: "45 seconds", dataPoints: "500+" },
  { id: "weekly_brief", icon: Calendar, title: "Weekly Intelligence Brief", description: "Auto-generated summary of the week's most important signals, prospect movements, and industry changes across your tracked sectors.", tier: "starter" as const, estimatedTime: "20 seconds", dataPoints: "100+" },
  { id: "ai_readiness", icon: Brain, title: "AI Readiness Assessment", description: "Evaluate how prepared a specific industry or prospect is for AI transformation — gaps, opportunities, and recommended solutions to sell.", tier: "pro" as const, estimatedTime: "30 seconds", dataPoints: "150+" },
];

// ─── Generated report type ───
interface GeneratedReport {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  content: React.ReactNode;
}


// ─── Main Reports Page ───
export default function Reports() {
  const { data } = useIntelligence();
  const { tier, persona } = useAuth();
  const { industries, prospects, signals, aiImpact } = data;
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProspect, setSelectedProspect] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [viewingReport, setViewingReport] = useState<GeneratedReport | null>(null);
  const { entries: reportHistory, addEntry: addHistoryEntry, clearHistory } = useReportHistory();

  const activeReport = reportTypes.find((r) => r.id === selectedReport);
  const needsIndustry = selectedReport === "industry_deep_dive" || selectedReport === "ai_readiness";
  const needsProspect = selectedReport === "prospect_dossier";
  const canGenerate = selectedReport && (
    (needsIndustry && selectedIndustry) ||
    (needsProspect && selectedProspect) ||
    (!needsIndustry && !needsProspect)
  );

  const handleGenerate = async () => {
    if (!selectedReport || !activeReport) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200)); // Brief animation

    let content: React.ReactNode = null;
    let title = activeReport.title;

    switch (selectedReport) {
      case "industry_deep_dive": {
        const ind = industries.find(i => i.id === selectedIndustry);
        if (ind) {
          const ai = aiImpact?.find(a => a.industryId === ind.id || a.industryName.toLowerCase() === ind.name.toLowerCase());
          content = generateIndustryDeepDive(ind, signals, prospects, ai);
          title = `Industry Deep Dive: ${ind.name}`;
        }
        break;
      }
      case "prospect_dossier": {
        const pros = prospects.find(p => p.id === selectedProspect);
        if (pros) {
          const ind = industries.find(i => i.id === pros.industryId);
          const ai = aiImpact?.find(a => a.industryId === pros.industryId);
          content = generateProspectDossier(pros, ind, signals, ai);
          title = `Prospect Dossier: ${pros.companyName}`;
        }
        break;
      }
      case "competitive_landscape":
        content = generateCompetitiveLandscape(industries, signals, prospects, aiImpact || []);
        title = "Competitive Landscape Report";
        break;
      case "weekly_brief":
        content = generateWeeklyBrief(industries, signals, prospects);
        title = `Weekly Intelligence Brief — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
        break;
      case "ai_readiness": {
        const ind = industries.find(i => i.id === selectedIndustry);
        if (ind) {
          const ai = aiImpact?.find(a => a.industryId === ind.id || a.industryName.toLowerCase() === ind.name.toLowerCase());
          content = generateAIReadiness(ind, ai, prospects);
          title = `AI Readiness Assessment: ${ind.name}`;
        }
        break;
      }
    }

    if (content) {
      const report: GeneratedReport = {
        id: `r-${Date.now()}`,
        type: selectedReport,
        title,
        createdAt: new Date().toISOString(),
        content,
      };
      setGeneratedReports(prev => [report, ...prev]);
      setViewingReport(report);
      track(EVENTS.REPORT_GENERATED, { type: selectedReport, title });
      addHistoryEntry(selectedReport, title, {
        industryId: selectedIndustry || undefined,
        prospectId: selectedProspect || undefined,
      });
    }
    setGenerating(false);
    setSelectedReport(null);
  };

  // ─── Viewing a report ───
  if (viewingReport) {
    return (
      <IntelligenceLoader>
        <DashboardLayout>
          <div className="space-y-4">
            <button onClick={() => setViewingReport(null)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Reports
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-foreground">{viewingReport.title}</h1>
                <p className="text-[10px] text-muted-foreground mt-1">Generated {new Date(viewingReport.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const el = document.getElementById("report-content");
                    if (el) {
                      const text = el.innerText;
                      navigator.clipboard.writeText(`${viewingReport.title}\n${new Date(viewingReport.createdAt).toLocaleString()}\n\n${text}`);
                      track(EVENTS.REPORT_SHARED, { type: viewingReport.type, method: "copy" });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
                <button
                  onClick={() => { window.print(); track(EVENTS.REPORT_EXPORTED, { type: viewingReport.type, method: "print" }); }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Printer className="h-3 w-3" /> Print / PDF
                </button>
                <AskArgus
                  context={`Report: ${viewingReport.title}\nType: ${viewingReport.type}\nGenerated: ${new Date(viewingReport.createdAt).toLocaleString()}\n\nThis is a ${viewingReport.type.replace(/_/g, " ")} report from the VIGYL platform. The user is viewing this report and may want to discuss strategy, drill deeper into specific findings, or get actionable next steps.`}
                  label={viewingReport.title}
                  greeting={`I can see your ${viewingReport.title.split(":")[0]}. What would you like to dig into? I can help with strategy, talking points, competitive angles, or next steps.`}
                  compact
                />
              </div>
            </div>
            <div id="report-content" className="rounded-xl border border-border bg-card p-6 print:border-0 print:shadow-none">
              {viewingReport.content}
            </div>
          </div>
        </DashboardLayout>
      </IntelligenceLoader>
    );
  }

  // ─── Report selection view ───
  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Reports</h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate in-depth reports from {signals.length} signals, {industries.length} industries, and {prospects.length} prospects.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const locked = !hasAccess(tier, report.tier);
              const isSelected = selectedReport === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => !locked && setSelectedReport(isSelected ? null : report.id)}
                  disabled={locked}
                  className={`relative rounded-xl border text-left p-4 transition-all min-h-[180px] flex flex-col ${
                    isSelected ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                    : locked ? "border-border bg-card opacity-60 cursor-not-allowed"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm cursor-pointer"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{report.title}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{report.description}</p>
                  <div className="flex-grow" />
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{report.dataPoints} data points</span><span>·</span><span>~{report.estimatedTime}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedReport && activeReport && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Configure: {activeReport.title}</h3>
              <div className="space-y-3">
                {needsIndustry && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Industry</label>
                    <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Choose an industry...</option>
                      {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                )}
                {needsProspect && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Prospect</label>
                    <select value={selectedProspect} onChange={(e) => setSelectedProspect(e.target.value)} className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Choose a prospect...</option>
                      {prospects.sort((a, b) => b.vigylScore - a.vigylScore).map((p) => <option key={p.id} value={p.id}>{p.companyName} (Score: {p.vigylScore})</option>)}
                    </select>
                  </div>
                )}
                <button onClick={handleGenerate} disabled={!canGenerate || generating} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {generatedReports.length > 0 ? `This Session (${generatedReports.length})` : "Report History"}
              </h3>
              {reportHistory.length > 0 && generatedReports.length === 0 && (
                <button onClick={clearHistory} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Clear</button>
              )}
            </div>
            {generatedReports.length > 0 ? (
              <div className="space-y-2">
                {generatedReports.map(report => {
                  const typeConfig = reportTypes.find(r => r.id === report.type);
                  const Icon = typeConfig?.icon || FileText;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setViewingReport(report)}
                      className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{report.title}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : reportHistory.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground mb-2">Previously generated — click to regenerate</p>
                {reportHistory.slice(0, 8).map(entry => {
                  const typeConfig = reportTypes.find(r => r.id === entry.type);
                  const Icon = typeConfig?.icon || FileText;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => {
                        setSelectedReport(entry.type);
                        if (entry.params.industryId) setSelectedIndustry(entry.params.industryId);
                        if (entry.params.prospectId) setSelectedProspect(entry.params.prospectId);
                      }}
                      className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{entry.title}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No reports generated yet. Select a report type above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
