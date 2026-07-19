import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Leaf, X } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyBoxArt } from "@/components/common/illustrations";
import { ProductImage } from "@/features/home/components/ProductImage";
import { useCatalog, useSelectedBranch } from "@/hooks/useStorefront";
import { formatCurrency } from "@/utils/format";
import { hasPriceRange, minPrice } from "@/utils/product";
import { buildPath } from "@/routes/paths";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import type { Category, Product } from "@/types/domain.types";
import { SEARCH_COPY } from "../constants";

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
}

interface MenuSection {
  id: string;
  name: string;
  products: Product[];
}

/**
 * Zomato-style browse menu: the floating "Menu" pill opens this sheet — every
 * category with its products in one scroll. The header (title + category
 * chips) is pinned; section headers stick as their products scroll under.
 */
export function MenuSheet({ open, onClose }: MenuSheetProps) {
  const navigate = useNavigate();
  const { branch } = useSelectedBranch();
  const shopId = branch?.id ?? null;
  const { data: catalog, isLoading } = useCatalog(open ? shopId : null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const sections = useMemo<MenuSection[]>(() => {
    if (!catalog) return [];
    const byCategory = new Map<string, Product[]>();
    for (const p of catalog.products) {
      const key = p.categoryId ?? "__other__";
      const list = byCategory.get(key) ?? [];
      list.push(p);
      byCategory.set(key, list);
    }
    const ordered: MenuSection[] = [...catalog.categories]
      .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
      .filter((c) => (byCategory.get(c.id) ?? []).length > 0)
      .map((c) => ({ id: c.id, name: c.name, products: byCategory.get(c.id) ?? [] }));
    const other = byCategory.get("__other__") ?? [];
    if (other.length > 0) {
      ordered.push({ id: "__other__", name: SEARCH_COPY.MENU_UNCATEGORIZED, products: other });
    }
    return ordered;
  }, [catalog]);

  const totalItems = useMemo(
    () => sections.reduce((sum, s) => sum + s.products.length, 0),
    [sections],
  );

  const jumpTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openProduct = (id: string) => {
    onClose();
    navigate(buildPath.product(id));
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      className="h-[86%]"
      header={
        <div className="border-b border-border/60 pb-3">
          <div className="flex items-start justify-between px-5">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight">{SEARCH_COPY.MENU}</h2>
              <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
                {branch?.branchName}
                {totalItems > 0 && <> · {SEARCH_COPY.MENU_ITEMS(totalItems)}</>}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="press -mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Quick category jump chips — pinned with the header. */}
          {sections.length > 1 && (
            <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
              {sections.map((s) => (
                <motion.button
                  key={s.id}
                  type="button"
                  whileTap={tapScale}
                  onClick={() => jumpTo(s.id)}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-xs font-bold"
                >
                  {s.name}
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {s.products.length}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-3 pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<EmptyBoxArt className="h-16 w-16" />}
          title={SEARCH_COPY.MENU_EMPTY_TITLE}
          description={SEARCH_COPY.MENU_EMPTY_DESC}
        />
      ) : (
        sections.map((section) => (
          <section
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            className="scroll-mt-2"
          >
            {/* Sticky section header — full-bleed across the sheet padding. */}
            <div className="sticky top-0 z-10 -mx-5 bg-surface/95 px-5 py-2.5 backdrop-blur-sm">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-extrabold">
                  {section.name}
                  <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
                    {section.products.length}
                  </span>
                </h3>
                {section.id !== "__other__" && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(buildPath.category(section.id), {
                        state: { name: section.name },
                      });
                    }}
                    className="text-xs font-bold text-primary"
                  >
                    {SEARCH_COPY.MENU_SEE_ALL}
                  </button>
                )}
              </div>
            </div>

            <ul className="pb-2">
              {section.products.map((product) => (
                <MenuRow key={product.id} product={product} onTap={() => openProduct(product.id)} />
              ))}
            </ul>
          </section>
        ))
      )}
    </Sheet>
  );
}

function MenuRow({ product, onTap }: { product: Product; onTap: () => void }) {
  const price = minPrice(product);
  return (
    <li>
      <motion.button
        type="button"
        whileTap={tapScale}
        onClick={onTap}
        className="flex w-full items-center gap-3 border-b border-border/40 py-3 text-left last:border-b-0"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          type={product.productType}
          className="h-14 w-14 shrink-0 rounded-xl"
          artClassName="p-2.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="line-clamp-1 text-sm font-bold">{product.name}</h4>
            {product.isEggless && (
              <Leaf className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} />
            )}
          </div>
          {price !== null && (
            <p className="mt-0.5 text-[13px] font-semibold text-muted-foreground">
              {hasPriceRange(product) && <span className="font-medium">From </span>}
              <span className={cn("text-foreground")}>{formatCurrency(price)}</span>
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2.4} />
      </motion.button>
    </li>
  );
}
