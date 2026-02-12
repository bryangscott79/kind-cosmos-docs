import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Zap, Globe, Building2, MapPin, Users, Briefcase, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { industries } from "@/data/mockData";

export default function Onboarding() {
  const { session, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);

  // Step 1 fields
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || "");
  const [companySize, setCompanySize] = useState(profile?.company_size || "");
  const [roleTitle, setRoleTitle] = useState(profile?.role_title || "");
  const [city, setCity] = useState(profile?.location_city || "");
  const [state, setState] = useState(profile?.location_state || "");

  // Step 2 fields
  const [businessSummary, setBusinessSummary] = useState(profile?.business_summary || "");
  const [aiSummary, setAiSummary] = useState(profile?.ai_summary || "");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(profile?.target_industries || []);

  if (!session) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/industries" replace />;

  const handleScrape = async () => {
    if (!websiteUrl.trim()) return;
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url: websiteUrl, options: { formats: ["summary", "markdown"] } },
      });
      if (error) throw error;

      const summary = data?.data?.summary || data?.summary || "";
      const markdown = data?.data?.markdown || data?.markdown || "";

      if (summary) {
        setAiSummary(summary);
        toast({ title: "Website analyzed", description: "We extracted insights from your website." });
      }

      // Try to extract company info from markdown if not already set
      if (!companyName && markdown) {
        const titleMatch = data?.data?.metadata?.title || data?.metadata?.title;
        if (titleMatch) {
          const cleaned = titleMatch.split("|")[0].split("-")[0].trim();
          if (cleaned.length < 50) setCompanyName(cleaned);
        }
      }
    } catch (err: any) {
      console.error("Scrape error:", err);
      toast({ title: "Couldn't analyze website", description: "You can enter your business details manually.", variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  const toggleIndustry = (id: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (selectedIndustries.length === 0) {
      toast({ title: "Select at least one industry", description: "Choose the industries you want to monitor.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName,
          website_url: websiteUrl,
          company_size: companySize,
          role_title: roleTitle,
          location_city: city,
          location_state: state,
          business_summary: businessSummary,
          ai_summary: aiSummary,
          target_industries: selectedIndustries,
          onboarding_completed: true,
        })
        .eq("user_id", session.user.id);

      if (error) throw error;
      await refreshProfile();
      navigate("/industries");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const sizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set up your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Help VIGYL.ai find the right signals and prospects for your business
          </p>
          {/* Step indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/40" : "w-8 bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Company & Location</h2>

            {/* Website URL with scrape */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                <Globe className="h-3 w-3" /> Website URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="flex-1 rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scraping || !websiteUrl.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {scraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {scraping ? "Analyzing…" : "Analyze"}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">We'll extract business insights to personalize your experience</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                  <Building2 className="h-3 w-3" /> Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                  <Briefcase className="h-3 w-3" /> Your Role
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="VP of Sales"
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                <Users className="h-3 w-3" /> Company Size
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                  <MapPin className="h-3 w-3" /> City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-foreground block">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="NY"
                  className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Business Focus & Industries</h2>

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
              <label className="mb-1.5 block text-xs font-medium text-foreground">Business Summary</label>
              <textarea
                value={businessSummary}
                onChange={(e) => setBusinessSummary(e.target.value)}
                placeholder="Describe what your company does, who you sell to, and what problems you solve..."
                rows={3}
                className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Target Industries <span className="text-muted-foreground font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => toggleIndustry(ind.id)}
                    className={`rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors ${
                      selectedIndustries.includes(ind.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {ind.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Launch Dashboard <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
