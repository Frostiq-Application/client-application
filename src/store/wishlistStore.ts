import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/app.constants";
import type { ProductType } from "@/constants/status.constants";
import type { Product } from "@/types/domain.types";
import { defaultVariant } from "@/utils/product";
import { trackWishlist } from "@/services/api/wishlist.tracking";

/**
 * Guest wishlist — persisted locally (no auth needed, like the cart). We store a
 * lightweight snapshot of each saved product so the Wishlist page renders
 * instantly without re-fetching the catalog. Not branch-scoped: favourites
 * follow the shopper across branches; tapping one opens its detail page where
 * branch/variant availability is resolved live.
 */

export interface WishlistItem {
  productId: string;
  shopId: string;
  name: string;
  image: string | null;
  productType: ProductType;
  isEggless: boolean;
  /** Default variant snapshot for the card price line. */
  price: string | null;
  variantLabel: string | null;
  /** When it was saved (newest-first ordering). */
  savedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  /** Add if absent, remove if present. Returns the resulting saved state. */
  toggle: (product: Product) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

function snapshot(product: Product): WishlistItem {
  const variant = defaultVariant(product);
  return {
    productId: product.id,
    shopId: product.shopId,
    name: product.name,
    image: product.images[0] ?? null,
    productType: product.productType,
    isEggless: product.isEggless,
    price: variant?.price ?? null,
    variantLabel: variant?.label ?? null,
    savedAt: Date.now(),
  };
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some((i) => i.productId === product.id);
        if (exists) {
          set((s) => ({ items: s.items.filter((i) => i.productId !== product.id) }));
          trackWishlist(product.shopId, product.id, "unsave");
          return false;
        }
        set((s) => ({ items: [snapshot(product), ...s.items] }));
        trackWishlist(product.shopId, product.id, "save");
        return true;
      },

      remove: (productId) => {
        // Fire the unsave against the item's own branch before dropping it, so
        // analytics "current saved" state stays accurate (WishlistPage's X, not
        // just the heart toggle, must record the unsave).
        const item = get().items.find((i) => i.productId === productId);
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
        if (item) trackWishlist(item.shopId, item.productId, "unsave");
      },

      clear: () => {
        const items = get().items;
        set({ items: [] });
        for (const item of items) {
          trackWishlist(item.shopId, item.productId, "unsave");
        }
      },
    }),
    {
      name: STORAGE_KEYS.WISHLIST,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

/** Reactive saved-state for a single product (for heart fill). */
export function useIsWishlisted(productId: string): boolean {
  return useWishlistStore((s) => s.items.some((i) => i.productId === productId));
}

/** Reactive count for the badge. */
export function useWishlistCount(): number {
  return useWishlistStore((s) => s.items.length);
}
