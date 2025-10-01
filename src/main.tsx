import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { pwaManager } from "./lib/pwaManager";
import { performanceMonitor } from "./lib/performance";

// Initialize PWA manager (service worker registration happens automatically)
pwaManager;

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Performance monitoring enabled');
  performanceMonitor;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
