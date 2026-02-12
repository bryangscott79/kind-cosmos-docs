import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import Sparkline from "./Sparkline";
import { Industry, getScoreColor } from "@/data/mockData";

interface IndustryCardProps {
  industry: Industry;
}

const trendIcons = {
  improving: ArrowUpRight,
  declining: ArrowDownRight,
  stable: ArrowRight,
};

const trendLabels = {
  improving: "Improving",
  declining: "Declining",
  stable: "Stable",
};

export default function IndustryCard({ industry }: IndustryCardProps) {
  const TrendIcon = trendIcons[industry.trendDirection];
  const scoreColor = getScoreColor(industry.healthScore);

  return (
    <Link
      to={`/industries/${industry.slug}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {industry.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5">
            <TrendIcon className={`h-3.5 w-3.5 text-${scoreColor}`} />
            <span className={`text-xs font-medium text-${scoreColor}`}>
              {trendLabels[industry.trendDirection]}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`font-mono text-xl font-bold text-${scoreColor}`}>
            {industry.healthScore}
          </span>
          <Sparkline
            data={industry.scoreHistory}
            healthScore={industry.healthScore}
            width={72}
            height={24}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {industry.topSignals.slice(0, 2).map((signal, i) => (
          <p key={i} className="text-xs text-muted-foreground leading-relaxed truncate">
            • {signal}
          </p>
        ))}
      </div>
    </Link>
  );
}
