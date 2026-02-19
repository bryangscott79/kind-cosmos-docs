import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown, Radio, Mail, ExternalLink, Target
} from "lucide-react";
import { getSignalTypeLabel } from "@/data/mockData";
import AskArgus from "@/components/AskArgus";

export const signalTypeColors: Record<string, string> = {
  political: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  regulatory: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  economic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  hiring: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  tech: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  supply_chain: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  social: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  competitive: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  environmental: "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20",
};

export default function CriticalAlertCard({ signal, affected, getIndustryName }: {
  signal: any;
  affected: any[];
  getIndustryName: (id: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const industryNames = signal.industryTags.map((t: string) => getIndustryName(t)).filter((n: string) => n !== "Unknown");

  return (
    <div className={`rounded-lg border transition-all ${expanded ? "border-rose-300 shadow-sm bg-rose-50/50" : "border-rose-200/50 bg-rose-50/30 hover:border-rose-300/60"}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${signalTypeColors[signal.signalType] || ""}`}>
                {signal.signalType.replace("_", " ")}
              </span>
              <span className="text-[10px] text-muted-foreground">{industryNames.join(", ")}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">{signal.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{signal.salesImplication}</p>
            {affected.length > 0 && !expanded && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-medium">Affected prospects:</span>
                {affected.map((p: any) => (
                  <span key={p.id} className="text-[10px] font-medium text-primary">{p.companyName}</span>
                ))}
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-rose-200/50">
          {affected.length > 0 && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Companies to Target ({affected.length})</span>
              </div>
              <div className="space-y-2">
                {affected.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono font-bold text-primary">{p.vigylScore}</span>
                      <div className="min-w-0">
                        <Link to={`/prospects/${p.id}`} className="text-xs font-semibold text-foreground hover:text-primary transition-colors">
                          {p.companyName}
                        </Link>
                        <p className="text-[9px] text-muted-foreground">{p.location?.city}, {p.location?.state} · {p.annualRevenue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link to={`/prospects/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[9px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        Dossier
                      </Link>
                      <Link to={`/outreach?prospect=${p.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[9px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                        <Mail className="h-2.5 w-2.5" /> Outreach
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Signal Details</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-card border border-border p-2">
                <p className="text-xs font-bold text-foreground">{signal.severity}/5</p>
                <p className="text-[8px] text-muted-foreground">Severity</p>
              </div>
              <div className="rounded-md bg-card border border-border p-2">
                <p className="text-xs font-bold text-foreground capitalize">{signal.sentiment}</p>
                <p className="text-[8px] text-muted-foreground">Sentiment</p>
              </div>
              <div className="rounded-md bg-card border border-border p-2">
                <p className="text-xs font-bold text-foreground">{signal.publishedAt}</p>
                <p className="text-[8px] text-muted-foreground">Published</p>
              </div>
            </div>
          </div>

          {signal.sources?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Sources ({signal.sources.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {signal.sources.map((src: any, i: number) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[9px] font-medium text-muted-foreground hover:text-primary transition-colors">
                    {src.name} <ExternalLink className="h-2 w-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => navigate(`/signals`)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Radio className="h-3 w-3" /> View in Signal Feed
            </button>
            <AskArgus
              compact
              context={`Critical Signal: ${signal.title}\nType: ${getSignalTypeLabel(signal.signalType)}\nSeverity: ${signal.severity}/5\nSentiment: ${signal.sentiment}\nIndustries: ${industryNames.join(", ")}\nSales Implication: ${signal.salesImplication}\nAffected Prospects: ${affected.map((p: any) => `${p.companyName} (Score: ${p.vigylScore}, ${p.annualRevenue})`).join("; ")}\nPublished: ${signal.publishedAt}`}
              label={signal.title}
              greeting={`This critical alert "${signal.title}" affects ${affected.length} of your prospects: ${affected.map((p: any) => p.companyName).join(", ")}. I can help you build an outreach strategy, prioritize which companies to contact first, or craft talking points that leverage this signal. What would you like?`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
