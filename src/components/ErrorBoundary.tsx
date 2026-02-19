import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="mx-auto h-5 w-5 text-destructive/70 mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
          <p className="text-xs text-muted-foreground mb-3">
            {this.props.fallbackMessage || "This section encountered an error."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
