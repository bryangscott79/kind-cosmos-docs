import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Sparkles, Globe, Code, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AIToolReleaseTimeline from "@/components/ai-tools/AIToolReleaseTimeline";
import AIToolCompetitors from "@/components/ai-tools/AIToolCompetitors";
import { CATEGORIES } from "@/components/ai-tools/AIToolCategoryTabs";
import { useAITool, useAITools } from "@/hooks/useAITools";
import { useAuth } from "@/contexts/AuthContext";
import vigylLogo from "@/assets/vigyl-logo.png";

const maturityConfig: Record<string, { label: string; class: string; description: string }> = {
  dominant: { label: "Dominant", class: "bg-violet-500/10 text-violet-400 border-violet-500/20", description: "Market leader with widespread adoption" },
  mature: { label: "Mature", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", description: "Established platform with stable features" },
  growing: { label: "Growing", class: "bg-blue-500/10 text-blue-400 border-blue-500/20", description: "Rapidly expanding user base and capabilities" },
  emerging: { label: "Emerging", class: "bg-amber-500/10 text-amber-400 border-amber-500/20", description: "New entrant with promising technology" },
};

const pricingLabels: Record<string, string> = {
  free: "Free / Open Source",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-muted-foreground";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-muted-foreground";
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: {
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

function AIToolDetailContent() {
  const { slug } = useParams<{ slug: string }>();
  const { tool, isLoading, error } = useAITool(slug);
  const { tools: categoryTools } = useAITools({ category: tool?.category });
  const { session } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading tool details...</p>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Sparkles className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Tool not found.</p>
        <Link to="/ai-tools" className="text-sm text-primary hover:underline">
          Back to AI Tools
        </Link>
      </div>
    );
  }

  const cat = CATEGORIES.find((c) => c.id === tool.category);
  const maturity = maturityConfig[tool.maturity || "growing"];
  const CatIcon = cat?.icon;

  return (
    <div>
      {/* Back link */}
      <Link to="/ai-tools" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to AI Tools
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
            {cat && CatIcon && (
              <span className={`inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium ${cat.color}`}>
                <CatIcon className="h-3 w-3" />
                {cat.name}
              </span>
            )}
            {maturity && (
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${maturity.class}`}>
                {maturity.label}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            by {tool.maker}
            {tool.pricing_model && ` · ${pricingLabels[tool.pricing_model] || tool.pricing_model}`}
            {tool.latest_version && ` · v${tool.latest_version}`}
          </p>
          {tool.description && (
            <p className="mt-3 text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
              {tool.description}
            </p>
          )}
        </div>

        {/* Score gauge */}
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-4">
          <span className={`font-mono text-3xl font-bold ${getScoreColor(tool.adoption_score)}`}>
            {tool.adoption_score}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Adoption Score</span>
          <div className="mt-1.5 h-1.5 w-20 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${getScoreBg(tool.adoption_score)}`} style={{ width: `${tool.adoption_score}%` }} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latest Release</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {tool.latest_release_date
              ? new Date(tool.latest_release_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Releases</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{(tool.release_history || []).length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Integrations</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{tool.integrations.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">API</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{tool.api_available ? "Available" : "No"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Capabilities */}
          {tool.key_capabilities.length > 0 && (
            <CollapsibleSection title="Key Capabilities">
              <div className="flex flex-wrap gap-2">
                {tool.key_capabilities.map((cap) => (
                  <span key={cap} className="rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1 text-xs text-primary/80">
                    {cap}
                  </span>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Release History */}
          {(tool.release_history || []).length > 0 && (
            <CollapsibleSection title="Release History">
              <AIToolReleaseTimeline releases={tool.release_history || []} maxItems={8} />
            </CollapsibleSection>
          )}

          {/* Integrations */}
          {tool.integrations.length > 0 && (
            <CollapsibleSection title="Integration Ecosystem" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {tool.integrations.map((int) => (
                  <span key={int} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {int}
                  </span>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Business Impact (gated) */}
          <CollapsibleSection title="Business Impact Analysis" icon={Sparkles} defaultOpen={false}>
            {session?.user ? (
              <div className="text-center py-4">
                <Lock className="mx-auto h-6 w-6 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Personalized business impact analysis coming soon.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Upgrade to Growth to see how {tool.name} can transform your specific business.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Sparkles className="mx-auto h-6 w-6 text-primary/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign up to see how {tool.name} can impact your business.
                </p>
                <Link to="/auth" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  Create Free Account
                </Link>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Links */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Links</h3>
            <div className="space-y-2">
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {tool.api_available && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-3.5 w-3.5" />
                  API Available
                </div>
              )}
            </div>
          </div>

          {/* Maturity info */}
          {maturity && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Maturity</h3>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${maturity.class}`}>
                {maturity.label}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">{maturity.description}</p>
            </div>
          )}

          {/* Tags */}
          {tool.tags.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag) => (
                  <span key={tag} className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Competitors */}
      {categoryTools.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Similar Tools</h3>
          <AIToolCompetitors tools={categoryTools} currentSlug={tool.slug} />
        </div>
      )}
    </div>
  );
}

// Standalone header for unauthenticated visitors
function StandaloneHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center">
          <img src={vigylLogo} alt="VIGYL" className="h-8" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/ai-tools" className="text-sm font-medium text-foreground">
            AI Tools
          </Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            to="/auth"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AIToolDetail() {
  const { session } = useAuth();
  const isAuthenticated = !!session?.user;

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <AIToolDetailContent />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StandaloneHeader />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AIToolDetailContent />
      </div>
    </div>
  );
}
