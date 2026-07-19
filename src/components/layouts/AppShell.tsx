import type { ReactNode } from "react";

/**
 * The responsive shell.
 * - Phones (<sm): full-bleed native-app experience (safe-area padded).
 * - Tablets (sm–lg): the 430px phone frame centered with rounded bezel.
 * - Laptop/desktop (lg+): full-width web layout; navigation switches to the
 *   top DesktopNav (rendered by the layouts).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted lg:items-stretch">
      <div
        className="relative flex h-dvh w-full max-w-shell flex-col overflow-hidden bg-background pt-safe-top text-foreground shadow-card sm:max-lg:h-[92dvh] sm:max-lg:max-h-[920px] sm:max-lg:rounded-[2.75rem] sm:max-lg:ring-1 sm:max-lg:ring-black/10 lg:h-dvh lg:max-w-none lg:pt-0 lg:shadow-none"
        style={{ contain: "layout paint" }}
      >
        {/* App content region — children own their scroll containers. */}
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        {/* iOS home indicator (decorative, hidden from screen readers). */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/25 lg:hidden"
        />
      </div>
    </div>
  );
}
