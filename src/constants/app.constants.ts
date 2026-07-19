/** Global app-level copy and configuration constants. */

export const APP = {
  NAME: "Frostique",
  TAGLINE: "Freshly baked, made to order",
  CURRENCY_SYMBOL: "₹",
  CURRENCY_CODE: "INR",
  LOCALE: "en-IN",
  SHELL_MAX_WIDTH: 430,
} as const;

export const STORAGE_KEYS = {
  AUTH: "frostique-client-auth",
  THEME: "frostique-client-theme",
  BRANCH: "frostique-client-branch",
  CART: "frostique-client-cart",
  WISHLIST: "frostique-client-wishlist",
  RECENT_SEARCHES: "frostique-client-recent-searches",
  CART_SWIPE_HINT: "frostique-client-cart-hint-seen",
  GUEST_ID: "frostique-client-guest",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const;
