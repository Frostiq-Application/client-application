import { useCallback, useState } from "react";
import { STORAGE_KEYS } from "@/constants/app.constants";
import { RECENT_SEARCHES_MAX } from "../constants";

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Recent search terms, most-recent first, capped and deduped. */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(read);

  const save = useCallback((term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecent((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        RECENT_SEARCHES_MAX,
      );
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    setRecent([]);
  }, []);

  return { recent, save, clear };
}
