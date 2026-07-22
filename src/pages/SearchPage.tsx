import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CakeSlice, History, SlidersVertical, TrendingUp, X } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { SearchBar } from "@/components/ui/SearchBar";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { CakeSliceArt, EmptyBoxArt } from "@/components/common/illustrations";
import { ProductCard } from "@/features/home/components/ProductCard";
import { FilterSheet } from "@/features/search/components/FilterSheet";
import { MenuSheet } from "@/features/search/components/MenuSheet";
import { useCartCount } from "@/store/cartStore";
import { useRecentSearches } from "@/features/search/hooks/useRecentSearches";
import {
  DEFAULT_FILTERS,
  SEARCH_COPY,
  type SearchFilters,
} from "@/features/search/constants";
import {
  SEARCH_PREFIX,
  SEARCH_ROTATE_MS,
  SEARCH_SUGGESTIONS,
} from "@/features/home/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { useRotatingIndex } from "@/hooks/useRotatingIndex";
import { useCatalog, useSelectedBranch } from "@/hooks/useStorefront";
import { storefrontService } from "@/services/api/storefront.service";
import { QK } from "@/constants/query-keys.constants";
import { SEARCH_CATEGORY_PARAM, buildPath } from "@/routes/paths";
import { minPrice } from "@/utils/product";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";

