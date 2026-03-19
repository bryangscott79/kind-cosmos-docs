import { Circle } from "lucide-react";

interface Release {
  version: string;
  date: string;
  highlights: string[];
}

interface AIToolReleaseTimelineProps {
  releases: Release[];
  toolName?: string;
  maxItems?: number;
}

export default function AIToolReleaseTimeline({ releases, toolName, maxItems = 10 }: AIToolReleaseTimelineProps) {
  const sorted = [...releases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems);

  if (sorted.length === 0) {
    return <p className="text-xs text-muted-foreground">No release history available.</p>;
  }

  return (
    <div className="relative space-y-0">
      {sorted.map((release, i) => {
        const isLatest = i === 0;
        const date = new Date(release.date);
        return (
          <div key={`${release.version}-${release.date}`} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Vertical line */}
            {i < sorted.length - 1 && (
              <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div className="relative z-10 mt-0.5 flex-shrink-0">
              <Circle
                className={`h-4 w-4 ${isLatest ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                  {toolName ? `${toolName} ` : ""}v{release.version}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {isLatest && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Latest
                  </span>
                )}
              </div>
              {release.highlights.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {release.highlights.map((h, j) => (
                    <li key={j} className="text-xs text-muted-foreground leading-relaxed">
                      • {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
