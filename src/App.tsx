import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import IndustryDashboard from "./pages/IndustryDashboard";
import IndustryDetail from "./pages/IndustryDetail";
import SignalFeed from "./pages/SignalFeed";
import Prospects from "./pages/Prospects";
import Pipeline from "./pages/Pipeline";
import Outreach from "./pages/Outreach";
import Settings from "./pages/Settings";
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
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
