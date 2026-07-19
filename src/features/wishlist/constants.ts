/** Wishlist screen copy. */

export const WISHLIST_COPY = {
  TITLE: "Wishlist",
  EMPTY_TITLE: "No favourites yet",
  EMPTY_DESCRIPTION: "Tap the heart on any cake to save it here for later.",
  EMPTY_ACTION: "Browse cakes",
  COUNT_ONE: "1 saved item",
  countMany: (n: number) => `${n} saved items`,
  REMOVE: "Remove",
  VEG: "Veg",
  CONTAINS_EGG: "Contains egg",
} as const;
