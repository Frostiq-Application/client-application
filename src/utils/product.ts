import type { Product, ProductVariant } from "@/types/domain.types";

/** The variant preselected for a product (default flag, else cheapest). */
export function defaultVariant(product: Product): ProductVariant | null {
  if (product.variants.length === 0) return null;
  return (
    product.variants.find((v) => v.isDefault) ??
    [...product.variants].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0] ??
    null
  );
}

/** Lowest variant price — powers the "From ₹x" label. */
export function minPrice(product: Product): number | null {
  if (product.variants.length === 0) return null;
  return Math.min(...product.variants.map((v) => parseFloat(v.price)));
}

/** True when a product needs more than one price point ("From ₹x"). */
export function hasPriceRange(product: Product): boolean {
  const prices = new Set(product.variants.map((v) => v.price));
  return prices.size > 1;
}
