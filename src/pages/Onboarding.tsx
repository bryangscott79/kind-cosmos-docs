import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { track, EVENTS } from "@/lib/analytics";
import { Zap, Globe, Building2, MapPin, Users, Briefcase, ArrowRight, ArrowLeft, Loader2, Sparkles, Check, X, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RecommendedIndustry {
  name: string;
  match_score: number;
  reasoning: string;
  accepted: boolean;
}

export default function Onboarding() {
  const { session, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Step 1 fields
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || "");
  const [companySize, setCompanySize] = useState(profile?.company_size || "");
  const [roleTitle, setRoleTitle] = useState(profile?.role_title || "");
  const [city, setCity] = useState(profile?.location_city || "");
  const [state, setState] = useState(profile?.location_state || "");

  // Step 2 fields (AI Impact context)
  const [entityType, setEntityType] = useState("");
  const [userPersona, setUserPersona] = useState("");
  const [aiMaturity, setAiMaturity] = useState("");

  // Step 3 fields
  const [businessSummary, setBusinessSummary] = useState(profile?.business_summary || "");
  const [aiSummary, setAiSummary] = useState(profile?.ai_summary || "");
  const [recommendedIndustries, setRecommendedIndustries] = useState<RecommendedIndustry[]>([]);
  const [sellingAngles, setSellingAngles] = useState<string[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  if (!session) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/dashboard" replace />;

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
      console.error("Scrape error:", err);
      toast({ title: "Couldn't analyze website", description: "You can enter your business details manually.", variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  const handleAnalyzeIndustries = async () => {
    const urlToAnalyze = websiteUrl.trim();
    if (!urlToAnalyze && !businessSummary.trim()) {
      toast({ title: "Need more context", description: "Enter your website URL or a business summary so we can recommend industries.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { url: urlToAnalyze || undefined, businessSummary: businessSummary || aiSummary || undefined },
      });
      if (error) throw error;

      const analysis = data?.analysis;
      if (analysis?.target_industries) {
        setRecommendedIndustries(
          analysis.target_industries.map((ind: any) => ({ ...ind, accepted: true }))
        );
      }
      if (analysis?.selling_angles) setSellingAngles(analysis.selling_angles);
      if (analysis?.company_summary && !aiSummary) setAiSummary(analysis.company_summary);
      setHasAnalyzed(true);
      toast({ title: "Analysis complete", description: "We've recommended industries based on your business." });
    } catch (err: any) {
      console.error("Analyze error:", err);
      toast({ title: "Analysis failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleIndustryAcceptance = (index: number) => {
    setRecommendedIndustries((prev) =>
      prev.map((ind, i) => (i === index ? { ...ind, accepted: !ind.accepted } : ind))
    );
  };

  const handleComplete = async () => {
    const accepted = recommendedIndustries.filter((i) => i.accepted).map((i) => i.name);
    if (accepted.length === 0) {
      toast({ title: "Select at least one industry", description: "Accept at least one recommended industry to continue.", variant: "destructive" });
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
          target_industries: accepted,
          entity_type: entityType || null,
          user_persona: userPersona || null,
          ai_maturity_self: aiMaturity || null,
          onboarding_completed: true,
        })
        .eq("user_id", session.user.id);

      if (error) throw error;
      track(EVENTS.ONBOARDING_COMPLETED, { persona: userPersona, entityType, industries: accepted.length });
      await refreshProfile();
      navigate("/dashboard");
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
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
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
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-foreground">Your Business Context</h2>
            <p className="text-xs text-muted-foreground -mt-3">
              This shapes how VIGYL labels features and what intelligence it prioritizes. You can update these anytime in Settings.
            </p>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground">Business Model</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "b2b", label: "B2B", desc: "Sell to businesses" },
                  { value: "b2c", label: "B2C", desc: "Sell to consumers" },
                  { value: "d2c", label: "D2C", desc: "Direct to consumer" },
                  { value: "government", label: "Government", desc: "Public sector" },
                  { value: "private", label: "Private", desc: "Private company" },
                  { value: "nonprofit", label: "Nonprofit", desc: "Mission-driven" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEntityType(opt.value)}
                    className={`rounded-md border p-2.5 text-left transition-colors ${
                      entityType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground">Your Role Focus</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "sales", label: "Sales / BD" },
                  { value: "founder", label: "Founder / CEO" },
                  { value: "executive", label: "Executive" },
                  { value: "hr", label: "HR / People Ops" },
                  { value: "job_seeker", label: "Job Seeker" },
                  { value: "investor", label: "Investor" },
                  { value: "consultant", label: "Consultant" },
                  { value: "analyst", label: "Analyst" },
                  { value: "lobbyist", label: "Policy / Lobbying" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUserPersona(opt.value)}
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                      userPersona === opt.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-foreground">AI Maturity</label>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: "exploring", label: "Exploring", emoji: "🔍" },
                  { value: "piloting", label: "Piloting", emoji: "🧪" },
                  { value: "scaling", label: "Scaling", emoji: "📈" },
                  { value: "optimizing", label: "Optimizing", emoji: "⚙️" },
                  { value: "leading", label: "Leading", emoji: "🚀" },
                  { value: "unsure", label: "Not Sure", emoji: "🤷" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAiMaturity(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      aiMaturity === opt.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {opt.emoji} {opt.label}
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
                onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setEntityType(""); setUserPersona(""); setAiMaturity(""); setStep(3); }}
              className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Skip for now — you can set this later in Settings
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Your Business & Target Industries</h2>
            <p className="text-xs text-muted-foreground -mt-2">
              Tell us about your business and we'll identify the best industries for you to target.
            </p>

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

            {!hasAnalyzed && (
              <button
                type="button"
                onClick={handleAnalyzeIndustries}
                disabled={analyzing}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your business…
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    Find My Target Industries
                  </>
                )}
              </button>
            )}

            {hasAnalyzed && recommendedIndustries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Recommended Industries</label>
                  <span className="text-[10px] text-muted-foreground">
                    {recommendedIndustries.filter((i) => i.accepted).length} selected
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recommendedIndustries.map((ind, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleIndustryAcceptance(idx)}
                      className={`w-full rounded-md border p-3 text-left transition-colors ${
                        ind.accepted
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card opacity-60"
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
                  <div className="rounded-md border border-border bg-card p-3">
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

                <button
                  type="button"
                  onClick={handleAnalyzeIndustries}
                  disabled={analyzing}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {analyzing ? "Re-analyzing…" : "Re-analyze"}
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving || !hasAnalyzed}
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
