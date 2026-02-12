import { useState, useEffect } from "react";
import { Save, Bell, CreditCard, Building2, Globe, Loader2, Sparkles, MapPin, Users, Briefcase, Target, Check, X, ArrowRight, LogOut } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TIERS, hasAccess } from "@/lib/tiers";
import { useNavigate, Link } from "react-router-dom";

const tabs = [
  { id: "profile", label: "Business Profile", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account & Billing", icon: CreditCard },
];

const companySizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

interface RecommendedIndustry {
  name: string;
  match_score: number;
  reasoning: string;
  accepted: boolean;
}

export default function Settings() {
  const { profile, user, refreshProfile, tier, subscriptionEnd, signOut } = useAuth();
  const navigate = useNavigate();
  const currentTierInfo = TIERS[tier];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Profile fields
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessSummary, setBusinessSummary] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);

  // Re-analysis
  const [recommendedIndustries, setRecommendedIndustries] = useState<RecommendedIndustry[]>([]);
  const [sellingAngles, setSellingAngles] = useState<string[]>([]);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || "");
      setWebsiteUrl(profile.website_url || "");
      setBusinessSummary(profile.business_summary || "");
      setAiSummary(profile.ai_summary || "");
      setCompanySize(profile.company_size || "");
      setRoleTitle(profile.role_title || "");
      setCity(profile.location_city || "");
      setState(profile.location_state || "");
      setTargetIndustries(profile.target_industries || []);
    }
  }, [profile]);

  const handleScrape = async () => {
    if (!websiteUrl.trim()) return;
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url: websiteUrl, options: { formats: ["summary", "markdown"] } },
      });
      if (error) throw error;
      const summary = data?.data?.summary || data?.summary || "";
      if (summary) {
        setAiSummary(summary);
        toast({ title: "Website analyzed", description: "We extracted insights from your website." });
      }
      if (!companyName) {
        const titleMatch = data?.data?.metadata?.title || data?.metadata?.title;
        if (titleMatch) {
          const cleaned = titleMatch.split("|")[0].split("-")[0].trim();
          if (cleaned.length < 50) setCompanyName(cleaned);
        }
      }
    } catch (err: any) {
      toast({ title: "Couldn't analyze website", description: "You can update your details manually.", variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  const handleAnalyzeIndustries = async () => {
    if (!websiteUrl.trim() && !businessSummary.trim()) {
      toast({ title: "Need more context", description: "Enter your website URL or business summary first.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { url: websiteUrl || undefined, businessSummary: businessSummary || aiSummary || undefined },
      });
      if (error) throw error;
      const analysis = data?.analysis;
      if (analysis?.target_industries) {
        setRecommendedIndustries(
          analysis.target_industries.map((ind: any) => ({
            ...ind,
            accepted: targetIndustries.includes(ind.name),
          }))
        );
      }
      if (analysis?.selling_angles) setSellingAngles(analysis.selling_angles);
      if (analysis?.company_summary && !aiSummary) setAiSummary(analysis.company_summary);
      toast({ title: "Analysis complete", description: "Review recommended industries below." });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleIndustryRecommendation = (index: number) => {
    setRecommendedIndustries((prev) =>
      prev.map((ind, i) => (i === index ? { ...ind, accepted: !ind.accepted } : ind))
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Merge recommended industry selections with existing target industries
      let updatedIndustries = [...targetIndustries];
      if (recommendedIndustries.length > 0) {
        const accepted = recommendedIndustries.filter((i) => i.accepted).map((i) => i.name);
        const rejected = recommendedIndustries.filter((i) => !i.accepted).map((i) => i.name);
        // Add newly accepted, remove rejected
        accepted.forEach((name) => { if (!updatedIndustries.includes(name)) updatedIndustries.push(name); });
        rejected.forEach((name) => { updatedIndustries = updatedIndustries.filter((n) => n !== name); });
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          website_url: websiteUrl,
          business_summary: businessSummary,
          ai_summary: aiSummary,
          company_size: companySize,
          role_title: roleTitle,
          location_city: city,
          location_state: state,
          target_industries: updatedIndustries,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setTargetIndustries(updatedIndustries);
      await refreshProfile();
      toast({ title: "Settings saved", description: "Your profile has been updated." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeIndustry = (name: string) => {
    setTargetIndustries((prev) => prev.filter((n) => n !== name));
  };

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
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Company info */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Globe className="h-3 w-3" /> Website URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleScrape}
                        disabled={scraping || !websiteUrl.trim()}
                        className="flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {scraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {scraping ? "Analyzing…" : "Re-analyze"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Building2 className="h-3 w-3" /> Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your company"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Briefcase className="h-3 w-3" /> Your Role
                      </label>
                      <input
                        type="text"
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        placeholder="VP of Sales"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Users className="h-3 w-3" /> Company Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {companySizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setCompanySize(s)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            companySize === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <MapPin className="h-3 w-3" /> City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 text-xs font-medium text-muted-foreground block">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business summary + AI */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Business Summary</h3>
                <div className="space-y-4">
                  {aiSummary && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">AI-Generated Insights</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{aiSummary}</p>
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your Business Summary</label>
                    <textarea
                      rows={3}
                      value={businessSummary}
                      onChange={(e) => setBusinessSummary(e.target.value)}
                      placeholder="Describe what your company does, who you sell to, and what problems you solve..."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Target industries */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Target Industries</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  These industries drive your signal feed, prospect engine, and dashboard content.
                </p>

                {targetIndustries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {targetIndustries.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {name}
                        <button type="button" onClick={() => removeIndustry(name)} className="ml-0.5 hover:text-destructive transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyzeIndustries}
                  disabled={analyzing}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                >
                  {analyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing your business…</>
                  ) : (
                    <><Target className="h-4 w-4" /> Re-analyze Target Industries</>
                  )}
                </button>

                {recommendedIndustries.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Recommended Industries</span>
                      <span className="text-[10px] text-muted-foreground">
                        {recommendedIndustries.filter((i) => i.accepted).length} selected
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recommendedIndustries.map((ind, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleIndustryRecommendation(idx)}
                          className={`w-full rounded-md border p-3 text-left transition-colors ${
                            ind.accepted ? "border-primary bg-primary/5" : "border-border bg-background opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">{ind.name}</span>
                                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                  {ind.match_score}% match
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{ind.reasoning}</p>
                            </div>
                            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                              ind.accepted ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}>
                              {ind.accepted ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {sellingAngles.length > 0 && (
                      <div className="rounded-md border border-border bg-background p-3 mt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key Selling Angles</span>
                        <ul className="mt-1.5 space-y-1">
                          {sellingAngles.map((angle, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                              {angle}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Signal preferences */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Signal Preferences</h3>
                <p className="text-xs text-muted-foreground mb-3">Select the signal types most relevant to your business</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save Changes"}
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
                    <p className="text-sm font-semibold text-foreground">{currentTierInfo.name} Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tier === "free"
                        ? "Limited to industry dashboard and basic signals"
                        : `$${currentTierInfo.price}/mo${subscriptionEnd ? ` · Renews ${new Date(subscriptionEnd).toLocaleDateString()}` : ""}`}
                    </p>
                  </div>
                  {tier === "free" ? (
                    <Link
                      to="/pricing"
                      className="rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
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
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
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
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground opacity-60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate("/auth");
                    }}
                    className="flex items-center gap-2 rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
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
