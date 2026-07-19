/** Copy for the Home / catalog-browse feature. */

export const HOME_COPY = {
  ORDERING_FROM: "Ordering from",
  OFFERS: "Offers for you",
  USE_CODE: "Use code",
  MIN_ORDER: "on orders above",
  COUPON_COPIED: "Coupon code copied",
  SELECT_BRANCH: "Select branch",
  SEARCH_PLACEHOLDER: 'Search "chocolate truffle"…',
  ALL_CHIP: "All",
  TOP_PRODUCTS: "Top Products",
  MOST_ORDERED: "Most Ordered",
  EXPLORE_ALL: "Explore All",
  ADD_TO_CART: "Add to Cart",
  VEG: "Veg",
  CONTAINS_EGG: "Contains egg",
  NO_NOTIFICATIONS: "No new notifications",
  OPEN_NOW: "Open now",
  CLOSED_NOW: "Closed",
  USE_MY_LOCATION: "Use my location",
  LOCATING: "Locating…",
  EGGLESS: "Eggless",
  FROM_PRICE: "From",
  SEE_ALL: "See all",
  EMPTY_CATALOG_TITLE: "The oven is warming up",
  EMPTY_CATALOG_DESC: "This branch hasn't added any products yet. Check back soon!",
} as const;

/** Rotating search-bar suggestions (Blinkit-style animated placeholder). */
export const SEARCH_SUGGESTIONS = [
  "chocolate truffle",
  "red velvet",
  "birthday cake",
  "cupcakes",
  "eggless cakes",
  "anniversary special",
  "chocolates",
] as const;

export const SEARCH_PREFIX = "Search";
export const SEARCH_ROTATE_MS = 2600;

/** Time-of-day greetings for the home hero. */
export const GREETINGS = {
  MORNING: "Good morning ☀️",
  AFTERNOON: "Good afternoon 🌤️",
  EVENING: "Good evening 🌙",
} as const;

export function getGreeting(hour: number): string {
  if (hour < 12) return GREETINGS.MORNING;
  if (hour < 17) return GREETINGS.AFTERNOON;
  return GREETINGS.EVENING;
}

