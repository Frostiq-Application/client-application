/** Copy for the product-detail feature. */

export const PRODUCT_COPY = {
  PER: "Per",
  CHOOSE_SIZE: "Choose size",
  CHOOSE_FLAVOR: "Choose flavour",
  DESCRIPTION: "Description",
  READ_MORE: "read more",
  READ_LESS: "read less",
  ADD_TO_CART: "Add to Cart",
  VEG: "Veg",
  CONTAINS_EGG: "Contains egg",
  EGGLESS_TILE: "100% Eggless",
  FRESH_TILE: "Made fresh to order",
  ADVANCE_ORDER: (hours: number) => `${hours}h advance order`,
  SHARE_COPIED: "Link copied",
  IN_CART: "In your cart",
  NOT_FOUND: "This product is no longer available",
  FREE_FLAVOR: "Included",
} as const;
