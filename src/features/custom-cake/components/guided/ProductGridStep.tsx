import { motion } from "framer-motion";
import { Check, Leaf } from "lucide-react";
import { ProductImage } from "@/features/home/components/ProductImage";
import { EmptyState } from "@/components/common/EmptyState";
import { CakeSliceArt } from "@/components/common/illustrations";
import { listContainer, listItem, tapScale } from "@/animations/variants";
import { formatCurrency } from "@/utils/format";
import { minPrice, hasPriceRange } from "@/utils/product";
import { GUIDED_COPY } from "../../constants";
import type { Product } from "@/types/domain.types";

/**
 * Grid of the products in the chosen category. Tapping a card selects it as the
 * base cake; the parent auto-advances to the configure step.
 */
export function ProductGridStep({
  products,
  value,
  onSelect,
}: {
  products: Product[];
  value: string | null;
  onSelect: (product: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<CakeSliceArt className="h-10 w-10" />}
        title="Nothing here yet"
        description={GUIDED_COPY.productEmpty}
      />
    );
  }

  return (
    <motion.div
      variants={listContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {products.map((p) => {
        const from = minPrice(p);
        const active = value === p.id;
        return (
          <motion.button
            key={p.id}
            type="button"
            variants={listItem}
            whileTap={tapScale}
            onClick={() => onSelect(p)}
            className={`relative overflow-hidden rounded-3xl border bg-surface text-left transition-colors ${
              active ? "border-primary ring-2 ring-primary/40" : "border-border"
            }`}
          >
            <div className="relative aspect-square bg-surface-2">
              <ProductImage
                src={p.images[0]}
                alt={p.name}
                type={p.productType}
                className="h-full w-full"
                artClassName="p-6"
              />
              {p.isEggless && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  <Leaf className="h-3 w-3" /> Eggless
                </span>
              )}
              {active && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="p-2.5">
              <p className="truncate text-sm font-bold leading-tight">{p.name}</p>
              {from !== null && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasPriceRange(p) ? "From " : ""}
                  <span className="font-semibold text-foreground">{formatCurrency(from)}</span>
                </p>
              )}
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
