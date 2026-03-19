import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { AITool } from "@/hooks/useAITools";
import { CATEGORIES } from "./AIToolCategoryTabs";

const maturityConfig: Record<string, { label: string; class: string }> = {
  dominant: { label: "Dominant", class: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  mature: { label: "Mature", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  growing: { label: "Growing", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  emerging: { label: "Emerging", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const pricingLabels: Record<string, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-muted-foreground";
}

export default function AIToolCard({ tool }: { tool: AITool }) {
  const cat = CATEGORIES.find((c) => c.id === tool.category);
  const maturity = maturityConfig[tool.maturity || "growing"];
  const CatIcon = cat?.icon;

  return (
    <Link
      to={`/ai-tools/${tool.slug}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
    >
      {/* Top row: name + score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {tool.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {tool.maker}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`font-mono text-xl font-bold ${getScoreColor(tool.adoption_score)}`}>
            {tool.adoption_score}
          </span>
          <span className="text-[10px] text-muted-foreground/60">adoption</span>
        </div>
      </div>

      {/* Category + maturity badges */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        {cat && CatIcon && (
          <span className={`inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>
            <CatIcon className="h-2.5 w-2.5" />
            {cat.name}
          </span>
        )}
        {maturity && (
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${maturity.class}`}>
            {maturity.label}
          </span>
        )}
        {tool.pricing_model && (
          <span className="inline-flex rounded-full bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
            {pricingLabels[tool.pricing_model] || tool.pricing_model}
          </span>
        )}
      </div>

      {/* Description */}
      {tool.description && (
        <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      )}

      {/* Capabilities */}
      {tool.key_capabilities.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {tool.key_capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="rounded bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary/70"
            >
              {cap}
            </span>
          ))}
          {tool.key_capabilities.length > 3 && (
            <span className="text-[10px] text-muted-foreground/50">
              +{tool.key_capabilities.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: version + release date */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/60">
        <span>
          {tool.latest_version && `v${tool.latest_version}`}
          {tool.latest_release_date && ` · ${new Date(tool.latest_release_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
        </span>
        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    </Link>
  );
}
