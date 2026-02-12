import { useState } from "react";
import { Save, User, Bell, CreditCard, Building2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const tabs = [
  { id: "profile", label: "Business Profile", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account & Billing", icon: CreditCard },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="mt-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company Name</label>
                    <input
                      type="text"
                      defaultValue="Acme Consulting"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company URL</label>
                    <input
                      type="url"
                      defaultValue="https://acmeconsulting.com"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Business Summary</label>
                    <textarea
                      rows={3}
                      defaultValue="We help B2B technology companies accelerate their sales pipeline through market intelligence and strategic consulting."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Services & Targeting</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Services Offered</label>
                    <textarea
                      rows={2}
                      defaultValue="Sales enablement consulting, Market intelligence reports, AI-driven prospecting tools"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ideal Client Size</label>
                    <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>50-200 employees</option>
                      <option>200-1000 employees</option>
                      <option>1000-5000 employees</option>
                      <option>5000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Geographic Focus</label>
                    <input
                      type="text"
                      defaultValue="North America, Western Europe"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Signal Preferences</h3>
                <p className="text-xs text-muted-foreground mb-3">Select the signal types most relevant to your business</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Political", "Regulatory", "Economic", "Hiring", "Technology", "Supply Chain"].map((type) => (
                    <label key={type} className="flex items-center gap-2 rounded-md border border-border bg-background p-2.5 cursor-pointer hover:bg-accent transition-colors">
                      <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
                      <span className="text-xs font-medium text-foreground">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "Daily Industry Digest", desc: "Receive a daily summary of health score changes across your tracked industries" },
                  { label: "Signal Alerts", desc: "Get notified when high-severity signals affect your tracked industries" },
                  { label: "Prospect Updates", desc: "Alerts when prospect scores change significantly or new prospects are identified" },
                  { label: "Pipeline Reminders", desc: "Reminders for stale prospects that haven't been contacted recently" },
                ].map((n) => (
                  <div key={n.label} className="flex items-start justify-between gap-4 rounded-md border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                    </div>
                    <button className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-primary transition-colors">
                      <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Digest Frequency</label>
                <select className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Current Plan</h3>
                <div className="flex items-center justify-between rounded-md border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Free Tier</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Limited to industry dashboard and 5 signal views per day</p>
                  </div>
                  <button className="rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                    Upgrade to Pro
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { name: "Pro", price: "$49/mo", features: ["Unlimited signals", "Prospect engine", "10 outreach/day"] },
                    { name: "Team", price: "$149/mo", features: ["Everything in Pro", "5 team members", "Shared pipeline"] },
                    { name: "Enterprise", price: "Custom", features: ["Unlimited everything", "SSO & API access", "Dedicated support"] },
                  ].map((plan) => (
                    <div key={plan.name} className="rounded-md border border-border p-4">
                      <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                      <p className="text-lg font-bold text-foreground mt-1">{plan.price}</p>
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="text-xs text-muted-foreground">✓ {f}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Account</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      defaultValue="user@example.com"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                    Change Password
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
