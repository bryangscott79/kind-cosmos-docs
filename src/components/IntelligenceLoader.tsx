import { useState, useEffect } from "react";
import { Loader2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useIntelligence } from "@/contexts/IntelligenceContext";

export default function IntelligenceLoader({ children }: { children: React.ReactNode }) {
  const { loading, error, hasData, refresh, isBackgroundRefreshing, isUsingSeedData } = useIntelligence();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading || hasData) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading, hasData]);

  // Only show full-screen loader when loading AND absolutely no data (not even seed)
  if (loading && !hasData) {
    return (
      <DashboardLayout>
        <div className="space-y-5 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-end justify-between">
            <div>
              <div className="h-6 w-48 rounded bg-secondary" />
              <div className="mt-2 h-3 w-72 rounded bg-secondary" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-md bg-secondary" />
              <div className="h-9 w-40 rounded-md bg-secondary" />
            </div>
          </div>
          {/* Stats bar skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <div className="h-2.5 w-20 rounded bg-secondary" />
                <div className="mt-2 h-7 w-12 rounded bg-secondary" />
              </div>
            ))}
          </div>
          {/* Content skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-16 rounded-full bg-secondary" />
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-secondary" />
                  <div className="mt-2 h-3 w-full rounded bg-secondary" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="h-3 w-24 rounded bg-secondary mb-2" />
                  <div className="h-5 w-16 rounded bg-secondary" />
                </div>
              ))}
            </div>
          </div>
          {/* Loading message */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">
              {elapsed < 20 ? "Generating your intelligence — 15-30 seconds" : elapsed < 45 ? "Still working — large dataset" : "Almost there — finalizing"}
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If using seed data or there was an error, show a dismissible banner — but still render content
  return (
    <>
      {(isUsingSeedData || (error && hasData)) && (
        <div className="fixed top-0 left-0 right-0 z-50 md:left-60">
          <div className="mx-auto max-w-4xl px-4 pt-2 md:pt-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                {isUsingSeedData ? (
                  <>
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground">
                      Showing sample data while your personalized intelligence loads.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-foreground">
                      Intelligence refresh failed. Showing your last cached data.
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={refresh}
                disabled={loading || isBackgroundRefreshing}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {(loading || isBackgroundRefreshing) ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {isUsingSeedData ? "Generate Now" : "Retry"}
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
