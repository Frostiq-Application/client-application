import { useState } from "react";
import { useParams } from "react-router-dom";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { OrderDetailContent } from "@/features/orders/components/OrderDetailContent";

/**
 * Full-screen pushed order detail — used on phone (<md). Tablet/laptop opens
 * the same content in a right-docked sidebar from OrdersPage instead; see
 * OrderDetailSidebar.
 */
export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  if (!orderId) return null;

  return (
    <>
      <TopBar back title={orderNumber ?? "Order"} />
      <Page className="bg-muted/40">
        <PageSection className="mx-auto w-full pb-10 pt-3 md:max-w-2xl">
          <OrderDetailContent
            orderId={orderId}
            onOrderLoaded={(order) => setOrderNumber(order.orderNumber)}
          />
        </PageSection>
      </Page>
    </>
  );
}
