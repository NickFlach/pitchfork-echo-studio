import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { pwaManager } from '@/lib/pwaManager';

// Initialize PWA on app start
pwaManager;

createRoot(document.getElementById("root")!).render(<App />);
