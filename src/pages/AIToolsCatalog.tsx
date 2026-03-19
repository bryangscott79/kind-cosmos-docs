import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, LayoutGrid, Clock, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AIToolCard from "@/components/ai-tools/AIToolCard";
import AIToolCategoryTabs from "@/components/ai-tools/AIToolCategoryTabs";
import AIToolReleaseTimeline from "@/components/ai-tools/AIToolReleaseTimeline";
import { useAITools } from "@/hooks/useAITools";
import { useAuth } from "@/contexts/AuthContext";
import vigylLogo from "@/assets/vigyl-logo.png";

type ViewMode = "catalog" | "releases";

function AIToolsCatalogContent() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("catalog");
  const [maturityFilter, setMaturityFilter] = useState("all");
  const [pricingFilter, setPricingFilter] = useState("all");

  const { tools, isLoading } = useAITools({ category: category === "all" ? undefined : category, search });

  const filtered = useMemo(() => {
    let result = tools;
    if (maturityFilter !== "all") result = result.filter((t) => t.maturity === maturityFilter);
    if (pricingFilter !== "all") result = result.filter((t) => t.pricing_model === pricingFilter);
    return result;
  }, [tools, maturityFilter, pricingFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tools) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [tools]);

  // For release timeline view: flatten all releases with tool info
  const allReleases = useMemo(() => {
    if (viewMode !== "releases") return [];
    return filtered
      .flatMap((tool) =>
        (tool.release_history || []).map((r: { version: string; date: string; highlights: string[] }) => ({
          ...r,
          toolName: tool.name,
          toolSlug: tool.slug,
          toolMaker: tool.maker,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50);
  }, [filtered, viewMode]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Tools Tracker</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track releases, capabilities, and business impact of {tools.length}+ AI tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("catalog")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "catalog" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Catalog
          </button>
          <button
            onClick={() => setViewMode("releases")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === "releases" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Releases
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tools by name, maker, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={maturityFilter}
            onChange={(e) => setMaturityFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Maturity</option>
            <option value="dominant">Dominant</option>
            <option value="mature">Mature</option>
            <option value="growing">Growing</option>
            <option value="emerging">Emerging</option>
          </select>
          <select
            value={pricingFilter}
            onChange={(e) => setPricingFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-4">
        <AIToolCategoryTabs selected={category} onSelect={setCategory} counts={categoryCounts} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading AI tools...</p>
          </div>
        </div>
      )}

      {/* Catalog View */}
      {!isLoading && viewMode === "catalog" && (
        <>
          {filtered.length === 0 ? (
            <div className="mt-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No tools match your filters.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tool) => (
                <AIToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Releases View */}
      {!isLoading && viewMode === "releases" && (
        <div className="mt-6 max-w-2xl">
          {allReleases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No releases found.</p>
          ) : (
            <div className="space-y-0">
              {allReleases.map((r, i) => {
                const date = new Date(r.date);
                const isFirst = i === 0;
                return (
                  <div key={`${r.toolSlug}-${r.version}-${r.date}`} className="relative flex gap-3 pb-5">
                    {i < allReleases.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                    )}
                    <div className="relative z-10 mt-0.5 flex-shrink-0">
                      <div className={`h-4 w-4 rounded-full border-2 ${isFirst ? "border-primary bg-primary" : "border-border bg-muted"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link to={`/ai-tools/${r.toolSlug}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                          {r.toolName}
                        </Link>
                        <span className="text-xs text-muted-foreground">v{r.version}</span>
                        <span className="text-xs text-muted-foreground/50">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {r.highlights.slice(0, 3).map((h: string, j: number) => (
                          <li key={j} className="text-xs text-muted-foreground">• {h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

// CTA for unauthenticated users
function SignUpCTA() {
  return (
    <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-primary" />
      <h3 className="mt-3 text-lg font-semibold text-foreground">See how these tools impact your business</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign up for free to get personalized AI impact analysis for your industry.
      </p>
      <Link
        to="/auth"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Create Free Account
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function AIToolsCatalog() {
  const { session } = useAuth();
  const isAuthenticated = !!session?.user;

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <AIToolsCatalogContent />
      </DashboardLayout>
    );
  }

  // Standalone page for unauthenticated visitors
  return (
    <div className="min-h-screen bg-background">
      <StandaloneHeader />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AIToolsCatalogContent />
        <SignUpCTA />
      </div>
    </div>
  );
}
