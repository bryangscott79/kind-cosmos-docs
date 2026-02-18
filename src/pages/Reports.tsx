import { useState } from "react";
import { FileText, Building2, Users, BarChart3, Calendar, Sparkles, Lock, ArrowRight, Loader2, Download, Brain } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasAccess } from "@/lib/tiers";

const reportTypes = [
  {
    id: "industry_deep_dive",
    icon: Building2,
    title: "Industry Deep Dive",
    description: "Full analysis of one industry — AI impact, value chain, active signals, prospect landscape, and strategic recommendations.",
    tier: "pro" as const,
    estimatedTime: "30 seconds",
    dataPoints: "200+",
  },
  {
    id: "prospect_dossier",
    icon: Users,
    title: "Prospect Dossier",
    description: "Complete profile of a prospect — company background, why-now triggers, related signals, decision makers, and recommended outreach approach.",
    tier: "starter" as const,
    estimatedTime: "15 seconds",
    dataPoints: "50+",
  },
  {
    id: "competitive_landscape",
    icon: BarChart3,
    title: "Competitive Landscape",
    description: "Compare target industries side-by-side — automation rates, opportunity zones, workforce impact, and market positioning.",
    tier: "pro" as const,
    estimatedTime: "45 seconds",
    dataPoints: "500+",
  },
  {
    id: "weekly_brief",
    icon: Calendar,
    title: "Weekly Intelligence Brief",
    description: "Auto-generated summary of the week's most important signals, prospect movements, and industry changes across your tracked sectors.",
    tier: "starter" as const,
    estimatedTime: "20 seconds",
    dataPoints: "100+",
  },
  {
    id: "ai_readiness",
    icon: Brain,
    title: "AI Readiness Assessment",
    description: "Evaluate how prepared a specific industry or prospect is for AI transformation — gaps, opportunities, and recommended solutions to sell.",
    tier: "pro" as const,
    estimatedTime: "30 seconds",
    dataPoints: "150+",
  },
];

export default function Reports() {
  const { data } = useIntelligence();
  const { tier } = useAuth();
  const { industries, prospects } = data;
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProspect, setSelectedProspect] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // TODO: Call edge function to generate report
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
  };

  const activeReport = reportTypes.find((r) => r.id === selectedReport);
  const needsIndustry = selectedReport === "industry_deep_dive" || selectedReport === "ai_readiness";
  const needsProspect = selectedReport === "prospect_dossier";
  const canGenerate = selectedReport && (
    (needsIndustry && selectedIndustry) ||
    (needsProspect && selectedProspect) ||
    (!needsIndustry && !needsProspect)
  );

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
              Generate in-depth reports from {data.signals.length} signals, {data.industries.length} industries, and {data.prospects.length} prospects.
            </p>
          </div>

          {/* Report type grid */}
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
                  className={`relative rounded-xl border text-left p-4 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                      : locked
                      ? "border-border bg-card opacity-60 cursor-not-allowed"
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
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{report.dataPoints} data points</span>
                    <span>·</span>
                    <span>~{report.estimatedTime}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Configuration panel */}
          {selectedReport && activeReport && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Configure: {activeReport.title}
              </h3>
              <div className="space-y-3">
                {needsIndustry && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Industry</label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Choose an industry...</option>
                      {industries.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {needsProspect && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Prospect</label>
                    <select
                      value={selectedProspect}
                      onChange={(e) => setSelectedProspect(e.target.value)}
                      className="w-full max-w-sm rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Choose a prospect...</option>
                      {prospects.sort((a, b) => b.vigylScore - a.vigylScore).map((p) => (
                        <option key={p.id} value={p.id}>{p.companyName} (Score: {p.vigylScore})</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate || generating}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </div>
          )}

          {/* Previous reports placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Previous Reports</h3>
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No reports generated yet. Select a report type above to get started.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
