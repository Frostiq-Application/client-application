import { WifiOff, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "./EmptyState";
import { ERROR_MESSAGES, ERROR_TITLES } from "@/constants/error.constants";
import { normalizeError } from "@/lib/apiError";

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

/** Renders a friendly API-error screen (offline-aware) with retry. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const normalized = normalizeError(error);
  const offline = normalized.status === 0;

  return (
    <EmptyState
      icon={
        offline ? (
          <WifiOff className="h-7 w-7" strokeWidth={1.75} />
        ) : (
          <AlertCircle className="h-7 w-7" strokeWidth={1.75} />
        )
      }
      title={offline ? ERROR_TITLES.OFFLINE : ERROR_TITLES.GENERIC}
      description={normalized.message || ERROR_MESSAGES.GENERIC}
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )
      }
    />
  );
}
