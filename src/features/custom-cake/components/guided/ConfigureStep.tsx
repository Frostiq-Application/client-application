import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProductImage } from "@/features/home/components/ProductImage";
import { tapScale } from "@/animations/variants";
import { formatCurrency } from "@/utils/format";
import { GUIDED_COPY } from "../../constants";
import type { Product } from "@/types/domain.types";

/**
 * Size (variant) + flavour selection for the chosen base cake, driven entirely
 * by the product's real variants and flavour options from the catalog.
 */
export function ConfigureStep({
  product,
  variantId,
  flavour,
  onVariant,
  onFlavour,
}: {
  product: Product;
  variantId: string | null;
  flavour: string | null;
  onVariant: (id: string) => void;
  onFlavour: (name: string | null) => void;
}) {
  const flavours = [...product.flavorOptions].sort((a, b) => a.sortOrder - b.sortOrder);
  const variants = [...product.variants].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {/* Base cake summary */}
      <div className="flex items-center gap-3 rounded-3xl border border-primary/25 bg-primary/[0.06] p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            type={product.productType}
            className="h-full w-full"
            artClassName="p-3"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {GUIDED_COPY.basedOn}
          </p>
          <p className="truncate text-[15px] font-bold leading-tight">{product.name}</p>
          {product.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Size / variant */}
      {variants.length > 0 && (
        <div>
          <p className="mb-2.5 text-sm font-bold">Choose a size</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {variants.map((v) => {
              const active = variantId === v.id;
              return (
                <motion.button
                  key={v.id}
                  type="button"
                  whileTap={tapScale}
                  onClick={() => onVariant(v.id)}
                  className={`relative rounded-2xl border p-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/[0.06] ring-1 ring-primary/40"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-semibold leading-tight">{v.label}</p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {formatCurrency(v.price)}
                  </p>
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Flavour */}
      {flavours.length > 0 && (
        <div>
          <p className="mb-2.5 text-sm font-bold">Pick a flavour</p>
          <div className="flex flex-wrap gap-2">
            {flavours.map((f) => {
              const active = flavour === f.flavorName;
              const delta = parseFloat(f.priceDelta);
              return (
                <motion.button
                  key={f.id}
                  type="button"
                  whileTap={tapScale}
                  onClick={() => onFlavour(active ? null : f.flavorName)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/50"
                  }`}
                >
                  {f.flavorName}
                  {delta > 0 && (
                    <span className={active ? "opacity-90" : "text-muted-foreground"}>
                      {" "}
                      +{formatCurrency(delta)}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {variants.length === 0 && flavours.length === 0 && (
        <p className="rounded-2xl bg-surface-2 p-4 text-sm text-muted-foreground">
          This cake has no preset sizes — we'll confirm sizing with you in the quote.
        </p>
      )}
    </div>
  );
}
