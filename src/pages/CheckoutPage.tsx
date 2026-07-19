import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Banknote,
  CalendarDays,
  ChevronRight,
  MapPin,
  Plus,
  Store,
  TicketPercent,
  Truck,
} from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import { AddressSheet } from "@/features/checkout/components/AddressSheet";
import { ConfirmOrderSheet } from "@/features/checkout/components/ConfirmOrderSheet";
import { CouponSheet } from "@/features/checkout/components/CouponSheet";
import { OrderSuccessOverlay } from "@/features/checkout/components/OrderSuccessOverlay";
import { ScheduleSheet, type ScheduleSlot } from "@/features/checkout/components/ScheduleSheet";
import { CHECKOUT_COPY } from "@/features/checkout/constants";
import { useAuthStore } from "@/store/authStore";
import { lineAddonsTotal, useCartStore, useCartSubtotal } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { customerService, type PlaceOrderInput } from "@/services/api/customer.service";
import { QK } from "@/constants/query-keys.constants";
import { VALIDATION } from "@/constants/validation.constants";
import { ROUTES } from "@/routes/paths";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";
import { normalizeError } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";

const DELIVERY_OPTIONS = [
  { value: "delivery", label: CHECKOUT_COPY.DELIVERY },
  { value: "pickup", label: CHECKOUT_COPY.PICKUP },
] as const;

