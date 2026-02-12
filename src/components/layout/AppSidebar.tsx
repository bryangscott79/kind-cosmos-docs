import { Link, useLocation } from "react-router-dom";
import { BarChart3, Radio, Users, Kanban, PenTool, Settings, Zap, LogOut, CreditCard, Lock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TIERS, hasAccess, FEATURE_ACCESS, TierKey } from "@/lib/tiers";

const navItems = [
  { label: "Dashboard", path: "/industries", icon: BarChart3, feature: "industries" },
  { label: "Signals", path: "/signals", icon: Radio, feature: "signals" },
  { label: "Prospects", path: "/prospects", icon: Users, feature: "prospects" },
  { label: "Pipeline", path: "/pipeline", icon: Kanban, feature: "pipeline" },
  { label: "Outreach", path: "/outreach", icon: PenTool, feature: "outreach" },
  { label: "Settings", path: "/settings", icon: Settings, feature: "settings" },
];

export default function AppSidebar() {
  const location = useLocation();
  const { tier, profile, signOut, isAdmin } = useAuth();
  const currentTierInfo = TIERS[tier];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-sidebar">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-blue to-brand-purple">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">VIGYL</span>
        <span className="text-xs font-medium text-brand-purple">.ai</span>
      </Link>

      {/* User info */}
      {profile?.company_name && (
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs font-semibold text-foreground truncate">{profile.company_name}</p>
          {profile.role_title && (
            <p className="text-[10px] text-muted-foreground truncate">{profile.role_title}</p>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const requiredTier = FEATURE_ACCESS[item.feature] as TierKey;
          const locked = !hasAccess(tier, requiredTier);

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
              {locked && <Lock className="ml-auto h-3 w-3 text-muted-foreground" />}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === "/admin"
                ? "bg-sidebar-accent text-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
            }`}
          >
            <Shield className={`h-4 w-4 ${location.pathname === "/admin" ? "text-primary" : ""}`} />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <div className="rounded-md bg-secondary p-3">
          <p className="text-xs font-medium text-foreground">{currentTierInfo.name} Plan</p>
          {tier === "free" ? (
            <>
              <p className="mt-1 text-xs text-muted-foreground">Upgrade for full access</p>
              <Link
                to="/pricing"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <CreditCard className="h-3 w-3" /> View Plans
              </Link>
            </>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">${currentTierInfo.price}/mo</p>
          )}
        </div>

        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
