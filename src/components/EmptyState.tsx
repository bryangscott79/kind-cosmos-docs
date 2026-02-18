import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          {actionLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          {actionLabel} <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
