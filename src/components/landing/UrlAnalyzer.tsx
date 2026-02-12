import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Loader2, Sparkles, ArrowRight, Target, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IndustryMatch {
  name: string;
  match_score: number;
  reasoning: string;
}

interface Analysis {
  company_summary: string;
  target_industries: IndustryMatch[];
  selling_angles: string[];
}

export default function UrlAnalyzer() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [websiteTitle, setWebsiteTitle] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { url },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Analysis failed");

      setAnalysis(data.analysis);
      setWebsiteTitle(data.website_title || "");
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-500";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-400";
  };

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="h-3 w-3" />
            Free Industry Analysis
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Discover your{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
              ideal target industries
            </span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            Enter your website URL and our AI will analyze your business to identify the industries where your product has the strongest market fit
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleAnalyze} className="mx-auto max-w-xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full rounded-lg border border-border bg-card pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Analyze</>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {analysis && (
          <div className="mx-auto mt-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Company summary */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                <div>
                  {websiteTitle && (
                    <p className="text-xs font-medium text-primary mb-1">{websiteTitle}</p>
                  )}
                  <p className="text-sm text-foreground leading-relaxed">{analysis.company_summary}</p>
                </div>
              </div>
            </div>

            {/* Target Industries */}
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Recommended Target Industries
            </h3>
            <div className="space-y-3 mb-6">
              {analysis.target_industries
                .sort((a, b) => b.match_score - a.match_score)
                .map((ind, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{ind.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${getBarColor(ind.match_score)}`} style={{ width: `${ind.match_score}%` }} />
                        </div>
                        <span className={`text-sm font-mono font-bold ${getScoreColor(ind.match_score)}`}>
                          {ind.match_score}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ind.reasoning}</p>
                  </div>
                ))}
            </div>

            {/* Selling Angles */}
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Key Selling Angles
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 mb-8">
              {analysis.selling_angles.map((angle, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{angle}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Sign Up to Track These Industries <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
