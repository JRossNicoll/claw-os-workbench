import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  private reload = () => {
    // Hard reload to clear stale Vite chunks (root cause of "Component is not a function")
    window.location.reload();
  };

  private goHome = () => {
    window.location.href = "/";
  };

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const isComponentError = /Component is not a function|Element type is invalid|Cannot read properties of undefined/i.test(
      error.message || ""
    );

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-lg w-full surface-elevated rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Something went wrong</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isComponentError
                  ? "A component failed to load — usually a stale build chunk."
                  : "The app hit an unexpected error."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-terminal-bg p-3 font-mono text-[11px] text-terminal-text max-h-40 overflow-auto terminal-scrollbar">
            <div className="text-destructive mb-1">{error.name}: {error.message}</div>
            {info?.componentStack && (
              <pre className="text-terminal-dim whitespace-pre-wrap leading-4">
                {info.componentStack.split("\n").slice(0, 6).join("\n").trim()}
              </pre>
            )}
          </div>

          {isComponentError && (
            <p className="text-[11px] text-muted-foreground">
              Tip: a hard reload usually clears this. If it persists after reload, the issue is in code — share this error with support.
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={this.reload}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Reload
            </button>
            <button
              onClick={this.goHome}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
