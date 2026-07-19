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
  CUSTOM_CAKE_REQUESTS: "/custom-cake/requests",
  CUSTOM_CAKE_REQUEST_DETAIL: "/custom-cake/requests/:requestId",
  LOGIN: "/login",

  NOT_FOUND: "*",
} as const;

/** Path builders for parameterized routes. */
export const buildPath = {
  category: (categoryId: string) => `/category/${categoryId}`,
  product: (productId: string) => `/product/${productId}`,
  order: (orderId: string) => `/orders/${orderId}`,
  customCakeRequest: (requestId: string) => `/custom-cake/requests/${requestId}`,
} as const;
