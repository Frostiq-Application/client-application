import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * The scrollable content region of a screen. Native momentum scrolling,
 * hidden scrollbar. On lg+ the content sits in a centered max-w container
 * so desktop reads as a web app rather than a stretched phone screen.
 */
export function Page({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "scroll-native hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full min-h-full flex-col md:max-w-3xl md:px-6 lg:max-w-5xl xl:max-w-6xl">
        {children}
      </div>
    </div>
  );
}

/** Standard horizontal page padding wrapper. */
export function PageSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4", className)} {...props} />;
}
