import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ERROR_MESSAGES, ERROR_TITLES } from "@/constants/error.constants";
import { env } from "@/config/env";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Top-level crash guard: renders a recoverable fallback instead of a white screen. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (env.isDev) {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  private reset = () => this.setState({ error: null });

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-danger/12 text-danger">
            <AlertCircle className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-bold">{ERROR_TITLES.GENERIC}</h1>
          <p className="mt-1.5 max-w-[18rem] text-sm text-muted-foreground">
            {ERROR_MESSAGES.GENERIC}
          </p>
          <Button className="mt-6" variant="secondary" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
