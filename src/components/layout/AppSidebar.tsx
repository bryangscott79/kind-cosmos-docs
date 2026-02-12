import { Link, useLocation } from "react-router-dom";
import { BarChart3, Compass, Radio, Users, Kanban, PenTool, Settings, Zap } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/industries", icon: BarChart3 },
  { label: "Signals", path: "/signals", icon: Radio },
  { label: "Prospects", path: "/prospects", icon: Users },
  { label: "Pipeline", path: "/pipeline", icon: Kanban },
  { label: "Outreach", path: "/outreach", icon: PenTool },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-sidebar">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">VIGYL</span>
        <span className="text-xs font-medium text-primary">.ai</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-md bg-secondary p-3">
          <p className="text-xs font-medium text-foreground">Free Tier</p>
          <p className="mt-1 text-xs text-muted-foreground">Upgrade for full prospect access</p>
          <button className="mt-2 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>
  );
}
