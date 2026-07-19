import { STORAGE_KEYS } from "@/constants/app.constants";

/**
 * Stable anonymous device id, used to attribute guest analytics events (e.g.
 * wishlist saves) without an account. Generated once and persisted; survives
 * across sessions until localStorage is cleared. Not PII — a random opaque id.
 */
export function getGuestId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEYS.GUEST_ID);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_KEYS.GUEST_ID, id);
    }
    return id;
  } catch {
    // localStorage unavailable (private mode edge cases) — ephemeral fallback.
    return `g_${Math.random().toString(36).slice(2, 12)}`;
  }
}
