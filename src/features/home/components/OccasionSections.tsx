import { useMemo } from "react";
import { FeaturedStrip } from "./FeaturedStrip";
import { SectionHeader } from "./SectionHeader";
import type { Occasion, Product } from "@/types/domain.types";

export interface OccasionSectionsProps {
  occasions: Occasion[];
  /** The branch catalog, used to resolve each occasion's productIds. */
  products: Product[];
  onTap: (product: Product) => void;
  onAdd: (product: Product) => void;
}

/**
 * CMS "featured products by occasion" (Birthday, Anniversary…). Each occasion
 * renders as a titled horizontal strip of its assigned products. Occasions with
 * no resolvable products are skipped so the storefront never shows an empty row.
 */
export function OccasionSections({
  occasions,
  products,
  onTap,
  onAdd,
}: OccasionSectionsProps) {
  const byId = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const sections = useMemo(
    () =>
      [...occasions]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((o) => ({
          occasion: o,
          items: o.productIds
            .map((id) => byId.get(id))
            .filter((p): p is Product => Boolean(p)),
        }))
        .filter((s) => s.items.length > 0),
    [occasions, byId],
  );

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(({ occasion, items }) => (
        <div key={occasion.id}>
          <SectionHeader title={occasion.name} />
          <FeaturedStrip products={items} onTap={onTap} onAdd={onAdd} />
        </div>
      ))}
    </>
  );
}
