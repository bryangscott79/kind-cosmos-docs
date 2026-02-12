import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import IndustryDashboard from "./pages/IndustryDashboard";
import IndustryDetail from "./pages/IndustryDetail";
import SignalFeed from "./pages/SignalFeed";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/industries" element={<IndustryDashboard />} />
          <Route path="/industries/:slug" element={<IndustryDetail />} />
          <Route path="/signals" element={<SignalFeed />} />
          <Route path="/prospects" element={<ComingSoon title="Prospect Engine" />} />
          <Route path="/pipeline" element={<ComingSoon title="Pipeline & CRM" />} />
          <Route path="/outreach" element={<ComingSoon title="Outreach Studio" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
