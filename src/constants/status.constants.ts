/** Order status vocabulary + display metadata (mirrors backend order_status enum). */

export const ORDER_STATUS = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Tone drives the Badge color; maps to a semantic token. */
export const ORDER_STATUS_TONE: Record<OrderStatus, "neutral" | "primary" | "success" | "warning" | "danger"> = {
  placed: "primary",
  confirmed: "primary",
  preparing: "warning",
  ready: "warning",
  out_for_delivery: "primary",
  delivered: "success",
  cancelled: "danger",
};

export const DELIVERY_TYPE = {
  DELIVERY: "delivery",
  PICKUP: "pickup",
} as const;

export type DeliveryType = (typeof DELIVERY_TYPE)[keyof typeof DELIVERY_TYPE];

export const PAYMENT_METHOD = {
  COD: "cod",
  UPI_MANUAL: "upi_manual",
  OTHER: "other",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PRODUCT_TYPE = {
  CAKE: "cake",
  CUPCAKE: "cupcake",
  CHOCOLATE: "chocolate",
} as const;

export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
