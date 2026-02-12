import { Badge } from "@/components/ui/badge";
import { Bookmark, ExternalLink } from "lucide-react";
import { Signal, getSignalTypeLabel, industries as allIndustries } from "@/data/mockData";

interface SignalCardProps {
  signal: Signal;
}

const sentimentColors = {
  positive: "bg-score-green/10 text-score-green border-score-green/20",
  negative: "bg-score-red/10 text-score-red border-score-red/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export default function SignalCard({ signal }: SignalCardProps) {
  const industryNames = signal.industryTags
    .map((id) => allIndustries.find((i) => i.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
              {getSignalTypeLabel(signal.signalType)}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < signal.severity ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentimentColors[signal.sentiment]}`}>
              {signal.sentiment}
            </Badge>
          </div>
          <h4 className="mt-2 text-sm font-semibold text-foreground leading-snug">
            {signal.title}
          </h4>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            {signal.summary}
          </p>
        </div>
        <button className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 rounded-md bg-primary/5 border border-primary/10 px-3 py-2">
        <p className="text-xs text-primary font-medium">
          💡 {signal.salesImplication}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {industryNames.map((name) => (
            <span key={name} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {name}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{signal.publishedAt}</span>
      </div>
    </div>
  );
}
