import { Link, useLocation } from "react-router-dom";
import { BarChart3, Radio, Users, Kanban, PenTool, Settings, LogOut, CreditCard, Lock, Shield, Menu, X, Brain, FileText, Mail } from "lucide-react";
import vigylLogo from "@/assets/vigyl-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { TIERS, hasAccess, FEATURE_ACCESS, TierKey } from "@/lib/tiers";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { useState, useEffect, useMemo } from "react";

function useNavSections() {
  const { persona } = useAuth();
  return useMemo(() => [
    {
      label: "Intelligence",
      items: [
        { label: "Briefing", subtitle: "Your market at a glance", path: "/industries", icon: BarChart3, feature: "industries" },
        { label: "Signals", subtitle: "What's happening now", path: "/signals", icon: Radio, feature: "signals" },
        { label: "AI Impact", subtitle: "Where AI meets your industry", path: "/ai-impact", icon: Brain, feature: "ai_impact" },
      ],
    },
    {
      label: persona.navGroupLabel,
      items: [
        { label: persona.prospectLabel, subtitle: "Companies to engage", path: "/prospects", icon: Users, feature: "prospects" },
        { label: persona.pipelineLabel, subtitle: "Track your progress", path: "/pipeline", icon: Kanban, feature: "pipeline" },
        { label: persona.outreachLabel, subtitle: "AI-crafted messaging", path: "/outreach", icon: PenTool, feature: "outreach" },
        { label: "Reports", subtitle: "Deep analysis on demand", path: "/reports", icon: FileText, feature: "deep_reports" },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Settings", path: "/settings", icon: Settings, feature: "settings" },
      ],
    },
  ], [persona]);
}

export default function AppSidebar() {
  const location = useLocation();
  const { tier, profile, signOut, isAdmin } = useAuth();
  const { data } = useIntelligence();
  const navSections = useNavSections();
  const currentTierInfo = TIERS[tier];
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Count high-severity signals from last 3 days as "new"
  const newSignalCount = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return data.signals.filter(
      (s) => s.severity >= 4 && new Date(s.publishedAt) >= threeDaysAgo
    ).length;
  }, [data.signals]);

  const sidebarContent = (
    <>
      <Link to="/" className="flex items-center px-5 py-5 border-b border-border">
        <img src={vigylLogo} alt="VIGYL" className="h-7" />
      </Link>

      {profile?.company_name && (
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs font-semibold text-foreground truncate">{profile.company_name}</p>
          {profile.role_title && (
            <p className="text-[10px] text-muted-foreground truncate">{profile.role_title}</p>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/industries" && location.pathname.startsWith(item.path));
                const isBriefing = item.path === "/industries" && (location.pathname === "/industries" || location.pathname.startsWith("/industries/"));
                const active = isActive || isBriefing;
                const requiredTier = FEATURE_ACCESS[item.feature] as TierKey;
                const locked = !hasAccess(tier, requiredTier);
                const showBadge = item.path === "/signals" && newSignalCount > 0;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={(item as any).subtitle || ""}
                    className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                    <div className="flex-1 min-w-0">
                      <span>{item.label}</span>
                      {(item as any).subtitle && (
                        <p className="text-[9px] text-muted-foreground/60 font-normal leading-tight hidden group-hover:block">{(item as any).subtitle}</p>
                      )}
                    </div>
                    {showBadge && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                        {newSignalCount > 9 ? "9+" : newSignalCount}
                      </span>
                    )}
                    {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {isAdmin && (
          <div className="mb-4">
            <div className="space-y-0.5">
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/admin"
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Shield className={`h-4 w-4 ${location.pathname === "/admin" ? "text-primary" : ""}`} />
                Admin
              </Link>
            </div>
          </div>
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
    </>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Link to="/" className="flex items-center"><img src={vigylLogo} alt="VIGYL" className="h-6" /></Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-md p-2 text-foreground hover:bg-accent transition-colors">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-border bg-sidebar md:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
