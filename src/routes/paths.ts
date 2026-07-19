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
  LOGIN: "/login",

  NOT_FOUND: "*",
} as const;

/** Path builders for parameterized routes. */
export const buildPath = {
  category: (categoryId: string) => `/category/${categoryId}`,
  product: (productId: string) => `/product/${productId}`,
  order: (orderId: string) => `/orders/${orderId}`,
} as const;
