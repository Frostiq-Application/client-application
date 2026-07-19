/** Centralized TanStack Query keys — stable, hierarchical, invalidation-friendly. */

export const QK = {
  brand: (tenantId: string) => ["brand", tenantId] as const,
  branch: (shopId: string) => ["branch", shopId] as const,
  catalog: (shopId: string) => ["catalog", shopId] as const,
  products: (shopId: string, params?: Record<string, unknown>) =>
    ["products", shopId, params ?? {}] as const,
  product: (shopId: string, productId: string) => ["product", shopId, productId] as const,
  addons: (shopId: string) => ["addons", shopId] as const,

  me: ["me"] as const,
  addresses: ["addresses"] as const,

  cart: (shopId: string) => ["cart", shopId] as const,

  orders: ["orders"] as const,
  order: (id: string) => ["order", id] as const,

  publicCoupons: (shopId: string) => ["coupons", "public", shopId] as const,

  banners: (shopId: string) => ["banners", shopId] as const,
  announcement: (shopId: string) => ["announcement", shopId] as const,
  occasions: (shopId: string) => ["occasions", shopId] as const,

  slots: (shopId: string, date: string) => ["slots", shopId, date] as const,
  availableDates: (shopId: string) => ["available-dates", shopId] as const,

  customCakeOptions: (shopId: string) => ["custom-cake", "options", shopId] as const,
  customCakeRequests: (shopId: string) => ["custom-cake", "requests", shopId] as const,
  customCakeRequest: (shopId: string, id: string) =>
    ["custom-cake", "request", shopId, id] as const,
  customCakeEvents: (shopId: string, id: string) =>
    ["custom-cake", "events", shopId, id] as const,
} as const;
