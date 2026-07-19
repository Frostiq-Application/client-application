import { useCallback, type ReactElement } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, XCircle } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { LoadingScreen } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import {
  CakeBoxArt,
  ChefHatArt,
  ReceiptArt,
  ScooterArt,
  TieredCakeArt,
  WhiskBowlArt,
} from "@/components/common/illustrations";
import { ORDER_STATUS_FUN } from "@/features/orders/constants";
import { useOrderStream, type OrderStreamEvent } from "@/hooks/useOrderStream";
import { customerService } from "@/services/api/customer.service";
import { QK } from "@/constants/query-keys.constants";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/constants/status.constants";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";
import { cn } from "@/lib/cn";
import type { Order } from "@/types/domain.types";

/** The forward pipeline used to render the progress timeline. */
const PIPELINE: OrderStatus[] = [
  ORDER_STATUS.PLACED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

/** Hero illustration per current status. */
const STATUS_ART: Record<string, (p: { className?: string }) => ReactElement> = {
  placed: ReceiptArt,
  confirmed: ChefHatArt,
  preparing: WhiskBowlArt,
  ready: CakeBoxArt,
  out_for_delivery: ScooterArt,
  delivered: TieredCakeArt,
};

const EASE_IOS = [0.32, 0.72, 0, 1] as const;

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QK.order(orderId ?? ""),
    queryFn: () => customerService.myOrder(orderId as string),
    enabled: !!orderId,
  });

  // Fully SSE-driven: patch this order's status the instant the stream reports
  // it, then refetch in the background to pull the fresh timeline entry.
  const onEvent = useCallback(
    (e: OrderStreamEvent) => {
      if (e.orderId !== orderId) return;
      queryClient.setQueryData<Order>(QK.order(orderId), (prev) =>
        prev ? { ...prev, status: e.status } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: QK.order(orderId) });
      void queryClient.invalidateQueries({ queryKey: QK.orders });
    },
    [orderId, queryClient],
  );
  useOrderStream(onEvent);

  const order = query.data;

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !order) {
    return (
      <Page>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Page>
    );
  }

  const cancelled = order.status === ORDER_STATUS.CANCELLED;
  const pipeline =
    order.deliveryType === "pickup"
      ? PIPELINE.filter((s) => s !== ORDER_STATUS.OUT_FOR_DELIVERY)
      : PIPELINE;
  const reachedIndex = pipeline.indexOf(order.status);
  const progress = cancelled
    ? 0
    : pipeline.length > 1
      ? reachedIndex / (pipeline.length - 1)
      : 1;
  const reachedAt = (status: OrderStatus) =>
    order.statusHistory.find((h) => h.status === status)?.changedAt ?? null;

  const fun = ORDER_STATUS_FUN[order.status];
  const Art = cancelled ? null : (STATUS_ART[order.status] ?? ReceiptArt);
  const discount = parseFloat(order.discountAmount) > 0;

  return (
    <>
      <TopBar back title={order.orderNumber} />
      <Page className="bg-muted/40">
        <PageSection className="space-y-4 pb-10 pt-3">
          {/* Hero: animated illustration + playful status copy */}
          <div
            className={cn(
              "relative overflow-hidden rounded-[28px] p-6 text-center shadow-card",
              cancelled
                ? "bg-danger/10"
                : "bg-gradient-to-b from-primary/12 to-surface",
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={order.status}
                initial={{ scale: 0.6, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="mx-auto flex h-28 w-28 items-center justify-center"
              >
                {cancelled ? (
                  <XCircle className="h-20 w-20 text-danger" strokeWidth={1.6} />
                ) : (
                  <motion.div
                    animate={
                      order.status === ORDER_STATUS.OUT_FOR_DELIVERY
                        ? { x: [-4, 4, -4] }
                        : { y: [0, -5, 0] }
                    }
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  >
                    {Art && <Art className="h-24 w-24" />}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${order.status}-copy`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_IOS }}
              >
                <h1 className="mt-2 text-xl font-extrabold tracking-tight">{fun?.title}</h1>
                <p className="mx-auto mt-1 max-w-xs text-[13px] font-medium text-muted-foreground">
                  {cancelled && order.cancellationReason
                    ? order.cancellationReason
                    : fun?.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <p className="mt-3 text-[13px] font-semibold text-muted-foreground">
              {formatDate(order.scheduledDate)}
              {order.scheduledSlotStart &&
                ` · ${formatTime(order.scheduledSlotStart)} – ${formatTime(order.scheduledSlotEnd)}`}
            </p>
          </div>

          {/* Timeline with an animated progress rail */}
          {!cancelled && (
            <div className="rounded-3xl bg-surface p-5 shadow-card">
              <div className="relative">
                {/* rail */}
                <span className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-muted" />
                <motion.span
                  className="absolute left-[11px] top-3 w-0.5 origin-top bg-success"
                  initial={false}
                  animate={{ scaleY: progress }}
                  style={{ height: "calc(100% - 24px)" }}
                  transition={{ duration: 0.5, ease: EASE_IOS }}
                />
                <div className="space-y-5">
                  {pipeline.map((status, i) => {
                    const done = reachedIndex >= i;
                    const current = reachedIndex === i;
                    const at = reachedAt(status);
                    return (
                      <div key={status} className="relative flex items-center gap-3.5">
                        <span
                          className={cn(
                            "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-surface transition-colors",
                            done
                              ? "border-success bg-success text-success-foreground"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {done && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 18 }}
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </motion.span>
                          )}
                          {current && (
                            <motion.span
                              className="absolute inset-0 rounded-full border-2 border-success"
                              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                              transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                            />
                          )}
                        </span>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-bold transition-colors",
                              current && "text-primary",
                              !done && "text-muted-foreground",
                            )}
                          >
                            {ORDER_STATUS_LABEL[status]}
                          </p>
                          {at && (
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Items + bill */}
          <div className="rounded-3xl bg-surface p-5 shadow-card">
            <div className="space-y-3.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      {item.quantity}× {item.productName}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {item.variantLabel}
                      {item.flavorName ? ` · ${item.flavorName}` : ""}
                    </p>
                    {item.addons.length > 0 && (
                      <p className="mt-0.5 text-[11px] font-medium text-primary">
                        + {item.addons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-bold">{formatCurrency(item.lineTotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-dashed border-border pt-3.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Item total</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {discount && (
                <div className="flex justify-between text-success">
                  <span>Coupon discount</span>
                  <span className="font-semibold">−{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-extrabold">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    order.paymentStatus === "paid" ? "bg-success" : "bg-warning",
                  )}
                />
                <p className="text-[11px] font-medium text-muted-foreground">
                  {order.paymentMethod === "cod" ? "Cash on delivery" : "UPI (pay to shop)"} ·{" "}
                  {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                </p>
              </div>
            </div>
          </div>

          {order.customerNote && (
            <div className="rounded-3xl bg-surface-2 p-4 text-sm">
              <p className="font-bold">Note for the bakery</p>
              <p className="mt-1 text-muted-foreground">{order.customerNote}</p>
            </div>
          )}
        </PageSection>
      </Page>
    </>
  );
}
