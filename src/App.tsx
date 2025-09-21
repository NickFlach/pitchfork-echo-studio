import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { queryClient } from "@/lib/queryClient";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Identity = lazy(() => import("./pages/Identity"));
const Organize = lazy(() => import("./pages/Organize"));
const Verify = lazy(() => import("./pages/Verify"));
const Support = lazy(() => import("./pages/Support"));
const Messages = lazy(() => import("./pages/Messages"));
const Governance = lazy(() => import("./pages/Governance"));
const Leadership = lazy(() => import("./pages/Leadership"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/identity" element={<Identity />} />
              <Route path="/organize" element={<Organize />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/support" element={<Support />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/leadership" element={<Leadership />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
