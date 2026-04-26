import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Index";
import Automations from "./pages/Automations";
import Templates from "./pages/Templates";
import Engines from "./pages/Engines";
import Agents from "./pages/Agents";
import Runs from "./pages/Runs";
import Activity from "./pages/Activity";
import Secrets from "./pages/Secrets";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import System from "./pages/System";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><PageTransition><Home /></PageTransition></Layout>} />
        <Route path="/automations" element={<Layout><PageTransition><Automations /></PageTransition></Layout>} />
        <Route path="/templates" element={<Layout><PageTransition><Templates /></PageTransition></Layout>} />
        <Route path="/engines" element={<Layout><PageTransition><Engines /></PageTransition></Layout>} />
        <Route path="/agents" element={<Layout><PageTransition><Agents /></PageTransition></Layout>} />
        <Route path="/runs" element={<Layout><PageTransition><Runs /></PageTransition></Layout>} />
        <Route path="/activity" element={<Layout><PageTransition><Activity /></PageTransition></Layout>} />
        <Route path="/secrets" element={<Layout><PageTransition><Secrets /></PageTransition></Layout>} />
        <Route path="/settings" element={<Layout><PageTransition><Settings /></PageTransition></Layout>} />
        <Route path="/integrations" element={<Layout><PageTransition><Integrations /></PageTransition></Layout>} />
        <Route path="/system" element={<Layout><PageTransition><System /></PageTransition></Layout>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
