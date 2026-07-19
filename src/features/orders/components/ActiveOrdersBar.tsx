import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronUp, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useOrderStream, type OrderStreamEvent } from "@/hooks/useOrderStream";
import { useAuthStore } from "@/store/authStore";
import { useCartCount } from "@/store/cartStore";
import { customerService } from "@/services/api/customer.service";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/constants/status.constants";
import { QK } from "@/constants/query-keys.constants";
import { ROUTES, buildPath } from "@/routes/paths";
import { formatCurrency } from "@/utils/format";
import { IOS_SPRING, tapScale } from "@/animations/variants";
import type { Order } from "@/types/domain.types";
import type { Paginated } from "@/types/api.types";
import { ACTIVE_ORDER_STATUSES, ORDERS_BAR_COPY } from "../constants";

const ACTIVE = new Set<string>(ACTIVE_ORDER_STATUSES);

/**
 * Floating live-orders bar on the home tab: collapsed pill with a pulsing
 * red count badge; expands to list every in-flight order with its status.
 * Statuses update in realtime over the customer SSE stream.
 */
export function ActiveOrdersBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartCount = useCartCount();
  const [expanded, setExpanded] = useState(false);

  const ordersQuery = useQuery({
    queryKey: QK.orders,
    queryFn: () => customerService.myOrders({ limit: 20 }),
    enabled: isAuthenticated,
  });

  // Patch the cached order in place so the status flips instantly, then
  // refetch in the background for anything the patch missed.
  useOrderStream((e: OrderStreamEvent) => {
    queryClient.setQueryData<Paginated<Order>>(QK.orders, (prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((o) =>
              o.id === e.orderId ? { ...o, status: e.status } : o,
            ),
          }
        : prev,
    );
    void queryClient.invalidateQueries({ queryKey: QK.orders });
  });

  const active = (ordersQuery.data?.data ?? []).filter((o) => ACTIVE.has(o.status));
  const visible = isAuthenticated && active.length > 0 && pathname === ROUTES.HOME;
  const latest = active[0];

  // Stack above the CartBar (bottom-[84px]) when it's showing.
  const bottomClass = cartCount > 0 ? "bottom-[148px]" : "bottom-[84px]";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: IOS_SPRING }}
          exit={{ y: 90, opacity: 0, transition: { duration: 0.18 } }}
          className={`absolute inset-x-4 z-40 ${bottomClass} lg:inset-x-auto lg:left-8 lg:w-96`}
        >
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="mb-2 overflow-hidden rounded-3xl bg-surface shadow-sheet"
              >
                <div className="max-h-64 space-y-1 overflow-y-auto p-2">
                  {active.map((order) => (
                    <motion.button
                      key={order.id}
                      type="button"
                      whileTap={tapScale}
                      onClick={() => navigate(buildPath.order(order.id))}
                      className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-surface-2/60"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[12px] font-medium text-muted-foreground">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </span>
                      <Badge tone={ORDER_STATUS_TONE[order.status]}>
                        <motion.span
                          key={order.status}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1"
                        >
                          {ORDER_STATUS_LABEL[order.status]}
                        </motion.span>
                      </Badge>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    </motion.button>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.ORDERS)}
                    className="block w-full rounded-2xl p-2 text-center text-[13px] font-bold text-primary"
                  >
                    {ORDERS_BAR_COPY.VIEW_ALL}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            whileTap={tapScale}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="relative flex h-[52px] w-full items-center justify-between rounded-full bg-foreground px-5 text-background shadow-fab"
          >
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-bold">
              <PackageOpen className="h-4.5 w-4.5 shrink-0" strokeWidth={2.4} />
              <span className="truncate">
                {active.length}{" "}
                {active.length === 1 ? ORDERS_BAR_COPY.ONE_ACTIVE : ORDERS_BAR_COPY.MANY_ACTIVE}
                {latest && !expanded && (
                  <span className="font-semibold opacity-70">
                    {" "}
                    · {ORDER_STATUS_LABEL[latest.status]}
                  </span>
                )}
              </span>
            </span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="inline-flex shrink-0">
              <ChevronUp className="h-4.5 w-4.5" strokeWidth={2.6} />
            </motion.span>

            {/* dotted red count badge — pulses to draw the eye */}
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-dotted border-red-300 bg-red-500 px-1 text-xs font-extrabold text-white shadow-sm">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                {active.length}
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
