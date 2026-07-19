/**
 * API endpoint paths for the frostique service-application storefront surface.
 * Base URL and versioning live in src/config/env.ts.
 */

export const API_ENDPOINTS = {
  // Discovery (public)
  brand: (tenantId: string) => `/storefront/tenant/${tenantId}`,
  brandBranches: (appSlug: string) => `/storefront/brand/${appSlug}/branches`,
  branch: (shopId: string) => `/storefront/branches/${shopId}`,
  branchCatalog: (shopId: string) => `/storefront/branches/${shopId}/catalog`,
  branchProducts: (shopId: string) => `/storefront/branches/${shopId}/products`,
  branchAddons: (shopId: string) => `/storefront/branches/${shopId}/addons`,
  branchProduct: (shopId: string, productId: string) =>
    `/storefront/branches/${shopId}/products/${productId}`,
  wishlistTrack: (shopId: string) => `/storefront/branches/${shopId}/wishlist/track`,

  // Custom cake ordering (add-on module)
  customCakeOptions: (shopId: string) =>
    `/storefront/branches/${shopId}/custom-cake/options`,
  customCakeRequests: (shopId: string) =>
    `/storefront/branches/${shopId}/custom-cake/requests`,
  customCakeRequest: (shopId: string, id: string) =>
    `/storefront/branches/${shopId}/custom-cake/requests/${id}`,
  customCakeRequestEvents: (shopId: string, id: string) =>
    `/storefront/branches/${shopId}/custom-cake/requests/${id}/events`,
  customCakeRespond: (shopId: string, id: string) =>
    `/storefront/branches/${shopId}/custom-cake/requests/${id}/respond`,
  customCakeUpload: (shopId: string) =>
    `/storefront/branches/${shopId}/custom-cake/upload`,

  // Customer auth + profile
  googleLogin: "/storefront/auth/google",
  me: "/storefront/auth/me",
  profile: "/storefront/profile",
  addresses: "/storefront/addresses",
  address: (id: string) => `/storefront/addresses/${id}`,

  // Cart
  cart: "/cart",
  cartItems: "/cart/items",
  cartItem: (itemId: string) => `/cart/items/${itemId}`,
  cartMigrate: "/cart/migrate",

  // Orders (customer)
  myOrders: "/my/orders",
  myOrder: (id: string) => `/my/orders/${id}`,

  // CMS (public storefront)
  banners: (shopId: string) => `/cms/storefront/${shopId}/banners`,
  announcement: (shopId: string) => `/cms/storefront/${shopId}/announcement`,
  occasions: (shopId: string) => `/cms/storefront/${shopId}/occasions`,
  brandContent: (appSlug: string) => `/cms/storefront/brand/${appSlug}/content`,

  // Coupons
  publicCoupons: (shopId: string) => `/coupons/public/${shopId}`,
  validateCoupon: "/coupons/validate",

  // Scheduling
  slots: "/scheduling/slots",
  availableDates: "/scheduling/available-dates",
} as const;
