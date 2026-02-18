import { Link, useLocation } from "react-router-dom";
import { BarChart3, Radio, Brain, Users, Kanban } from "lucide-react";

const tabs = [
  { label: "Briefing", path: "/industries", icon: BarChart3 },
  { label: "Signals", path: "/signals", icon: Radio },
  { label: "AI Impact", path: "/ai-impact", icon: Brain },
  { label: "Prospects", path: "/prospects", icon: Users },
  { label: "Pipeline", path: "/pipeline", icon: Kanban },
];

export default function MobilePageNav() {
  const location = useLocation();

  // Only show on dashboard pages
  const isOnDashboard = tabs.some((t) => location.pathname.startsWith(t.path));
  if (!isOnDashboard) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-2 pb-safe md:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
