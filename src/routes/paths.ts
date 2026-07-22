/** Central route path registry. Use these everywhere — no hardcoded URLs. */

export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  ORDERS: "/orders",
  PROFILE: "/profile",

  BRANCHES: "/branches",
  CATEGORY: "/category/:categoryId",
  PRODUCT: "/product/:productId",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_DETAIL: "/orders/:orderId",
  ADDRESSES: "/profile/addresses",
  WISHLIST: "/wishlist",
  CUSTOM_CAKE: "/custom-cake",
  CUSTOM_CAKE_DESCRIBE: "/custom-cake/describe",
  CUSTOM_CAKE_GUIDED: "/custom-cake/guided",
  CUSTOM_CAKE_REQUESTS: "/custom-cake/requests",
  CUSTOM_CAKE_REQUEST_DETAIL: "/custom-cake/requests/:requestId",
  LOGIN: "/login",

  NOT_FOUND: "*",
} as const;

/** Query param the Search screen reads its category filter from. */
export const SEARCH_CATEGORY_PARAM = "category";

/** Path builders for parameterized routes. */
export const buildPath = {
  category: (categoryId: string) => `/category/${categoryId}`,
  /** Search screen pre-filtered to one category (home category chips). */
  search: (categoryId: string) =>
    `${ROUTES.SEARCH}?${SEARCH_CATEGORY_PARAM}=${encodeURIComponent(categoryId)}`,
  product: (productId: string) => `/product/${productId}`,
  order: (orderId: string) => `/orders/${orderId}`,
  customCakeRequest: (requestId: string) => `/custom-cake/requests/${requestId}`,
} as const;
