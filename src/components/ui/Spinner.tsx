import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-muted-foreground", className)}
      aria-label="Loading"
    />
  );
}

/** Full-region centered loader. */
export function LoadingScreen() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Spinner className="h-7 w-7 text-primary" />
    </div>
  );
}
