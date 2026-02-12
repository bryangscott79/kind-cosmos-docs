import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pageOrder = [
  { label: "Dashboard", path: "/industries" },
  { label: "Signals", path: "/signals" },
  { label: "Prospects", path: "/prospects" },
  { label: "Pipeline", path: "/pipeline" },
  { label: "Outreach", path: "/outreach" },
  { label: "Settings", path: "/settings" },
];

export default function MobilePageNav() {
  const location = useLocation();
  const currentIndex = pageOrder.findIndex((p) =>
    location.pathname.startsWith(p.path)
  );

  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? pageOrder[currentIndex - 1] : null;
  const next = currentIndex < pageOrder.length - 1 ? pageOrder[currentIndex + 1] : null;

  return (
    <nav className="mt-8 flex items-center justify-between border-t border-border pt-4 pb-6 md:hidden">
      {prev ? (
        <Link
          to={prev.path}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={next.path}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {next.label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
