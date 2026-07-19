import { STORAGE_KEYS } from "@/constants/app.constants";

/**
 * Token bridge. The axios interceptor reads the token from here without
 * importing the Zustand store (avoids a circular dependency). The auth store
 * is the writer; this is the single source the network layer reads.
 */

interface PersistedAuth {
  token: string | null;
}

let inMemoryToken: string | null = null;

function readPersisted(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: PersistedAuth };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return inMemoryToken ?? readPersisted();
}

export function setToken(token: string | null): void {
  inMemoryToken = token;
}

/** Called on 401 to clear the session; the store subscribes to react. */
type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export function emitUnauthorized(): void {
  unauthorizedListeners.forEach((l) => l());
}
