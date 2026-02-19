import { useState, useEffect, useRef, useMemo } from "react";
import { Save, Building2, Globe, Loader2, Sparkles, MapPin, Users, Briefcase, Target, Check, X, ArrowRight, Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const companySizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const PRESET_INDUSTRIES = [
  "Technology & SaaS", "Cybersecurity", "Artificial Intelligence & ML", "Cloud Computing", "Data Analytics & BI",
  "DevOps & Infrastructure", "FinTech", "EdTech", "HealthTech", "PropTech", "LegalTech", "InsurTech", "AgriTech",
  "HR Tech", "MarTech & AdTech", "GovTech", "Blockchain & Web3", "IoT & Connected Devices", "Robotics & Automation",
  "Healthcare IT", "Pharmaceuticals & Biotech", "Medical Devices", "Telehealth & Digital Health", "Clinical Research",
  "Healthcare Services", "Mental Health & Wellness", "Veterinary", "Dental",
  "Financial Services & Banking", "Insurance", "Wealth Management", "Private Equity & VC", "Payments & Processing",
  "Lending & Credit", "Accounting & Tax",
  "Clean Energy & Renewables", "Oil & Gas", "Utilities", "Environmental Services", "Carbon & Sustainability",
  "Mining & Resources",
  "Manufacturing & Industrial", "Aerospace & Defense", "Automotive & Transportation", "Chemicals", "Construction",
  "Electronics & Consumer Tech", "Packaging", "Semiconductors", "3D Printing & Additive",
  "Retail & E-Commerce", "Consumer Packaged Goods", "Food & Beverage", "Fashion & Apparel", "Beauty & Personal Care",
  "Luxury Goods", "Direct-to-Consumer", "Grocery & Supermarkets",
  "Professional Services", "Consulting", "Staffing & Recruiting", "Legal Services", "Marketing & Advertising",
  "Design & Creative Services", "Facilities Management", "Security Services",
  "Commercial Real Estate", "Residential Real Estate", "Hospitality & Tourism", "Hotels & Resorts",
  "Property Management", "Coworking & Flexible Space",
  "Media & Entertainment", "Gaming", "Music & Audio", "Streaming & Content", "Sports & Fitness", "Events & Live",
  "Publishing & News",
  "Logistics & Supply Chain", "Freight & Shipping", "Airlines & Aviation", "Last-Mile Delivery", "Fleet Management",
  "Maritime & Ports", "Railways",
  "Higher Education", "K-12 Education", "Corporate Training & L&D", "Online Learning Platforms",
  "Government & Public Sector", "Nonprofit & NGO", "International Development", "Civic Tech",
  "Agriculture & Farming", "Food Processing", "Aquaculture & Fisheries", "Cannabis & Hemp",
  "Telecommunications", "5G & Network Infrastructure", "Satellite & Space Tech",
  "Waste Management & Recycling", "Water & Wastewater", "Nuclear", "Social Impact", "Pet Care & Animal Health",
];

interface RecommendedIndustry {
  name: string;
  match_score: number;
  reasoning: string;
  accepted: boolean;
}

function IndustryPicker({ selected, onAdd, onRemove }: { selected: string[]; onAdd: (name: string) => void; onRemove: (name: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return PRESET_INDUSTRIES.filter(i => !selected.includes(i)).slice(0, 15);
    const q = search.toLowerCase();
    return PRESET_INDUSTRIES.filter(i =>
      i.toLowerCase().includes(q) && !selected.includes(i)
    );
  }, [search, selected]);

  const exactMatch = PRESET_INDUSTRIES.some(i => i.toLowerCase() === search.trim().toLowerCase()) || selected.some(i => i.toLowerCase() === search.trim().toLowerCase());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAdd = (name: string) => { onAdd(name); setSearch(""); };
  const handleCustomAdd = () => {
    if (search.trim() && !selected.includes(search.trim())) { onAdd(search.trim()); setSearch(""); }
  };

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.filter(name => name && !/^\d+$/.test(name)).map((name) => (
            <span key={name} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
              {name}
              <button type="button" onClick={() => onRemove(name)} className="ml-0.5 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
            placeholder="Search industries or type your own..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
            {filtered.length > 0 ? (
              <div className="py-1">
                {filtered.slice(0, 20).map(name => (
                  <button key={name} type="button" onClick={() => handleAdd(name)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center justify-between">
                    <span>{name}</span>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : search.trim() && !exactMatch ? (
              <button type="button" onClick={handleCustomAdd}
                className="w-full text-left px-3 py-3 text-sm hover:bg-accent transition-colors flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Add custom: <span className="font-semibold text-primary">"{search.trim()}"</span></span>
              </button>
            ) : search.trim() && exactMatch ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">Already added.</div>
            ) : null}
            {search.trim() && filtered.length > 0 && !exactMatch && (
              <div className="border-t border-border">
                <button type="button" onClick={handleCustomAdd}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-accent transition-colors flex items-center gap-2">
                  <Plus className="h-3 w-3" /><span>Add custom: "{search.trim()}"</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">{PRESET_INDUSTRIES.length} industries available · You can also type any custom industry name</p>
    </div>
  );
}

export default function BusinessProfileSection() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessSummary, setBusinessSummary] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [entityType, setEntityType] = useState("");
  const [userPersona, setUserPersona] = useState("");
  const [aiMaturity, setAiMaturity] = useState("");

  const [recommendedIndustries, setRecommendedIndustries] = useState<RecommendedIndustry[]>([]);
  const [sellingAngles, setSellingAngles] = useState<string[]>([]);

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
      setEntityType((profile as any).entity_type || "");
      setUserPersona((profile as any).user_persona || "");
      setAiMaturity((profile as any).ai_maturity_self || "");
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
    } catch {
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
      let updatedIndustries = [...targetIndustries];
      if (recommendedIndustries.length > 0) {
        const accepted = recommendedIndustries.filter((i) => i.accepted).map((i) => i.name);
        const rejected = recommendedIndustries.filter((i) => !i.accepted).map((i) => i.name);
        accepted.forEach((name) => { if (!updatedIndustries.includes(name)) updatedIndustries.push(name); });
        rejected.forEach((name) => { updatedIndustries = updatedIndustries.filter((n) => n !== name); });
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName, website_url: websiteUrl, business_summary: businessSummary,
          ai_summary: aiSummary, company_size: companySize, role_title: roleTitle,
          location_city: city, location_state: state, target_industries: updatedIndustries,
          entity_type: entityType || null, user_persona: userPersona || null, ai_maturity_self: aiMaturity || null,
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

  const removeIndustry = (name: string) => setTargetIndustries((prev) => prev.filter((n) => n !== name));

  return (
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
              <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={handleScrape} disabled={scraping || !websiteUrl.trim()}
                className="flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                {scraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {scraping ? "Analyzing…" : "Re-analyze"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Building2 className="h-3 w-3" /> Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Briefcase className="h-3 w-3" /> Your Role</label>
              <input type="text" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="VP of Sales"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground"><Users className="h-3 w-3" /> Company Size</label>
            <div className="flex flex-wrap gap-2">
              {companySizes.map((s) => (
                <button key={s} type="button" onClick={() => setCompanySize(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${companySize === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground"><MapPin className="h-3 w-3" /> City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-muted-foreground block">State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="NY"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Business summary */}
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
            <textarea rows={3} value={businessSummary} onChange={(e) => setBusinessSummary(e.target.value)}
              placeholder="Describe what your company does, who you sell to, and what problems you solve..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      </div>

      {/* Business context */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Business Context</h3>
        <p className="text-xs text-muted-foreground mb-4">These shape how VIGYL presents intelligence and labels features for you.</p>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-foreground">Business Model</label>
            <div className="flex flex-wrap gap-2">
              {[{ value: "b2b", label: "B2B" }, { value: "b2c", label: "B2C" }, { value: "d2c", label: "D2C" },
                { value: "government", label: "Government" }, { value: "private", label: "Private" }, { value: "nonprofit", label: "Nonprofit" }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setEntityType(opt.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${entityType === opt.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-foreground">Your Role Focus</label>
            <div className="flex flex-wrap gap-2">
              {[{ value: "sales", label: "Sales / BD" }, { value: "founder", label: "Founder / CEO" }, { value: "executive", label: "Executive" },
                { value: "hr", label: "HR / People Ops" }, { value: "job_seeker", label: "Job Seeker" }, { value: "investor", label: "Investor" },
                { value: "consultant", label: "Consultant" }, { value: "analyst", label: "Analyst" }, { value: "lobbyist", label: "Policy / Lobbying" }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setUserPersona(opt.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${userPersona === opt.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-foreground">AI Maturity</label>
            <div className="flex flex-wrap gap-2">
              {[{ value: "exploring", label: "🔍 Exploring" }, { value: "piloting", label: "🧪 Piloting" },
                { value: "scaling", label: "📈 Scaling" }, { value: "optimizing", label: "⚙️ Optimizing" }, { value: "leading", label: "🚀 Leading" }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setAiMaturity(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${aiMaturity === opt.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target industries */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Target Industries</h3>
        <p className="text-xs text-muted-foreground mb-4">These industries drive your signal feed, prospect engine, and dashboard content.</p>
        <IndustryPicker
          selected={targetIndustries}
          onAdd={(name) => setTargetIndustries(prev => prev.includes(name) ? prev : [...prev, name])}
          onRemove={removeIndustry}
        />
        <div className="mt-4">
          <button type="button" onClick={handleAnalyzeIndustries} disabled={analyzing}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50">
            {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing your business…</> : <><Target className="h-4 w-4" /> AI: Suggest Industries from My Business</>}
          </button>
        </div>

        {recommendedIndustries.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Recommended Industries</span>
              <span className="text-[10px] text-muted-foreground">{recommendedIndustries.filter((i) => i.accepted).length} selected</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recommendedIndustries.map((ind, idx) => (
                <button key={idx} type="button" onClick={() => toggleIndustryRecommendation(idx)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${ind.accepted ? "border-primary bg-primary/5" : "border-border bg-background opacity-60"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{ind.name}</span>
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{ind.match_score}% match</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{ind.reasoning}</p>
                    </div>
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${ind.accepted ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
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
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />{angle}
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

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
