import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/app.constants";
import type { ProductType } from "@/constants/status.constants";
import type { Product, ProductVariant, FlavorOption } from "@/types/domain.types";
import { defaultVariant } from "@/utils/product";

/**
 * Guest cart — persisted locally until the auth module ships, then migrated to
 * the server cart via POST /cart/migrate. One cart per branch: adding from a
 * different branch replaces the cart (mirrors the backend's cart-per-shop rule).
 */

export interface CartLineAddon {
  addonId: string;
  name: string;
  /** Snapshot price at attach time. */
  price: number;
  /** How many of this extra (independent of the line quantity). */
  quantity: number;
}

export interface CartLine {
  /** productId:variantId:flavorId — merge key. */
  key: string;
  shopId: string;
  productId: string;
  name: string;
  image: string | null;
  productType: ProductType;
  variantId: string;
  variantLabel: string;
  /** Variant price + flavour delta, snapshot at add time. */
  unitPrice: number;
  flavorOptionId: string | null;
  flavorName: string | null;
  quantity: number;
  /** Checkout extras (candles, card…) attached to this line. */
  addons: CartLineAddon[];
}

export type AddResult = "added" | "replaced-branch";

interface CartState {
  shopId: string | null;
  items: CartLine[];
  add: (line: Omit<CartLine, "key" | "quantity" | "addons">, quantity?: number) => AddResult;
  setQuantity: (key: string, quantity: number) => void;
  /** Set an extra's quantity on a line; 0 removes it. */
  setAddonQuantity: (key: string, addon: Omit<CartLineAddon, "quantity">, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

/** Extras total for a line (each addon × its own quantity). */
export function lineAddonsTotal(line: CartLine): number {
  return line.addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
}

/** Full line total: product × quantity, plus extras. */
export function lineTotal(line: CartLine): number {
  return line.unitPrice * line.quantity + lineAddonsTotal(line);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      shopId: null,
      items: [],

      add: (line, quantity = 1) => {
        const key = `${line.productId}:${line.variantId}:${line.flavorOptionId ?? "none"}`;
        const state = get();
        const differentBranch = state.shopId !== null && state.shopId !== line.shopId;
        const items = differentBranch ? [] : [...state.items];

        const existing = items.find((i) => i.key === key);
        if (existing) {
          existing.quantity += quantity;
          set({ items: [...items] });
        } else {
          set({
            shopId: line.shopId,
            items: [...items, { ...line, key, quantity, addons: [] }],
          });
        }
        return differentBranch ? "replaced-branch" : "added";
      },

      setQuantity: (key, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),

      setAddonQuantity: (key, addon, quantity) =>
        set((s) => ({
          items: s.items.map((i) => {
            if (i.key !== key) return i;
            const rest = i.addons.filter((a) => a.addonId !== addon.addonId);
            return {
              ...i,
              addons: quantity <= 0 ? rest : [...rest, { ...addon, quantity }],
            };
          }),
        })),

      remove: (key) =>
        set((s) => {
          const items = s.items.filter((i) => i.key !== key);
          return { items, shopId: items.length ? s.shopId : null };
        }),

      clear: () => set({ items: [], shopId: null }),
    }),
    {
      name: STORAGE_KEYS.CART,
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted) => {
        // v1 carts predate line addons; v2 addons predate quantities.
        const state = persisted as CartState;
        return {
          ...state,
          items: (state.items ?? []).map((i) => ({
            ...i,
            addons: (i.addons ?? []).map((a) => ({ ...a, quantity: a.quantity ?? 1 })),
          })),
        };
      },
    },
  ),
);

/** Reactive cart badge/count. */
export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
}

/** Reactive subtotal (number, INR) — includes line extras. */
export function useCartSubtotal(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + lineTotal(i), 0));
}

/** Build a cart line for a product + chosen variant/flavour. */
export function buildCartLine(
  product: Product,
  variant: ProductVariant,
  flavor: FlavorOption | null,
): Omit<CartLine, "key" | "quantity" | "addons"> {
  return {
    shopId: product.shopId,
    productId: product.id,
    name: product.name,
    image: product.images[0] ?? null,
    productType: product.productType,
    variantId: variant.id,
    variantLabel: variant.label,
    unitPrice: parseFloat(variant.price) + (flavor ? parseFloat(flavor.priceDelta) : 0),
    flavorOptionId: flavor?.id ?? null,
    flavorName: flavor?.flavorName ?? null,
  };
}

/** Quick-add with the default variant (home "+" and Add-to-Cart shortcuts). */
export function quickAdd(product: Product): AddResult | "no-variant" {
  const variant = defaultVariant(product);
  if (!variant) return "no-variant";
  return useCartStore.getState().add(buildCartLine(product, variant, null));
}
