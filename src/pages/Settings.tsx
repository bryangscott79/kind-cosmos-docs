import { useState } from "react";
import { Bell, CreditCard, Building2, Users, LogOut, Plug } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TIERS } from "@/lib/tiers";
import { useNavigate, Link } from "react-router-dom";
import TeamSection from "@/components/settings/TeamSection";
import CrmSection from "@/components/settings/CrmSection";
import BusinessProfileSection from "@/components/settings/BusinessProfileSection";
import NotificationsSection from "@/components/settings/NotificationsSection";

const tabs = [
  { id: "profile", label: "Business Profile", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account & Billing", icon: CreditCard },
];

export default function Settings() {
  const { user, tier, subscriptionEnd, signOut } = useAuth();
  const navigate = useNavigate();
  const currentTierInfo = TIERS[tier];
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <div className="flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col md:space-y-1 md:gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors md:w-full ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === "profile" && <BusinessProfileSection />}

          {activeTab === "team" && <TeamSection />}

          {activeTab === "integrations" && <CrmSection />}

          {activeTab === "notifications" && <NotificationsSection />}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Current Plan</h3>
                <div className="flex items-center justify-between rounded-md border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{currentTierInfo.name} Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tier === "free"
                        ? "Limited to industry dashboard and basic signals"
                        : `$${currentTierInfo.price}/mo${subscriptionEnd ? ` · Renews ${new Date(subscriptionEnd).toLocaleDateString()}` : ""}`}
                    </p>
                  </div>
                  {tier === "free" ? (
                    <Link to="/pricing"
                      className="rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                      Upgrade
                    </Link>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke("customer-portal");
                          if (error) throw error;
                          if (data?.url) window.open(data.url, "_blank");
                        } catch {}
                      }}
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                      Manage Subscription
                    </button>
                  )}
                </div>
                {tier === "free" && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(["starter", "pro", "enterprise"] as const).map((key) => {
                      const plan = TIERS[key];
                      return (
                        <div key={key} className="rounded-md border border-border p-4">
                          <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                          <p className="text-lg font-bold text-foreground mt-1">${plan.price}/mo</p>
                          <ul className="mt-3 space-y-1.5">
                            {plan.features.map((f) => (
                              <li key={f} className="text-xs text-muted-foreground">✓ {f}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Account</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                    <input type="email" defaultValue={user?.email || ""} disabled
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground opacity-60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <button
                    onClick={async () => { await signOut(); navigate("/auth"); }}
                    className="flex items-center gap-2 rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
