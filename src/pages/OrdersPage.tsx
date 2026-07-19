import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, ClipboardList, Truck, Store } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyBoxArt } from "@/components/common/illustrations";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import { AUTH_COPY } from "@/features/auth/constants";
import { useAuthStore } from "@/store/authStore";
import { customerService } from "@/services/api/customer.service";
import { QK } from "@/constants/query-keys.constants";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/constants/status.constants";
import { ROUTES, buildPath } from "@/routes/paths";
import { formatCurrency, formatDate } from "@/utils/format";
import { tapScale, listContainer, listItem } from "@/animations/variants";

export function OrdersPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [authOpen, setAuthOpen] = useState(false);

  const ordersQuery = useQuery({
    queryKey: QK.orders,
    queryFn: () => customerService.myOrders({ limit: 30 }),
    enabled: isAuthenticated,
  });

  const orders = ordersQuery.data?.data ?? [];

  return (
    <>
      <TopBar large title="Orders" />
      <Page>
        {!isAuthenticated ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" strokeWidth={1.75} />}
            title={AUTH_COPY.PROFILE_TITLE}
            description={AUTH_COPY.PROFILE_SUBTITLE}
            action={<Button onClick={() => setAuthOpen(true)}>{AUTH_COPY.PROFILE_TITLE}</Button>}
          />
        ) : ordersQuery.isLoading ? (
          <LoadingScreen />
        ) : ordersQuery.isError ? (
          <ErrorState error={ordersQuery.error} onRetry={() => ordersQuery.refetch()} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<EmptyBoxArt className="h-16 w-16" />}
            title="No orders yet"
            description="Your cake orders will show up here."
            action={<Button onClick={() => navigate(ROUTES.HOME)}>Browse cakes</Button>}
          />
        ) : (
          <PageSection className="mx-auto w-full pb-8 pt-2 md:max-w-2xl">
            <motion.div variants={listContainer} initial="initial" animate="animate" className="space-y-3">
              {orders.map((order) => (
                <motion.button
                  key={order.id}
                  variants={listItem}
                  type="button"
                  whileTap={tapScale}
                  onClick={() => navigate(buildPath.order(order.id))}
                  className="flex w-full items-center gap-3 rounded-3xl bg-surface p-4 text-left shadow-card"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    {order.deliveryType === "delivery" ? (
                      <Truck className="h-5 w-5" />
                    ) : (
                      <Store className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-extrabold">{order.orderNumber}</span>
                      <Badge tone={ORDER_STATUS_TONE[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
                      {formatDate(order.scheduledDate)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"} ·{" "}
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </span>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60" />
                </motion.button>
              ))}
            </motion.div>
          </PageSection>
        )}
      </Page>

      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={AUTH_COPY.PROFILE_TITLE}
        subtitle={AUTH_COPY.PROFILE_SUBTITLE}
      />
    </>
  );
}
