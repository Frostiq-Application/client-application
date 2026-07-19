/** Theme mode options and the brand accent presets (mirror the portal). */

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

/** Preset brand accents used across the platform (kept in sync with portal). */
export const THEME_PRESETS = [
  "#E91E63", // Frosting pink (default)
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#6366F1",
] as const;

export const DEFAULT_BRAND_COLOR = THEME_PRESETS[0];
