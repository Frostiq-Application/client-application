import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Clock, Share2, Leaf, CakeSlice, Egg } from "lucide-react";
import { Page } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { LoadingScreen } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { ProductImage } from "@/features/home/components/ProductImage";
import { useSelectedBranch } from "@/hooks/useStorefront";
import { storefrontService } from "@/services/api/storefront.service";
import { QK } from "@/constants/query-keys.constants";
import { buildCartLine, lineTotal, useCartStore } from "@/store/cartStore";
import { toast } from "@/store/toastStore";
import { formatCurrency } from "@/utils/format";
import { defaultVariant } from "@/utils/product";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { PRODUCT_COPY } from "@/features/product/constants";
import { CART_COPY } from "@/features/cart/constants";

const DESCRIPTION_CLAMP = 120;

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { branch } = useSelectedBranch();
  const shopId = branch?.id ?? null;
  const addToCart = useCartStore((s) => s.add);
  const setCartQuantity = useCartStore((s) => s.setQuantity);
  const removeCartLine = useCartStore((s) => s.remove);

  const query = useQuery({
    queryKey: QK.product(shopId ?? "", productId ?? ""),
    queryFn: () => storefrontService.getProduct(shopId as string, productId as string),
    enabled: !!shopId && !!productId,
  });

  const product = query.data;
  const [variantId, setVariantId] = useState<string | null>(null);
  const [flavorId, setFlavorId] = useState<string | null>(null);
  // Quantity to add before the line exists in the cart; after that the
  // stepper binds to the live cart line.
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  // Increments on every Add tap — keys the "+N" burst animation on the CTA.
  const [bursts, setBursts] = useState(0);

  const variant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => v.id === variantId) ?? defaultVariant(product);
  }, [product, variantId]);

  const flavor = useMemo(
    () => product?.flavorOptions.find((f) => f.id === flavorId) ?? null,
    [product, flavorId],
  );

  // The cart line for the current selection — the counter's source of truth.
  const lineKey =
    product && variant ? `${product.id}:${variant.id}:${flavorId ?? "none"}` : null;
  const cartLine = useCartStore(
    (s) => s.items.find((i) => i.key === lineKey) ?? null,
  );
  // Every combo of THIS product already in the cart (different sizes/flavours).
  const cartItems = useCartStore((s) => s.items);
  const productLines = useMemo(
    () => cartItems.filter((i) => i.productId === product?.id),
    [cartItems, product?.id],
  );
  const displayQuantity = cartLine?.quantity ?? draftQuantity;

  const onQuantityChange = (q: number) => {
    if (cartLine) {
      setCartQuantity(cartLine.key, q);
    } else {
      setDraftQuantity(q);
    }
  };

  const unitPrice = variant
    ? parseFloat(variant.price) + (flavor ? parseFloat(flavor.priceDelta) : 0)
    : 0;
  const total = unitPrice * displayQuantity;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share && product) {
      await navigator.share({ title: product.name, url }).catch(() => undefined);
    } else {
      void navigator.clipboard?.writeText(url);
      toast.show(PRODUCT_COPY.SHARE_COPIED);
    }
  };

  // First add pushes the drafted quantity; further taps increment the line by 1
  // (the bound stepper shows it climb).
  const addAmount = cartLine ? 1 : draftQuantity;

  const onAdd = () => {
    if (!product || !variant) return;
    const result = addToCart(buildCartLine(product, variant, flavor), addAmount);
    setBursts((b) => b + 1);
    if (result === "replaced-branch") toast.success(CART_COPY.BRANCH_REPLACED);
  };

  if (query.isLoading) return <LoadingScreen />;
  if (query.isError || !product) {
    return (
      <Page>
        <ErrorState error={query.error ?? new Error(PRODUCT_COPY.NOT_FOUND)} onRetry={() => query.refetch()} />
      </Page>
    );
  }

  const description = product.description ?? "";
  const clamped = !expanded && description.length > DESCRIPTION_CLAMP;
  const shownDescription = clamped ? `${description.slice(0, DESCRIPTION_CLAMP).trimEnd()}… ` : description;

  return (
    <>
      <Page>
        {/* Two-column on laptop: hero left, details right. */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 lg:pt-6">
        {/* Hero — tinted backdrop, floating actions, price badge */}
        <div className="relative bg-primary/10 pb-6 pt-3 lg:sticky lg:top-20 lg:rounded-[2.5rem] lg:pb-8">
          <div className="flex items-center justify-between px-4">
            <CircleButton label="Back" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
            </CircleButton>
            <span className="text-[15px] font-bold">Details</span>
            <div className="flex items-center gap-2">
              <WishlistButton
                product={product}
                className="h-10 w-10 bg-surface text-foreground shadow-card"
                iconClassName="h-[18px] w-[18px]"
              />
              <CircleButton label="Share" onClick={() => void share()}>
                <Share2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </CircleButton>
            </div>
          </div>

          <div className="relative mx-auto mt-3 w-[78%]">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              type={product.productType}
              className="aspect-square w-full rounded-[2rem] shadow-card"
              artClassName="p-8"
            />
            {variant && (
              <div className="absolute -right-2 top-4 rounded-2xl bg-surface px-3.5 py-2 text-center shadow-card">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {PRODUCT_COPY.PER} {variant.label}
                </p>
                <p className="text-lg font-extrabold">{formatCurrency(variant.price)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-6 pt-4 lg:px-0 lg:pt-0">
          {/* Name + veg + quantity */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-bold",
                  product.isEggless ? "text-success" : "text-muted-foreground",
                )}
              >
                {product.isEggless ? (
                  <Leaf className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <Egg className="h-3.5 w-3.5" strokeWidth={2.2} />
                )}
                {product.isEggless ? PRODUCT_COPY.VEG : PRODUCT_COPY.CONTAINS_EGG}
              </p>
              <h1 className="mt-1 text-[22px] font-extrabold leading-7 tracking-tight">
                {product.name}
              </h1>
            </div>
            <Stepper value={displayQuantity} onChange={onQuantityChange} className="mt-1 shrink-0" />
          </div>

          {/* Info tiles */}
          <div className="mt-4 flex gap-2.5">
            {product.minOrderHours > 0 && (
              <InfoTile icon={<Clock className="h-4 w-4" />} label={PRODUCT_COPY.ADVANCE_ORDER(product.minOrderHours)} />
            )}
            <InfoTile icon={<CakeSlice className="h-4 w-4" />} label={PRODUCT_COPY.FRESH_TILE} />
            {product.isEggless && (
              <InfoTile icon={<Leaf className="h-4 w-4" />} label={PRODUCT_COPY.EGGLESS_TILE} tone="success" />
            )}
          </div>

          {/* Combos of this product already in the cart */}
          {productLines.length > 0 && (
            <div className="mt-5 rounded-3xl bg-primary/6 p-3.5 ring-1 ring-primary/15">
              <h2 className="px-0.5 text-[13px] font-extrabold uppercase tracking-wide text-primary">
                {PRODUCT_COPY.IN_CART}
              </h2>
              <div className="mt-2 space-y-2">
                {productLines.map((line) => {
                  const isCurrent = line.key === lineKey;
                  return (
                    <div
                      key={line.key}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm",
                        isCurrent && "ring-1 ring-primary/40",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          setVariantId(line.variantId);
                          setFlavorId(line.flavorOptionId);
                        }}
                      >
                        <p className="truncate text-sm font-bold">
                          {line.variantLabel}
                          {line.flavorName ? ` · ${line.flavorName}` : ""}
                        </p>
                        <p className="text-[12px] font-medium text-muted-foreground">
                          {formatCurrency(lineTotal(line))}
                        </p>
                      </button>
                      <Stepper
                        value={line.quantity}
                        min={0}
                        onChange={(q) =>
                          q === 0 ? removeCartLine(line.key) : setCartQuantity(line.key, q)
                        }
                        className="h-9 shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {product.variants.length > 1 && (
            <Selector title={PRODUCT_COPY.CHOOSE_SIZE}>
              {product.variants.map((v) => {
                const active = v.id === variant?.id;
                return (
                  <Pill key={v.id} active={active} onClick={() => setVariantId(v.id)}>
                    <span className="font-bold">{v.label}</span>
                    <span className={cn("ml-1.5 text-xs", active ? "opacity-90" : "text-muted-foreground")}>
                      {formatCurrency(v.price)}
                    </span>
                  </Pill>
                );
              })}
            </Selector>
          )}

          {/* Flavour selector */}
          {product.flavorOptions.length > 0 && (
            <Selector title={PRODUCT_COPY.CHOOSE_FLAVOR}>
              {product.flavorOptions.map((f) => {
                const active = f.id === flavorId;
                const delta = parseFloat(f.priceDelta);
                return (
                  <Pill key={f.id} active={active} onClick={() => setFlavorId(active ? null : f.id)}>
                    <span className="font-bold">{f.flavorName}</span>
                    <span className={cn("ml-1.5 text-xs", active ? "opacity-90" : "text-muted-foreground")}>
                      {delta > 0 ? `+${formatCurrency(delta)}` : PRODUCT_COPY.FREE_FLAVOR}
                    </span>
                  </Pill>
                );
              })}
            </Selector>
          )}

          {/* Description */}
          {description && (
            <div className="mt-5">
              <h2 className="text-[15px] font-extrabold">{PRODUCT_COPY.DESCRIPTION}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {shownDescription}
                {description.length > DESCRIPTION_CLAMP && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    {clamped ? PRODUCT_COPY.READ_MORE : ` ${PRODUCT_COPY.READ_LESS}`}
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
        </div>
      </Page>

      {/* Sticky CTA — tapping again keeps incrementing the cart line */}
      <div className="relative mx-auto w-full border-t border-border/60 bg-background/95 px-4 pb-4 pt-3 backdrop-blur md:max-w-md md:rounded-t-3xl md:border-x md:px-6 lg:max-w-lg">
        <AnimatePresence>
          {bursts > 0 && (
            <motion.span
              key={bursts}
              initial={{ opacity: 1, y: 0, scale: 0.7 }}
              animate={{ opacity: 0, y: -44, scale: 1.2 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="pointer-events-none absolute -top-3 right-10 z-10 rounded-full bg-primary px-2.5 py-1 text-sm font-extrabold text-primary-foreground shadow-fab"
            >
              +{addAmount}
            </motion.span>
          )}
        </AnimatePresence>
        <motion.div key={`pulse-${bursts}`} initial={{ scale: bursts ? 0.96 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
          <Button
            block
            size="lg"
            onClick={onAdd}
            className="rounded-full bg-gradient-to-r from-primary to-primary/75 text-base shadow-fab"
          >
            {PRODUCT_COPY.ADD_TO_CART} · {formatCurrency(total)}
          </Button>
        </motion.div>
      </div>
    </>
  );
}

function CircleButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground shadow-card"
    >
      {children}
    </motion.button>
  );
}

function InfoTile({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "success";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-2xl bg-surface px-3 py-2.5 shadow-card",
        tone === "success" ? "text-success" : "text-foreground",
      )}
    >
      <span className={tone === "success" ? "text-success" : "text-primary"}>{icon}</span>
      <span className="truncate text-xs font-semibold">{label}</span>
    </div>
  );
}

function Selector({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="text-[15px] font-extrabold">{title}</h2>
      <div className="hide-scrollbar mt-2.5 flex gap-2 overflow-x-auto">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface-2 text-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}
