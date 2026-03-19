import { Link } from "react-router-dom";
import type { AITool } from "@/hooks/useAITools";

interface AIToolCompetitorsProps {
  tools: AITool[];
  currentSlug: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-muted-foreground";
}

export default function AIToolCompetitors({ tools, currentSlug }: AIToolCompetitorsProps) {
  const competitors = tools
    .filter((t) => t.slug !== currentSlug)
    .sort((a, b) => b.adoption_score - a.adoption_score)
    .slice(0, 8);

  if (competitors.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {competitors.map((tool) => (
        <Link
          key={tool.slug}
          to={`/ai-tools/${tool.slug}`}
          className="flex-shrink-0 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:bg-card/80 w-40"
        >
          <h4 className="text-xs font-semibold text-foreground truncate">{tool.name}</h4>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{tool.maker}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`font-mono text-sm font-bold ${getScoreColor(tool.adoption_score)}`}>
              {tool.adoption_score}
            </span>
            <span className="text-[10px] text-muted-foreground/50">
              {tool.latest_version && `v${tool.latest_version}`}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
