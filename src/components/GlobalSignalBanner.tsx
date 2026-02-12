import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function GlobalSignalBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-xs text-foreground">
        <span className="font-semibold">Macro Alert:</span>{" "}
        New AI safety executive order impacts 6 industries — Cybersecurity and AI sectors see immediate regulatory demand.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
