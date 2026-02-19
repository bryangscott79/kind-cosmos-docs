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
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import IndustryDashboard from "./pages/IndustryDashboard";
import IndustryDetail from "./pages/IndustryDetail";
import AIImpactDashboard from "./pages/AIImpactDashboard";
import SignalFeed from "./pages/SignalFeed";
import Prospects from "./pages/Prospects";
import ProspectDetail from "./pages/ProspectDetail";
import Pipeline from "./pages/Pipeline";
import Outreach from "./pages/Outreach";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DigestPreview from "./pages/DigestPreview";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/industries" element={<ProtectedRoute><IndustryDashboard /></ProtectedRoute>} />
              <Route path="/industries/:slug" element={<ProtectedRoute><IndustryDetail /></ProtectedRoute>} />
              <Route path="/ai-impact" element={<ProtectedRoute><AIImpactDashboard /></ProtectedRoute>} />
              <Route path="/signals" element={<ProtectedRoute><SignalFeed /></ProtectedRoute>} />
              <Route path="/prospects" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Prospect Engine"><Prospects /></TierGate></ProtectedRoute>} />
              <Route path="/prospects/:id" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Prospect Engine"><ProspectDetail /></TierGate></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute><TierGate requiredTier="pro" featureName="Pipeline"><Pipeline /></TierGate></ProtectedRoute>} />
              <Route path="/outreach" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Outreach"><Outreach /></TierGate></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><TierGate requiredTier="starter" featureName="Reports"><Reports /></TierGate></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/digest-preview" element={<ProtectedRoute><DigestPreview /></ProtectedRoute>} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
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
