import { APP } from "@/constants/app.constants";

/** Format a numeric-or-string amount as INR currency (₹1,299). */
export function formatCurrency(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return `${APP.CURRENCY_SYMBOL}0`;
  return new Intl.NumberFormat(APP.LOCALE, {
    style: "currency",
    currency: APP.CURRENCY_CODE,
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/** "14:00" -> "2:00 PM". Returns the input unchanged if unparseable. */
export function formatTime(hhmm: string | null): string {
  if (!hhmm) return "";
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "2026-07-19" -> "Sun, 19 Jul". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(APP.LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

/** Two-letter initials for avatars. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + second).toUpperCase() || "?";
}
