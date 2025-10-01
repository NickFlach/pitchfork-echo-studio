import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { pwaManager } from "./lib/pwaManager";
import { performanceMonitor } from "./lib/performance";
import { webVitalsReporter } from "./lib/webVitals";

// Initialize PWA manager (service worker registration happens automatically)
pwaManager;

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Performance monitoring enabled');
  performanceMonitor;
}

// Initialize Web Vitals reporting
webVitalsReporter.onMetric((metric) => {
  // You can send metrics to your analytics service here
  console.log('Web Vital:', metric);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