type DeliveryValue = (typeof DELIVERY_OPTIONS)[number]["value"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const items = useCartStore((s) => s.items);
  const cartShopId = useCartStore((s) => s.shopId);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartSubtotal();

  const [deliveryType, setDeliveryType] = useState<DeliveryValue>("delivery");
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<ScheduleSlot | null>(null);
  const [payment, setPayment] = useState<"cod" | "upi_manual">("cod");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Guests land here from the cart CTA — ask them to sign in first.
  const [authOpen, setAuthOpen] = useState(!isAuthenticated);

  // Empty cart → nothing to check out (unless we just emptied it by ordering).
  useEffect(() => {
    if (items.length === 0 && !placed) navigate(ROUTES.CART, { replace: true });
  }, [items.length, placed, navigate]);

  // Unique ids — multi-variant carts repeat the same product across lines.
  const productIds = useMemo(
    () => [...new Set(items.map((i) => i.productId))].join(","),
    [items],
  );

  const addressesQuery = useQuery({
    queryKey: QK.addresses,
    queryFn: () => customerService.listAddresses(),
    enabled: isAuthenticated && deliveryType === "delivery",
  });
  const addresses = addressesQuery.data ?? [];
  const effectiveAddressId =
    addressId ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;

  const datesQuery = useQuery({
    queryKey: [...QK.availableDates(cartShopId ?? ""), productIds],
    queryFn: () => customerService.availableDates(cartShopId as string, productIds),
    enabled: isAuthenticated && !!cartShopId,
  });
  const dates = datesQuery.data?.dates ?? [];
  const effectiveDate = date ?? dates[0] ?? null;

  const slotsQuery = useQuery({
    queryKey: [...QK.slots(cartShopId ?? "", effectiveDate ?? ""), productIds],
    queryFn: () =>
      customerService.slots(cartShopId as string, effectiveDate as string, productIds),
    enabled: isAuthenticated && !!cartShopId && !!effectiveDate,
  });
  const slots = slotsQuery.data?.slots ?? [];

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const applyCoupon = useMutation({
    mutationFn: (code: string) =>
      customerService.validateCoupon(cartShopId as string, code, subtotal),
    onSuccess: (res) => {
      if (res.valid) {
        setCoupon({ code: res.code, discount: parseFloat(res.discountAmount) });
        setCouponOpen(false);
      } else {
        toast.error(CHECKOUT_COPY.COUPON_INVALID);
      }
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      const shopId = cartShopId as string;
      // Reset + push the guest cart so retries stay idempotent.
      await customerService.clearServerCart(shopId);
      await customerService.migrateCart(
        shopId,
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          flavorOptionId: i.flavorOptionId ?? undefined,
          quantity: i.quantity,
          addonIds: i.addons.flatMap((a) => Array<string>(a.quantity).fill(a.addonId)),
        })),
      );
      const input: PlaceOrderInput = {
        shopId,
        deliveryType,
        deliveryAddressId:
          deliveryType === "delivery" ? (effectiveAddressId ?? undefined) : undefined,
        scheduledDate: effectiveDate as string,
        scheduledSlotStart: slot?.start,
        scheduledSlotEnd: slot?.end,
        paymentMethod: payment,
        couponCode: coupon?.code,
        customerNote: note.trim() || undefined,
      };
      return customerService.placeOrder(input);
    },
    onSuccess: () => {
      setPlaced(true);
      setConfirmOpen(false);
      clearCart();
      void queryClient.invalidateQueries({ queryKey: QK.orders });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const canPlace =
    isAuthenticated &&
    !!effectiveDate &&
    (deliveryType === "pickup" || !!effectiveAddressId) &&
    !placeOrder.isPending;

  return (
    <>
      <TopBar back title={CHECKOUT_COPY.TITLE} />
      <Page className="bg-muted/40">
        <PageSection className="mx-auto w-full space-y-3.5 pb-6 pt-3 md:max-w-2xl">
          {/* Savings banner (reference: Blinkit "Your total savings") */}
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-500/12 to-blue-500/5 px-4 py-3 dark:from-blue-400/15 dark:to-blue-400/5"
              role="status"
            >
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {CHECKOUT_COPY.TOTAL_SAVINGS}
              </span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                {formatCurrency(discount)}
              </span>
            </motion.div>
          )}

          {/* Delivery type */}
          <SegmentedControl
            name="delivery-type"
            options={DELIVERY_OPTIONS}
            value={deliveryType}
            onChange={setDeliveryType}
            className="bg-surface shadow-card"
          />

          {/* Address */}
          {deliveryType === "delivery" && (
            <SectionCard icon={<MapPin className="h-4 w-4" />} title={CHECKOUT_COPY.DELIVERY_ADDRESS}>
              {addresses.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">{CHECKOUT_COPY.NO_ADDRESSES}</p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((a) => {
                    const active = a.id === effectiveAddressId;
                    return (
                      <motion.button
                        key={a.id}
                        type="button"
                        whileTap={tapScale}
                        onClick={() => setAddressId(a.id)}
                        className={cn(
                          "w-full rounded-2xl border p-3.5 text-left transition-colors",
                          active ? "border-primary bg-primary/8" : "border-border bg-surface-2/50",
                        )}
                      >
                        <p className="text-sm font-bold">{a.label ?? "Address"}</p>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                          {a.fullAddress}
                          {a.city ? `, ${a.city}` : ""}
                          {a.pincode ? ` – ${a.pincode}` : ""}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2.5"
                onClick={() => setAddressSheetOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {CHECKOUT_COPY.ADD_ADDRESS}
              </Button>
            </SectionCard>
          )}

          {/* Schedule — summary row opens the iOS wheel sheet */}
          <RowCard
            icon={<CalendarDays className="h-[18px] w-[18px]" />}
            title={CHECKOUT_COPY.WHEN}
            value={
              effectiveDate
                ? `${formatDate(effectiveDate)} · ${
                    slot ? `${formatTime(slot.start)} – ${formatTime(slot.end)}` : CHECKOUT_COPY.ANY_TIME
                  }`
                : (datesQuery.isLoading ? "…" : CHECKOUT_COPY.NO_DATES)
            }
            actionLabel={CHECKOUT_COPY.CHOOSE_TIME}
            onClick={() => setScheduleOpen(true)}
            disabled={dates.length === 0}
          />

          {/* Coupon — row opens the offers sheet */}
          {coupon ? (
            <div className="rounded-3xl border border-success/40 bg-success/10 px-4 py-3.5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-success">
                  <TicketPercent className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">
                    {coupon.code} {CHECKOUT_COPY.COUPON_APPLIED}
                  </span>
                </p>
                <span className="shrink-0 text-sm font-extrabold text-success">
                  −{formatCurrency(coupon.discount)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setCouponOpen(true)}
                  className="text-[13px] font-bold text-primary"
                >
                  {CHECKOUT_COPY.CHANGE_OFFER}
                </button>
                <button
                  type="button"
                  onClick={() => setCoupon(null)}
                  className="text-[13px] font-semibold text-muted-foreground"
                >
                  {CHECKOUT_COPY.REMOVE}
                </button>
              </div>
            </div>
          ) : (
            <RowCard
              icon={<TicketPercent className="h-[18px] w-[18px]" />}
              title={CHECKOUT_COPY.COUPON}
              value={CHECKOUT_COPY.VIEW_COUPONS}
              onClick={() => setCouponOpen(true)}
            />
          )}

          {/* Payment */}
          <SectionCard icon={<Banknote className="h-4 w-4" />} title={CHECKOUT_COPY.PAYMENT}>
            <div className="flex gap-2">
              <PayPill
                active={payment === "cod"}
                icon={
                  deliveryType === "delivery" ? (
                    <Truck className="h-4 w-4" />
                  ) : (
                    <Store className="h-4 w-4" />
                  )
                }
                label={
                  deliveryType === "delivery"
                    ? CHECKOUT_COPY.COD_DELIVERY
                    : CHECKOUT_COPY.COD_PICKUP
                }
                onClick={() => setPayment("cod")}
              />
              <PayPill
                active={payment === "upi_manual"}
                icon={<Banknote className="h-4 w-4" />}
                label={CHECKOUT_COPY.UPI}
                onClick={() => setPayment("upi_manual")}
              />
            </div>
          </SectionCard>

          {/* Note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, VALIDATION.NOTE_MAX))}
            placeholder='Note for the bakery — e.g. write "Happy Birthday Asha"'
            rows={2}
            className="w-full resize-none rounded-3xl border-none bg-surface p-4 text-sm shadow-card outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
          />

          {/* Bill — itemized */}
          <div className="rounded-3xl bg-surface p-4 shadow-card">
            <p className="text-[15px] font-extrabold">{CHECKOUT_COPY.BILL}</p>
            <div className="mt-3 space-y-2.5">
              {items.map((line) => (
                <div key={line.key} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {line.quantity}× {line.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {line.variantLabel}
                      {line.flavorName ? ` · ${line.flavorName}` : ""}
                    </p>
                    {line.addons.map((a) => (
                      <p key={a.addonId} className="text-[12px] text-muted-foreground">
                        + {a.quantity}× {a.name}
                      </p>
                    ))}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold">{formatCurrency(line.unitPrice * line.quantity)}</p>
                    {line.addons.length > 0 && (
                      <p className="text-[12px] font-medium text-muted-foreground">
                        +{formatCurrency(lineAddonsTotal(line))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-dashed border-border pt-3 text-sm">
              <Row label={CHECKOUT_COPY.SUBTOTAL} value={formatCurrency(subtotal)} />
              {discount > 0 && (
                <Row label={CHECKOUT_COPY.DISCOUNT} value={`−${formatCurrency(discount)}`} accent />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  {CHECKOUT_COPY.TOTAL}
                </span>
                {discount > 0 && (
                  <span className="rounded-md bg-blue-500/12 px-1.5 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-400/15 dark:text-blue-400">
                    {CHECKOUT_COPY.SAVED} {formatCurrency(discount)}
                  </span>
                )}
              </span>
              <span className="flex items-baseline gap-1.5">
                {discount > 0 && (
                  <span className="text-sm font-semibold text-muted-foreground line-through">
                    {formatCurrency(subtotal)}
                  </span>
                )}
                <span className="text-xl font-extrabold">{formatCurrency(total)}</span>
              </span>
            </div>
          </div>
        </PageSection>
      </Page>

      {/* Place order — opens the confirmation sheet */}
      <div className="mx-auto w-full border-t border-border/60 bg-background/95 px-4 pb-4 pt-3 backdrop-blur md:max-w-2xl md:rounded-t-3xl md:border-x md:px-6">
        <Button
          block
          size="lg"
          disabled={!canPlace}
          loading={placeOrder.isPending}
          onClick={() => setConfirmOpen(true)}
          className="rounded-full bg-gradient-to-r from-primary to-primary/75 text-base shadow-fab"
        >
          {CHECKOUT_COPY.PLACE_ORDER} · {formatCurrency(total)}
        </Button>
      </div>

      <ConfirmOrderSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => placeOrder.mutate()}
        confirming={placeOrder.isPending}
        itemsLabel={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        scheduleLabel={
          effectiveDate
            ? `${formatDate(effectiveDate)} · ${
                slot ? `${formatTime(slot.start)} – ${formatTime(slot.end)}` : CHECKOUT_COPY.ANY_TIME
              }`
            : "—"
        }
        paymentLabel={
          payment === "upi_manual"
            ? CHECKOUT_COPY.UPI
            : deliveryType === "delivery"
              ? CHECKOUT_COPY.COD_DELIVERY
              : CHECKOUT_COPY.COD_PICKUP
        }
        subtotal={subtotal}
        discount={discount}
        total={total}
      />

      {placed && <OrderSuccessOverlay onDone={() => navigate(ROUTES.HOME, { replace: true })} />}

      <AuthSheet
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          if (!useAuthStore.getState().isAuthenticated) navigate(-1);
        }}
      />
      <AddressSheet
        open={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
        onSaved={(a) => setAddressId(a.id)}
      />
      <ScheduleSheet
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        dates={dates}
        date={effectiveDate}
        onDate={setDate}
        slots={slots}
        slotsLoading={slotsQuery.isLoading}
        closedReason={slotsQuery.data?.closedReason ?? null}
        slot={slot}
        onSlot={setSlot}
      />
      <CouponSheet
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        shopId={cartShopId}
        subtotal={subtotal}
        applying={applyCoupon.isPending}
        onApply={(code) => applyCoupon.mutate(code)}
      />
    </>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface p-4 shadow-card">
      <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function RowCard({
  icon,
  title,
  value,
  actionLabel,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  actionLabel?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : tapScale}
      onClick={onClick}
      disabled={disabled}
      aria-label={actionLabel ?? title}
      className="flex w-full items-center gap-3 rounded-3xl bg-surface p-4 text-left shadow-card disabled:opacity-60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-muted-foreground">{title}</span>
        <span className="block truncate text-[15px] font-bold">{value}</span>
      </span>
      <ChevronRight className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60" />
    </motion.button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className={cn("font-bold", accent && "text-success")}>{value}</span>
    </div>
  );
}

function PayPill({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-[13px] font-bold transition-colors",
        active ? "border-primary bg-primary/8" : "border-border bg-surface-2/50",
      )}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      <span className="truncate">{label}</span>
    </motion.button>
  );
}
