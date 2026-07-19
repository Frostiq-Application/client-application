import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import { formatCurrency } from "@/utils/format";
import { defaultVariant } from "@/utils/product";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { ProductImage } from "./ProductImage";
import { HOME_COPY } from "../constants";
import type { Product } from "@/types/domain.types";

export interface FeaturedStripProps {
  products: Product[];
  onTap: (product: Product) => void;
  onAdd: (product: Product) => void;
}

/**
 * "Top Products" scroll view — reference closeup: even cards pink, odd cards
 * purple, neighbors peek at the edges, photo bleeds into the top-right corner,
 * Veg label + big name left, price row, Add-to-Cart pill + heart below.
 */
export function FeaturedStrip({ products, onTap, onAdd }: FeaturedStripProps) {
  if (products.length === 0) return null;

  return (
    <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1">
      {products.map((product, index) => {
        const variant = defaultVariant(product);
        const even = index % 2 === 0;
        return (
          <div
            key={product.id}
            className={cn(
              "relative w-[85%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] md:w-[420px]",
              even ? "bg-primary/15" : "bg-violet-400/25 dark:bg-violet-500/20",
            )}
          >
            {/* decorative soft swoosh, like the reference artwork */}
            <span
              aria-hidden
              className="absolute -right-8 top-10 h-40 w-56 -rotate-12 rounded-[3rem] bg-white/25 dark:bg-white/5"
            />

            {/* photo bleeding into the top-right corner */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => onTap(product)}
              className="absolute right-0 top-0 h-44 w-[48%]"
            >
              <ProductImage
                src={product.images[0]}
                alt=""
                type={product.productType}
                className="h-full w-full rounded-bl-[2.5rem]"
                artClassName="p-4"
              />
            </button>

            <div className="relative p-5">
              <button
                type="button"
                onClick={() => onTap(product)}
                className="block min-h-44 w-[50%] text-left"
              >
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    product.isEggless ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {product.isEggless ? HOME_COPY.VEG : HOME_COPY.CONTAINS_EGG}
                </p>
                <h3 className="mt-1.5 line-clamp-3 text-[26px] font-extrabold leading-8 tracking-tight">
                  {product.name}
                </h3>
                {variant && (
                  <p className="mt-5 text-[22px] font-extrabold">
                    {formatCurrency(variant.price)}
                    <span className="ml-2 text-sm font-semibold text-muted-foreground">
                      {variant.label}
                    </span>
                  </p>
                )}
              </button>

              <div className="mt-4 flex items-center gap-2.5">
                <motion.button
                  type="button"
                  whileTap={tapScale}
                  onClick={() => onAdd(product)}
                  className="h-12 flex-1 rounded-full bg-surface text-[15px] font-bold text-foreground shadow-sm"
                >
                  {HOME_COPY.ADD_TO_CART}
                </motion.button>
                <WishlistButton
                  product={product}
                  className="h-12 w-12 shrink-0 bg-surface shadow-sm"
                  iconClassName="h-5 w-5"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
