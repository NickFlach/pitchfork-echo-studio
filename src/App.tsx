import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { TierProvider, useTier } from "@/contexts/TierContext";
import { UpgradePromptModal } from "@/components/ui/upgrade-prompt";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { queryClient } from "@/lib/queryClient";
import { RouteSEO } from "@/lib/routeSEO";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Whitepaper = lazy(() => import("./pages/Whitepaper"));
const Identity = lazy(() => import("./pages/Identity"));
const Organize = lazy(() => import("./pages/Organize"));
const Verify = lazy(() => import("./pages/Verify"));
const Support = lazy(() => import("./pages/Support"));
const Messages = lazy(() => import("./pages/Messages"));
const Governance = lazy(() => import("./pages/Governance"));
const Leadership = lazy(() => import("./pages/Leadership"));
const EnterpriseLeadership = lazy(() => import("./pages/EnterpriseLeadership"));
const Funding = lazy(() => import("./pages/Funding"));
const Consciousness = lazy(() => import("./pages/Consciousness"));
const AISettings = lazy(() => import("./pages/AISettings"));
const ProviderHealthDashboard = lazy(() => import("./pages/ProviderHealthDashboard"));
const PerformanceMonitor = lazy(() => import("./pages/PerformanceMonitor"));
const DecentralizationDashboard = lazy(() => import("./pages/DecentralizationDashboard"));

const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Global UpgradePrompt component that listens to TierContext
const GlobalUpgradePrompt = () => {
  const { currentUpgradePrompt, dismissUpgradePrompt, trackUpgradeConversion } = useTier();
  
  const handleUpgrade = () => {
    if (currentUpgradePrompt) {
      trackUpgradeConversion(currentUpgradePrompt.featureId, true);
    }
    dismissUpgradePrompt();
  };
  
  return (
    <UpgradePromptModal
      prompt={currentUpgradePrompt}
      onDismiss={dismissUpgradePrompt}
      onUpgrade={handleUpgrade}
    />
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TierProvider>
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <GlobalUpgradePrompt />
                <main>
                  <Routes>
                    <Route path="/" element={<><RouteSEO path="/" /><Index /></>} />
                    <Route path="/whitepaper" element={<><RouteSEO path="/whitepaper" /><Whitepaper /></>} />
                    <Route path="/identity" element={<><RouteSEO path="/identity" /><Identity /></>} />
                    <Route path="/organize" element={<><RouteSEO path="/organize" /><Organize /></>} />
                    <Route path="/verify" element={<><RouteSEO path="/verify" /><Verify /></>} />
                    <Route path="/support" element={<><RouteSEO path="/support" /><Support /></>} />
                    <Route path="/messages" element={<><RouteSEO path="/messages" /><Messages /></>} />
                    <Route path="/governance" element={<><RouteSEO path="/governance" /><Governance /></>} />
                    <Route path="/leadership" element={<><RouteSEO path="/leadership" /><Leadership /></>} />
                    <Route path="/enterprise-leadership" element={<><RouteSEO path="/enterprise-leadership" /><EnterpriseLeadership /></>} />
                    <Route path="/consciousness" element={<><RouteSEO path="/consciousness" /><Consciousness /></>} />
                    <Route path="/funding" element={<><RouteSEO path="/funding" /><Funding /></>} />
                    <Route path="/ai-settings" element={<><RouteSEO path="/ai-settings" /><AISettings /></>} />
                    <Route path="/provider-health" element={<><RouteSEO path="/provider-health" /><ProviderHealthDashboard /></>} />
                    <Route path="/performance" element={<><RouteSEO path="/performance" /><PerformanceMonitor /></>} />
                    <Route path="/decentralization" element={<><RouteSEO path="/decentralization" /><DecentralizationDashboard /></>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </Web3Provider>
      </TierProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
