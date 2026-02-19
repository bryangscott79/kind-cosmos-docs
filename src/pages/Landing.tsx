import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import vigylLogo from "@/assets/vigyl-logo.png";
import IndustryCard from "@/components/IndustryCard";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import UrlAnalyzer from "@/components/landing/UrlAnalyzer";
import { industries } from "@/data/mockData";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TIERS } from "@/lib/tiers";

export default function Landing() {
  const previewIndustries = industries.slice(0, 6);
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal({ threshold: 0.05 });
  const { ref: industryHeadingRef, isVisible: industryHeadingVisible } = useScrollReveal();
  const { ref: analyzerRef, isVisible: analyzerVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollReveal({ threshold: 0.1 });

  const tiers: { key: keyof typeof TIERS; highlight?: boolean }[] = [
    { key: "free" },
    { key: "starter" },
    { key: "pro", highlight: true },
    { key: "enterprise" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <img src={vigylLogo} alt="VIGYL" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
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
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(217 91% 55% / 0.06), hsl(245 58% 51% / 0.06), transparent)" }} />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)",
              transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            Market Intelligence Platform
          </div>
          <h1
            className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
            }}
          >
            See the market{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">before</span>{" "}
            your competitors do
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s",
            }}
          >
            VIGYL.ai transforms geopolitical, economic, and regulatory signals into actionable intelligence — whether you're closing deals, building a company, or navigating your career.
          </p>
          <div
            className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s",
            }}
          >
            {["Sales Teams", "Founders", "Job Seekers", "Analysts", "HR Leaders", "Investors"].map((p) => (
              <span key={p} className="text-xs text-muted-foreground/70">{p}</span>
            ))}
          </div>
          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s",
            }}
          >
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

      {/* Features */}
      <FeatureShowcase />

      {/* Industry Preview */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div
          ref={industryHeadingRef}
          className="text-center mb-8"
          style={{
            opacity: industryHeadingVisible ? 1 : 0,
            transform: industryHeadingVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <h2 className="text-2xl font-bold text-foreground">Industry Health Monitor</h2>
          <p className="mt-2 text-sm text-muted-foreground">Real-time scores across tracked industries</p>
          <Link to="/industries" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View all industries <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewIndustries.map((industry, i) => (
            <IndustryCardAnimated key={industry.id} industry={industry} index={i} />
          ))}
        </div>
      </section>

      {/* URL Analyzer */}
      <div
        id="analyze"
        ref={analyzerRef}
        style={{
          opacity: analyzerVisible ? 1 : 0,
          transform: analyzerVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <UrlAnalyzer />
      </div>

      {/* Pricing */}
      <section
        id="pricing"
        ref={pricingRef}
        className="border-t border-border"
        style={{
          opacity: pricingVisible ? 1 : 0,
          transform: pricingVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">pricing</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Start free. Scale as you grow.</p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map(({ key, highlight }) => {
              const t = TIERS[key];
              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-xl border p-6 text-left transition-all ${
                    highlight
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {t.price === 0 ? "Free" : `$${t.price}`}
                    </span>
                    {t.price > 0 && <span className="text-xs text-muted-foreground">/mo</span>}
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Link
                      to="/auth"
                      className={`block w-full rounded-md px-4 py-2.5 text-center text-xs font-semibold transition-all ${
                        highlight
                          ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-90"
                          : "border border-border bg-card text-foreground hover:bg-accent"
                      }`}
                    >
                      {key === "free" ? "Get Started Free" : "Start " + t.name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            All plans include a 14-day free trial of Pro features.{" "}
            <Link to="/pricing" className="text-primary hover:text-primary/80 font-medium">
              View full plan comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center">
            <img src={vigylLogo} alt="VIGYL" className="h-6" />
          </div>
          <p className="text-xs text-muted-foreground text-center">© 2026 VIGYL.ai — Market intelligence for the AI era</p>
        </div>
      </footer>
    </div>
  );
}

function IndustryCardAnimated({ industry, index }: { industry: any; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s`,
      }}
    >
      <IndustryCard industry={industry} />
    </div>
  );
}
