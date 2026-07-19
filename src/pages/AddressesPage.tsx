import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { AddressSheet } from "@/features/checkout/components/AddressSheet";
import { CHECKOUT_COPY } from "@/features/checkout/constants";
import { customerService } from "@/services/api/customer.service";
import { QK } from "@/constants/query-keys.constants";
import { TOAST } from "@/constants/toast.constants";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";

export function AddressesPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  const query = useQuery({
    queryKey: QK.addresses,
    queryFn: () => customerService.listAddresses(),
  });
  const addresses = query.data ?? [];

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: QK.addresses });

  const remove = useMutation({
    mutationFn: (id: string) => customerService.deleteAddress(id),
    onSuccess: () => {
      invalidate();
      toast.show(TOAST.ADDRESS_DELETED);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const makeDefault = useMutation({
    mutationFn: (id: string) => {
      const address = addresses.find((a) => a.id === id);
      return customerService.updateAddress(id, {
        fullAddress: address?.fullAddress ?? "",
        label: address?.label ?? undefined,
        landmark: address?.landmark ?? undefined,
        city: address?.city ?? undefined,
        pincode: address?.pincode ?? undefined,
        isDefault: true,
      });
    },
    onSuccess: invalidate,
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <>
      <TopBar back title="Saved addresses" />
      <Page>
        {query.isLoading ? (
          <LoadingScreen />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-7 w-7" strokeWidth={1.75} />}
            title="No addresses yet"
            description="Save an address for faster checkout."
            action={
              <Button onClick={() => setSheetOpen(true)}>{CHECKOUT_COPY.ADD_ADDRESS}</Button>
            }
          />
        ) : (
          <PageSection className="space-y-3 pb-8 pt-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-3xl bg-surface p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold">{a.label ?? "Address"}</p>
                  {a.isDefault && <Badge tone="primary">Default</Badge>}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {a.fullAddress}
                  {a.landmark ? `, ${a.landmark}` : ""}
                  {a.city ? `, ${a.city}` : ""}
                  {a.pincode ? ` – ${a.pincode}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  {!a.isDefault && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={makeDefault.isPending}
                      onClick={() => makeDefault.mutate(a.id)}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Make default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    loading={remove.isPending}
                    onClick={() => remove.mutate(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" block onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" />
              {CHECKOUT_COPY.ADD_ADDRESS}
            </Button>
          </PageSection>
        )}
      </Page>

      <AddressSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
