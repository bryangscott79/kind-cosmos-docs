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
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Generating Your Intelligence</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Analyzing your business profile, target industries, and location to create personalized market signals, prospects, and industry insights…
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">
              {elapsed < 20 ? "This may take 15-30 seconds" : elapsed < 45 ? "Still working… generating a large dataset" : "Almost there… finalizing your intelligence"}
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
