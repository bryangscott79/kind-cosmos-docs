import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { IntelligenceProvider } from "@/contexts/IntelligenceContext";
import { ArgusProvider } from "@/contexts/ArgusContext";
import ArgusChat from "@/components/ArgusChat";
import ProtectedRoute from "@/components/ProtectedRoute";
import TierGate from "@/components/TierGate";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy-loaded pages — each becomes its own chunk
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pricing = lazy(() => import("./pages/Pricing"));
const IndustryDashboard = lazy(() => import("./pages/IndustryDashboard"));
const IndustryDetail = lazy(() => import("./pages/IndustryDetail"));
const SignalFeed = lazy(() => import("./pages/SignalFeed"));
const Prospects = lazy(() => import("./pages/Prospects"));
const ProspectDetail = lazy(() => import("./pages/ProspectDetail"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Outreach = lazy(() => import("./pages/Outreach"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const DigestPreview = lazy(() => import("./pages/DigestPreview"));
const Admin = lazy(() => import("./pages/Admin"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <IntelligenceProvider>
            <ArgusProvider>
            <ErrorBoundary fallbackMessage="Something went wrong loading this page. Try refreshing.">
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/industries" element={<ProtectedRoute><IndustryDashboard /></ProtectedRoute>} />
              <Route path="/industries/:slug" element={<ProtectedRoute><IndustryDetail /></ProtectedRoute>} />
              <Route path="/ai-impact" element={<ProtectedRoute><IndustryDashboard /></ProtectedRoute>} />
              <Route path="/signals" element={<ProtectedRoute><SignalFeed /></ProtectedRoute>} />
              <Route path="/prospects" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Prospect Engine"><Prospects /></TierGate></ProtectedRoute>} />
              <Route path="/prospects/:id" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Prospect Engine"><ProspectDetail /></TierGate></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute><TierGate requiredTier="pro" featureName="Pipeline"><Pipeline /></TierGate></ProtectedRoute>} />
              <Route path="/outreach" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Outreach"><Outreach /></TierGate></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Reports"><Reports /></TierGate></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/digest-preview" element={<ProtectedRoute><DigestPreview /></ProtectedRoute>} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/invite/:token" element={<AcceptInvite />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
            <ArgusChat />
            </ArgusProvider>
          </IntelligenceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
