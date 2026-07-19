import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductImage } from "@/features/home/components/ProductImage";
import { WISHLIST_COPY } from "@/features/wishlist/constants";
import { useWishlistStore, type WishlistItem } from "@/store/wishlistStore";
import { formatCurrency } from "@/utils/format";
import { tapScale } from "@/animations/variants";
import { ROUTES, buildPath } from "@/routes/paths";
import { cn } from "@/lib/cn";

/**
 * Saved-for-later favourites. Renders from the persisted local snapshot so it
 * works for guests with no network round-trip; tapping a card opens the live
 * product detail where branch/variant availability is resolved.
 */
export function WishlistPage() {
  const navigate = useNavigate();
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);

  const count = items.length;
  const countLabel =
    count === 1 ? WISHLIST_COPY.COUNT_ONE : WISHLIST_COPY.countMany(count);

  return (
    <>
      <TopBar back title={WISHLIST_COPY.TITLE} />
      <Page>
        {count === 0 ? (
          <EmptyState
            icon={<Heart className="h-7 w-7" strokeWidth={1.75} />}
            title={WISHLIST_COPY.EMPTY_TITLE}
            description={WISHLIST_COPY.EMPTY_DESCRIPTION}
            action={
              <Button onClick={() => navigate(ROUTES.HOME)}>
                {WISHLIST_COPY.EMPTY_ACTION}
              </Button>
            }
          />
        ) : (
          <PageSection className="pb-8 pt-1">
            <p className="mb-3 px-1 text-sm font-medium text-muted-foreground">
              {countLabel}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <WishlistCard
                    key={item.productId}
                    item={item}
                    onOpen={() => navigate(buildPath.product(item.productId))}
                    onRemove={() => remove(item.productId)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </PageSection>
        )}
      </Page>
    </>
  );
}

interface WishlistCardProps {
  item: WishlistItem;
  onOpen: () => void;
  onRemove: () => void;
}

function WishlistCard({ item, onOpen, onRemove }: WishlistCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative flex flex-col rounded-[1.5rem] bg-surface-2 p-3"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col text-left"
      >
        <ProductImage
          src={item.image ?? undefined}
          alt={item.name}
          type={item.productType}
          className="h-28 w-full rounded-2xl"
          artClassName="p-4"
        />
        <h3 className="mt-2.5 line-clamp-1 text-sm font-bold">{item.name}</h3>
        <p
          className={cn(
            "mt-0.5 text-[11px] font-semibold",
            item.isEggless ? "text-success" : "text-muted-foreground",
          )}
        >
          {item.isEggless ? WISHLIST_COPY.VEG : WISHLIST_COPY.CONTAINS_EGG}
        </p>
        {item.price && (
          <p className="mt-1 truncate text-sm font-extrabold">
            {formatCurrency(item.price)}
            {item.variantLabel && (
              <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
                {item.variantLabel}
              </span>
            )}
          </p>
        )}
      </button>

      <motion.button
        type="button"
        whileTap={tapScale}
        aria-label={`${WISHLIST_COPY.REMOVE} ${item.name}`}
        onClick={onRemove}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm dark:bg-black/40"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
}
