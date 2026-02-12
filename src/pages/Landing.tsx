import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import IndustryCard from "@/components/IndustryCard";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import UrlAnalyzer from "@/components/landing/UrlAnalyzer";
import { industries } from "@/data/mockData";

export default function Landing() {
  const previewIndustries = industries.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-blue to-brand-purple">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">VIGYL</span>
            <span className="text-xs font-medium text-brand-purple">.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth"
              className="rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(217 91% 55% / 0.06), hsl(245 58% 51% / 0.06), transparent)" }} />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Market Intelligence Platform
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            See the market{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">before</span>{" "}
            your competitors do
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            VIGYL.ai transforms geopolitical, economic, and regulatory signals into actionable sales intelligence.
            Know who to sell to, when, and why.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#analyze"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Try Free Analysis
            </a>
          </div>
        </div>
      </section>

      {/* Features first (was second) */}
      <FeatureShowcase />

      {/* Industry Preview second (was first) — now centered heading */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Industry Health Monitor</h2>
          <p className="mt-2 text-sm text-muted-foreground">Real-time scores across tracked industries</p>
          <Link to="/industries" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View all industries <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewIndustries.map((industry) => (
            <IndustryCard key={industry.id} industry={industry} />
          ))}
        </div>
      </section>

      {/* URL Analyzer */}
      <div id="analyze">
        <UrlAnalyzer />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-brand-blue to-brand-purple">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">VIGYL.ai</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">© 2026 VIGYL.ai — Market intelligence for modern sellers</p>
        </div>
      </footer>
    </div>
  );
}
