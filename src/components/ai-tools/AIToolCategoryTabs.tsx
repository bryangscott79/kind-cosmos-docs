import { Brain, Image, Video, Mic, Code, Workflow, Palette, BarChart3, PenTool, Briefcase } from "lucide-react";

export interface CategoryTab {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

export const CATEGORIES: CategoryTab[] = [
  { id: "all", name: "All Tools", icon: Brain, color: "text-foreground" },
  { id: "foundation_models", name: "LLMs", icon: Brain, color: "text-violet-500" },
  { id: "image_generation", name: "Image", icon: Image, color: "text-pink-500" },
  { id: "video_generation", name: "Video", icon: Video, color: "text-red-500" },
  { id: "audio_voice", name: "Audio", icon: Mic, color: "text-amber-500" },
  { id: "code_developer", name: "Code", icon: Code, color: "text-emerald-500" },
  { id: "business_automation", name: "Automation", icon: Workflow, color: "text-blue-500" },
  { id: "design_creative", name: "Design", icon: Palette, color: "text-fuchsia-500" },
  { id: "data_analytics", name: "Analytics", icon: BarChart3, color: "text-cyan-500" },
  { id: "writing_content", name: "Writing", icon: PenTool, color: "text-orange-500" },
  { id: "specialized", name: "Specialized", icon: Briefcase, color: "text-slate-500" },
];

interface AIToolCategoryTabsProps {
  selected: string;
  onSelect: (id: string) => void;
  counts?: Record<string, number>;
}

export default function AIToolCategoryTabs({ selected, onSelect, counts }: AIToolCategoryTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = selected === cat.id;
        const count = cat.id === "all" ? undefined : counts?.[cat.id];
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "" : cat.color}`} />
            {cat.name}
            {count !== undefined && (
              <span className={`ml-0.5 text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