const MIN_QUERY_LENGTH = 2;

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get(SEARCH_CATEGORY_PARAM) ?? "";
  const [query, setQuery] = useState("");
  const [sheetFilters, setSheetFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const debounced = useDebounce(query.trim(), 300);
  const { branch } = useSelectedBranch();
  const shopId = branch?.id ?? null;
  const { recent, save, clear } = useRecentSearches();
  const { data: catalog } = useCatalog(shopId);

  // ?category= is the single source of truth for the category filter — that way
  // a home chip tapped while this page is already mounted still re-filters, and
  // back/forward walks the filter history. The sheet owns the rest.
  const filters = useMemo<SearchFilters>(
    () => ({ ...sheetFilters, categoryId: categoryParam }),
    [sheetFilters, categoryParam],
  );

  const applyFilters = (next: SearchFilters) => {
    setSheetFilters(next);
    setSearchParams(next.categoryId ? { [SEARCH_CATEGORY_PARAM]: next.categoryId } : {}, {
      replace: true,
    });
  };

  const activeCategory = useMemo(
    () => catalog?.categories.find((c) => c.id === filters.categoryId) ?? null,
    [catalog, filters.categoryId],
  );

  const filtersActive =
    filters.categoryId !== "" ||
    filters.type !== "" ||
    filters.egglessOnly ||
    filters.sort !== "recommended";

  // Filters alone (without a query) are also a valid search.
  const enabled = !!shopId && (debounced.length >= MIN_QUERY_LENGTH || filtersActive);

  const searchQuery = useQuery({
    queryKey: QK.products(shopId ?? "", {
      search: debounced,
      categoryId: filters.categoryId,
      type: filters.type,
      eggless: filters.egglessOnly,
    }),
    queryFn: () =>
      storefrontService.browseProducts(shopId as string, {
        search: debounced.length >= MIN_QUERY_LENGTH ? debounced : undefined,
        categoryId: filters.categoryId || undefined,
        productType: filters.type || undefined,
        isEggless: filters.egglessOnly || undefined,
        limit: 30,
      }),
    enabled,
  });

  const results = useMemo(() => {
    const rows = searchQuery.data?.data ?? [];
    if (filters.sort === "recommended") return rows;
    const sorted = [...rows].sort((a, b) => (minPrice(a) ?? 0) - (minPrice(b) ?? 0));
    return filters.sort === "price_asc" ? sorted : sorted.reverse();
  }, [searchQuery.data, filters.sort]);

  const suggestionIndex = useRotatingIndex(SEARCH_SUGGESTIONS.length, SEARCH_ROTATE_MS);
  const placeholder = `${SEARCH_PREFIX} "${SEARCH_SUGGESTIONS[suggestionIndex] ?? ""}"`;

  const openProduct = (id: string) => {
    save(debounced);
    navigate(buildPath.product(id));
  };

  return (
    <>
      <TopBar large title={SEARCH_COPY.TITLE} />
      <Page>
        <PageSection className="pb-8 pt-1">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              save(query);
            }}
          >
            <SearchBar
              autoFocus
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              className="flex-1"
            />
            <motion.button
              type="button"
              whileTap={tapScale}
              aria-label={SEARCH_COPY.FILTERS}
              onClick={() => setFiltersOpen(true)}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-card"
            >
              <SlidersVertical className="h-[18px] w-[18px]" strokeWidth={2.2} />
              {filtersActive && (
                <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              )}
            </motion.button>
          </form>

          {/* Active category (usually pushed from a home chip) — tap to clear. */}
          {activeCategory && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={tapScale}
              onClick={() => applyFilters({ ...filters, categoryId: "" })}
              aria-label={SEARCH_COPY.CLEAR_CATEGORY}
              className="mt-3 flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[13px] font-bold text-primary-foreground"
            >
              {activeCategory.name}
              <X className="h-3.5 w-3.5" strokeWidth={2.6} />
            </motion.button>
          )}

          {!enabled ? (
            <div className="pt-5">
              {recent.length > 0 && (
                <section className="mb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-1.5 text-sm font-extrabold">
                      <History className="h-4 w-4 text-muted-foreground" />
                      {SEARCH_COPY.RECENT}
                    </h2>
                    <button
                      type="button"
                      onClick={clear}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      {SEARCH_COPY.CLEAR}
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <Chip key={term} label={term} onTap={() => setQuery(term)} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="flex items-center gap-1.5 text-sm font-extrabold">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  {SEARCH_COPY.POPULAR}
                </h2>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {SEARCH_SUGGESTIONS.map((term) => (
                    <Chip key={term} label={term} onTap={() => setQuery(term)} />
                  ))}
                </div>
              </section>

              <EmptyState
                icon={<CakeSliceArt className="h-16 w-16" />}
                title={SEARCH_COPY.START_TITLE}
                description={SEARCH_COPY.START_DESC}
              />
            </div>
          ) : searchQuery.isLoading ? (
            <LoadingScreen />
          ) : searchQuery.isError ? (
            <ErrorState error={searchQuery.error} onRetry={() => searchQuery.refetch()} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<EmptyBoxArt className="h-16 w-16" />}
              title={SEARCH_COPY.EMPTY_TITLE}
              description={SEARCH_COPY.EMPTY_DESC(
                debounced || activeCategory?.name || SEARCH_COPY.FILTERS,
              )}
            />
          ) : (
            <>
              <p className="pt-4 text-xs font-semibold text-muted-foreground">
                {SEARCH_COPY.RESULTS(results.length)}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {results.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onTap={(p) => openProduct(p.id)}
                  />
                ))}
              </div>
            </>
          )}
        </PageSection>
      </Page>

      {/* Zomato-style floating menu pill — browse the full menu by category. */}
      <motion.button
        type="button"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileTap={tapScale}
        onClick={() => setMenuOpen(true)}
        className={cn(
          "absolute right-4 z-30 flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-extrabold text-background shadow-fab transition-[bottom] duration-200",
          cartCount > 0 ? "bottom-[84px]" : "bottom-5",
        )}
      >
        <CakeSlice className="h-4 w-4" strokeWidth={2.4} />
        {SEARCH_COPY.MENU}
      </motion.button>

      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        categories={catalog?.categories ?? []}
        onApply={applyFilters}
      />
    </>
  );
}

function Chip({ label, onTap }: { label: string; onTap: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      onClick={onTap}
      className={cn(
        "flex h-9 items-center gap-1 rounded-full bg-surface-2 px-3.5 text-[13px] font-semibold text-foreground",
      )}
    >
      {label}
    </motion.button>
  );
}
