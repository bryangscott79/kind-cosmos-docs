import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { page } from "@/lib/analytics";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/signals": "Signal Feed",
  "/prospects": "Prospects",
  "/pipeline": "Pipeline",
  "/outreach": "Outreach",
  "/reports": "Reports",
  "/ai-impact": "AI Impact",
  "/settings": "Settings",
  "/digest-preview": "Digest Preview",
};

/**
 * Tracks page views automatically on route change.
 * Place once in the app layout.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Match exact or prefix (e.g., /prospects/abc123 → "Prospect Detail")
    const path = location.pathname;
    let name = PAGE_NAMES[path];

    if (!name) {
      if (path.startsWith("/prospects/")) name = "Prospect Detail";
      else name = path.replace(/^\//, "").replace(/-/g, " ") || "Home";
    }

    page(name, { path });
  }, [location.pathname]);
}
