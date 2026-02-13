import { useState, useEffect } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useIntelligence } from "@/contexts/IntelligenceContext";

export default function IntelligenceLoader({ children }: { children: React.ReactNode }) {
  const { loading, error, hasData, refresh } = useIntelligence();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

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

  if (error && !hasData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Intelligence Generation Failed</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
