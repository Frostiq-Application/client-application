import { DEFAULT_BRAND_COLOR } from "@/constants/theme.constants";

/** Convert a #RRGGBB hex to an "H S% L%" triple for our CSS variables. */
export function hexToHslTriple(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Pick a readable foreground (black/white) for a given accent lightness. */
function foregroundFor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "240 10% 8%" : "0 0% 100%";
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Override only the brand accent CSS vars from an account theme_color.
 * Neutral surfaces/text stay untouched (scope: accent only).
 */
export function applyBrandTheme(hex: string | null | undefined): void {
  const color = hex && HEX_RE.test(hex) ? hex : DEFAULT_BRAND_COLOR;
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHslTriple(color));
  root.style.setProperty("--primary-foreground", foregroundFor(color));
}
