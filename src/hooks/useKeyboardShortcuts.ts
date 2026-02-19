import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Global keyboard shortcuts for power users
// Cmd/Ctrl + K → Focus search (if one exists on page)
// G then B → Go to Briefing
// G then S → Go to Signals
// G then P → Go to Prospects
// G then I → Go to Pipeline
// G then O → Go to Outreach
// G then R → Go to Reports
// G then A → Go to AI Impact
// ? → Show keyboard shortcut help (optional)

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const handler = useCallback((e: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if ((e.target as HTMLElement)?.isContentEditable) return;

    // Cmd/Ctrl + K → Focus first search input on page
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="earch"]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // G-prefixed navigation (wait for second key)
    if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const onSecondKey = (e2: KeyboardEvent) => {
        document.removeEventListener("keydown", onSecondKey);
        clearTimeout(timeout);
        
        const tag2 = (e2.target as HTMLElement)?.tagName;
        if (tag2 === "INPUT" || tag2 === "TEXTAREA" || tag2 === "SELECT") return;

        const routes: Record<string, string> = {
          b: "/dashboard",
          s: "/signals",
          p: "/prospects",
          i: "/pipeline",
          o: "/outreach",
          r: "/reports",
          a: "/ai-impact",
          t: "/settings",
        };

        const route = routes[e2.key.toLowerCase()];
        if (route) {
          e2.preventDefault();
          navigate(route);
        }
      };

      const timeout = setTimeout(() => {
        document.removeEventListener("keydown", onSecondKey);
      }, 800); // 800ms window for second key

      document.addEventListener("keydown", onSecondKey, { once: true });
      return;
    }

    // Escape → Clear search focus
    if (e.key === "Escape") {
      (document.activeElement as HTMLElement)?.blur?.();
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}
