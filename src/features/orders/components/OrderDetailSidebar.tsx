import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { OrderDetailContent } from "./OrderDetailContent";
import { IOS_SPRING } from "@/animations/variants";

export interface OrderDetailSidebarProps {
  orderId: string | null;
  onClose: () => void;
}

/**
 * Right-docked order detail panel for tablet/laptop (md+): slides in beside
 * the order list instead of replacing it, so browsing orders and reading one
 * happen side by side. Phone keeps the full pushed screen (OrderDetailPage).
 */
export function OrderDetailSidebar({ orderId, onClose }: OrderDetailSidebarProps) {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const open = !!orderId;

  // Reset the cached title when switching to a different order, so the old
  // number doesn't flash while the new one loads.
  useEffect(() => {
    setOrderNumber(null);
  }, [orderId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/35"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={orderNumber ?? "Order details"}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={IOS_SPRING}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden bg-background shadow-sheet lg:max-w-lg"
          >
            <div className="blur-surface flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="truncate text-lg font-bold">{orderNumber ?? "Order"}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="press -mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
              >
                <X className="h-4.5 w-4.5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="scroll-native hide-scrollbar min-h-0 flex-1 overflow-y-auto bg-muted/40 p-5">
              {orderId && (
                <OrderDetailContent
                  key={orderId}
                  orderId={orderId}
                  onOrderLoaded={(order) => setOrderNumber(order.orderNumber)}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
