/** Copy for the orders feature (floating live-status bar). */

export const ORDERS_BAR_COPY = {
  ONE_ACTIVE: "order in progress",
  MANY_ACTIVE: "orders in progress",
  VIEW_ALL: "View all orders",
} as const;

/** Playful per-status hero copy for the order detail screen. */
export const ORDER_STATUS_FUN: Record<
  string,
  { title: string; description: string }
> = {
  placed: {
    title: "Order received!",
    description: "The bakery just got your order — sweet things are coming.",
  },
  confirmed: {
    title: "The bakers said yes",
    description: "Your order is locked in and headed for the kitchen.",
  },
  preparing: {
    title: "Whisks are whirring",
    description: "Your treats are being made fresh right now.",
  },
  ready: {
    title: "Boxed & beautiful",
    description: "All packed up with a bow on top, ready to go.",
  },
  out_for_delivery: {
    title: "Zooming your way!",
    description: "Hold tight — your goodies are on the road.",
  },
  delivered: {
    title: "Delivered — dig in! 🎉",
    description: "Enjoy every last crumb. Thanks for ordering with us.",
  },
  cancelled: {
    title: "This order was cancelled",
    description: "Anything paid will be settled by the bakery.",
  },
};

/** Statuses that still need the customer's attention on the live bar. */
export const ACTIVE_ORDER_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
] as const;
