import { useRef } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";
import type { AIImpactAnalysis } from "@/data/mockData";
import { useState } from "react";

interface ShareableAIReportProps {
  analysis: AIImpactAnalysis;
  onClose: () => void;
}

export default function ShareableAIReport({ analysis, onClose }: ShareableAIReportProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const total = analysis.aiLedFunctions.length + analysis.humanLedFunctions.length + analysis.collaborativeFunctions.length;
  const aiPct = total ? Math.round((analysis.aiLedFunctions.length / total) * 100) : 0;
  const collabPct = total ? Math.round((analysis.collaborativeFunctions.length / total) * 100) : 0;
  const humanPct = total ? Math.round((analysis.humanLedFunctions.length / total) * 100) : 0;

  const topAI = analysis.aiLedFunctions.slice(0, 3);
  const topHuman = analysis.humanLedFunctions.slice(0, 3);
  const topCollab = analysis.collaborativeFunctions.slice(0, 3);

  const copyText = () => {
    const text = `🤖 State of AI in ${analysis.industryName}

📊 Automation Rate: ${analysis.automationRate}%
🔴 AI-Led Functions: ${analysis.aiLedFunctions.length} (${aiPct}%)
🟣 Collaborative Edge: ${analysis.collaborativeFunctions.length} (${collabPct}%)
🔵 Human-Led: ${analysis.humanLedFunctions.length} (${humanPct}%)

🎯 Key Metrics:
• Job Displacement Risk: ${analysis.jobDisplacementIndex}/100
• Human Resilience: ${analysis.humanResilienceScore}/100
• Collaborative Opportunity: ${analysis.collaborativeOpportunityIndex}/100

💡 Top AI-Led: ${topAI.map(f => f.name).join(", ")}
🤝 Top Collaborative: ${topCollab.map(f => f.name).join(", ")}
👤 Still Human: ${topHuman.map(f => f.name).join(", ")}

Powered by VIGYL.ai — AI Impact Intelligence`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Action bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-white">Share AI Impact Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyText}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy as Text"}
            </button>
            <button onClick={onClose} className="rounded-md p-1.5 text-white/60 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Branded card */}
        <div ref={cardRef} className="rounded-xl border border-border bg-card p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">AI Impact Report</p>
              <h2 className="text-lg font-bold text-foreground mt-1">{analysis.industryName}</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {total} business functions analyzed · {new Date(analysis.generatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground">Automation Rate</p>
              <p className="text-2xl font-mono font-bold text-foreground">{analysis.automationRate}%</p>
            </div>
          </div>

          {/* Zone bar */}
          <div className="h-3 rounded-full overflow-hidden flex mb-2">
            <div className="bg-rose-500 transition-all" style={{ width: `${aiPct}%` }} />
            <div className="bg-violet-500 transition-all" style={{ width: `${collabPct}%` }} />
            <div className="bg-sky-500 transition-all" style={{ width: `${humanPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-5">
            <span>🔴 AI-Led {aiPct}%</span>
            <span>🟣 Collaborative {collabPct}%</span>
            <span>🔵 Human-Led {humanPct}%</span>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-lg font-mono font-bold text-rose-600">{analysis.jobDisplacementIndex}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Displacement Risk</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-lg font-mono font-bold text-sky-600">{analysis.humanResilienceScore}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Human Resilience</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-lg font-mono font-bold text-violet-600">{analysis.collaborativeOpportunityIndex}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Collab Opportunity</p>
            </div>
          </div>

          {/* Top functions per zone */}
          <div className="grid grid-cols-3 gap-3 text-[10px]">
            <div>
              <p className="font-semibold text-rose-600 mb-1.5">Top AI-Led</p>
              {topAI.map(f => (
                <p key={f.name} className="text-muted-foreground mb-1 leading-snug">{f.name}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-violet-600 mb-1.5">Collaborative Edge</p>
              {topCollab.map(f => (
                <p key={f.name} className="text-muted-foreground mb-1 leading-snug">{f.name}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold text-sky-600 mb-1.5">Still Human</p>
              {topHuman.map(f => (
                <p key={f.name} className="text-muted-foreground mb-1 leading-snug">{f.name}</p>
              ))}
            </div>
          </div>

          {/* Branding */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">Powered by <span className="font-semibold text-foreground">VIGYL.ai</span></p>
            <p className="text-[10px] text-primary font-medium">vigyl.ai/ai-impact</p>
          </div>
        </div>

        <p className="text-[10px] text-white/50 text-center mt-3">
          Screenshot this card or copy as text to share on LinkedIn
        </p>
      </div>
    </div>
  );
}
