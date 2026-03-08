import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import Home from "./pages/Index";
import Automations from "./pages/Automations";
import Templates from "./pages/Templates";
import Engines from "./pages/Engines";
import Activity from "./pages/Activity";
import Secrets from "./pages/Secrets";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import Login from "./pages/Login";
import System from "./pages/System";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAuth();
  if (!authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { authenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><PageTransition><Home /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/automations" element={<ProtectedRoute><Layout><PageTransition><Automations /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Layout><PageTransition><Templates /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/engines" element={<ProtectedRoute><Layout><PageTransition><Engines /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Layout><PageTransition><Activity /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/secrets" element={<ProtectedRoute><Layout><PageTransition><Secrets /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><PageTransition><Settings /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><Layout><PageTransition><Integrations /></PageTransition></Layout></ProtectedRoute>} />
        <Route path="/system" element={<ProtectedRoute><Layout><PageTransition><System /></PageTransition></Layout></ProtectedRoute>} />
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
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
