import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import MobilePageNav from "./MobilePageNav";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  usePageTracking();
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pt-14 md:pt-0 md:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 pb-20 md:pb-6 animate-in fade-in duration-300">
          {children}
          <MobilePageNav />
        </div>
      </main>
    </div>
  );
}
