import { motion } from "framer-motion";
import { Leaf, Plus } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { formatCurrency } from "@/utils/format";
import { defaultVariant } from "@/utils/product";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { HOME_COPY } from "../constants";
import type { Product } from "@/types/domain.types";

export interface ProductCardProps {
  product: Product;
  onTap: (product: Product) => void;
  /** Quick-add (the "+" button). Falls back to onTap when omitted. */
  onAdd?: (product: Product) => void;
  /** Position in the grid — drives the alternating pastel background. */
  index?: number;
  className?: string;
}

/** Pastel tones alternated across the grid (reference: lilac / pink). */
const CARD_TONES = [
  "bg-violet-400/15 dark:bg-violet-500/15",
  "bg-primary/12",
] as const;

/**
 * "Most Ordered" grid card — reference style: pastel tile, photo, name,
 * price + unit label, circular "+" action.
 */
export function ProductCard({ product, onTap, onAdd, index = 0, className }: ProductCardProps) {
  const variant = defaultVariant(product);

  return (
    <motion.div
      whileTap={tapScale}
      className={cn(
        "relative flex flex-col rounded-[1.5rem] p-3 transition-shadow lg:hover:shadow-lg",
        CARD_TONES[index % CARD_TONES.length],
        className,
      )}
    >
      <button type="button" onClick={() => onTap(product)} className="flex min-w-0 flex-1 flex-col text-left">
        <div className="relative">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            type={product.productType}
            className="h-28 w-full rounded-2xl"
            artClassName="p-4"
          />
          {product.isEggless && (
            <span
              title={HOME_COPY.EGGLESS}
              className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 text-success shadow-sm"
            >
              <Leaf className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          )}
        </div>
        <h3 className="mt-2.5 line-clamp-1 text-sm font-bold">{product.name}</h3>
      </button>

      <WishlistButton
        product={product}
        className="absolute right-3 top-3 h-8 w-8 bg-white/90 shadow-sm dark:bg-black/40"
        iconClassName="h-4 w-4"
      />

      <div className="mt-1 flex items-end justify-between gap-2">
        {variant && (
          <p className="min-w-0 truncate text-sm font-extrabold">
            {formatCurrency(variant.price)}
            <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
              {variant.label}
            </span>
          </p>
        )}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          aria-label={`Add ${product.name}`}
          onClick={() => (onAdd ?? onTap)(product)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-foreground shadow-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}
