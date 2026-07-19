import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/themeStore";
import { THEME_MODES } from "@/constants/theme.constants";

/**
 * Applies the resolved light/dark class to <html>. System mode follows the OS
 * and updates live. Brand accent is applied separately (see lib/theme.ts) once
 * the brand loads.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const isDark =
        mode === THEME_MODES.DARK || (mode === THEME_MODES.SYSTEM && media.matches);
      root.classList.toggle("dark", isDark);
    };

    apply();
    if (mode === THEME_MODES.SYSTEM) {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [mode]);

  return <>{children}</>;
}
