import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, PointerIcon, X } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyBoxArt } from "@/components/common/illustrations";
import { AddonSheet } from "@/features/cart/components/AddonSheet";
import { CartItemRow } from "@/features/cart/components/CartItemRow";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import { useAuthStore } from "@/store/authStore";
import { CART_COPY } from "@/features/cart/constants";
import {
  lineAddonsTotal,
  lineTotal,
  useCartStore,
  useCartSubtotal,
} from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { TOAST } from "@/constants/toast.constants";
import { ROUTES, buildPath } from "@/routes/paths";
import { useBrand, useBrandFeatures, useSelectedBranch } from "@/hooks/useStorefront";
import { openWhatsApp, buildOrderMessage } from "@/lib/whatsapp";
import { formatCurrency } from "@/utils/format";
import { STORAGE_KEYS } from "@/constants/app.constants";

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const subtotal = useCartSubtotal();
  const [extrasFor, setExtrasFor] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [breakupOpen, setBreakupOpen] = useState(false);
  const extrasTotal = items.reduce((sum, i) => sum + lineAddonsTotal(i), 0);
  const itemsTotal = subtotal - extrasTotal;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const customer = useAuthStore((s) => s.customer);
  const { data: brand } = useBrand();
  const { branch } = useSelectedBranch();
  const { whatsappCheckout } = useBrandFeatures();

  // First-visit hint: show the swipe-to-remove tip + demo nudge once.
  const [showHint, setShowHint] = useState(
    () => !localStorage.getItem(STORAGE_KEYS.CART_SWIPE_HINT),
  );
  const dismissHint = () => {
    localStorage.setItem(STORAGE_KEYS.CART_SWIPE_HINT, "1");
    setShowHint(false);
  };

  // WhatsApp checkout hand-off (Golden Cakes add-on). When the brand has the
  // flag, the checkout button opens WhatsApp with the order pre-filled instead
  // of the in-app checkout — no separate payment step. Guests included, since
  // the order is completed over WhatsApp, not in-app.
  const checkoutViaWhatsApp = () => {
    const number = branch?.whatsappNumber;
    if (!number) {
      toast.error("This store hasn't set up WhatsApp ordering yet.");
      return;
    }
    openWhatsApp(
      number,
      buildOrderMessage({
        brandName: brand?.name ?? "Order",
        branchName: branch?.branchName,
        items: items.map((l) => ({
          name: l.name,
          variantLabel: l.variantLabel,
          flavorName: l.flavorName,
          quantity: l.quantity,
          lineTotal: lineTotal(l),
          addons: l.addons.map((a) => ({ name: a.name, quantity: a.quantity })),
        })),
        subtotal,
        customerName: customer?.name,
        customerPhone: customer?.phone,
      }),
    );
  };

  const goCheckout = () => {
    if (whatsappCheckout) {
      checkoutViaWhatsApp();
      return;
    }
    if (isAuthenticated) {
      navigate(ROUTES.CHECKOUT);
    } else {
      setAuthOpen(true);
    }
  };

  const onRemove = (key: string) => {
    remove(key);
    toast.show(TOAST.REMOVED_FROM_CART);
  };

  if (items.length === 0) {
    return (
      <>
        <TopBar back title={CART_COPY.TITLE} />
        <Page>
          <EmptyState
            icon={<EmptyBoxArt className="h-16 w-16" />}
            title={CART_COPY.EMPTY_TITLE}
            description={CART_COPY.EMPTY_DESC}
            action={<Button onClick={() => navigate(ROUTES.HOME)}>{CART_COPY.BROWSE}</Button>}
          />
        </Page>
      </>
    );
  }

  return (
    <>
      <TopBar back title={CART_COPY.TITLE} />
      <Page>
        <PageSection className="mx-auto w-full pt-3 md:max-w-2xl">
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-center gap-2.5 rounded-2xl bg-primary/10 px-3.5 py-2.5"
              role="status"
            >
              <motion.span
                animate={{ x: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="text-primary"
              >
                <PointerIcon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </motion.span>
              <p className="min-w-0 flex-1 text-[13px] font-semibold text-primary">
                {CART_COPY.SWIPE_HINT}
              </p>
              <button
                type="button"
                aria-label="Dismiss hint"
                onClick={dismissHint}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
          <AnimatePresence initial={false}>
            {items.map((line, index) => (
              <CartItemRow
                key={line.key}
                line={line}
                onQuantity={(q) => setQuantity(line.key, q)}
                onRemove={() => onRemove(line.key)}
                onExtras={() => setExtrasFor(line.key)}
                onOpen={() => navigate(buildPath.product(line.productId))}
                hintNudge={showHint && index === 0}
              />
            ))}
          </AnimatePresence>
        </PageSection>
      </Page>

      {/* Totals + checkout (reference: grand total + collapsible "View breakup") */}
      <div className="mx-auto w-full border-t border-border/60 bg-background/95 px-4 pb-4 pt-3 backdrop-blur md:max-w-2xl md:rounded-t-3xl md:border-x md:px-6">
        <div className="rounded-3xl bg-violet-400/15 p-4 dark:bg-violet-500/15">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">{CART_COPY.TOTAL}</p>
            <p className="text-[26px] font-extrabold tracking-tight">{formatCurrency(subtotal)}</p>
          </div>
          <button
            type="button"
            onClick={() => setBreakupOpen((v) => !v)}
            aria-expanded={breakupOpen}
            className="mt-0.5 flex items-center gap-1 text-[13px] font-bold text-primary"
          >
            {CART_COPY.VIEW_BREAKUP}
            <motion.span animate={{ rotate: breakupOpen ? 180 : 0 }} className="inline-flex">
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {breakupOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 space-y-1.5 border-t border-border/50 pt-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground">
                      {CART_COPY.ITEM_TOTAL}
                    </span>
                    <span className="font-bold">{formatCurrency(itemsTotal)}</span>
                  </div>
                  {extrasTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">
                        {CART_COPY.EXTRAS_TOTAL}
                      </span>
                      <span className="font-bold">{formatCurrency(extrasTotal)}</span>
                    </div>
                  )}
                  <p className="pt-0.5 text-[11px] font-medium text-muted-foreground">
                    {CART_COPY.DELIVERY_NOTE}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          block
          size="lg"
          onClick={goCheckout}
          className="mt-3 rounded-full bg-gradient-to-r from-primary to-primary/75 text-base shadow-fab"
        >
          {whatsappCheckout ? "Order on WhatsApp" : CART_COPY.CHECKOUT}
        </Button>
      </div>

      <AddonSheet lineKey={extrasFor} onClose={() => setExtrasFor(null)} />
      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthed={() => navigate(ROUTES.CHECKOUT)}
      />
    </>
  );
}
