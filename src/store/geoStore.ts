import { create } from "zustand";
import type { GeoPoint } from "@/services/api/storefront.service";

/**
 * The customer's current coordinates, once they've granted location.
 *
 * Deliberately in-memory (not persisted): a stale position from a previous
 * session would sort branches by where the customer used to be. Kept in a store
 * rather than component state so every `useBrand()` caller shares one
 * geo-aware brand query instead of forking the cache per component.
 */
interface GeoState {
  geo: GeoPoint | null;
  setGeo: (geo: GeoPoint) => void;
}

export const useGeoStore = create<GeoState>()((set) => ({
  geo: null,
  setGeo: (geo) => set({ geo }),
}));
