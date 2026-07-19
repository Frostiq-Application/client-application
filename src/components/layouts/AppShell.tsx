import type { ReactNode } from "react";

/**
 * The responsive shell.
 * - Phones (<md): full-bleed native-app experience (safe-area padded) with
 *   the bottom tab bar.
 * - Tablets (md+) and laptops (lg+): full-width web layout; navigation
 *   switches to the top DesktopNav (rendered by the layouts) and page
 *   content sits in centered max-width containers.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-stretch justify-center bg-muted">
      <div
        className="relative flex h-dvh w-full flex-col overflow-hidden bg-background pt-safe-top text-foreground md:pt-0"
        style={{ contain: "layout paint" }}
      >
        {/* App content region — children own their scroll containers. */}
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        {/* iOS home indicator (decorative, hidden from screen readers). */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/25 md:hidden"
        />
      </div>
    </div>
  );
}
