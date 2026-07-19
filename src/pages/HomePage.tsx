import { useMemo, useState, type UIEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layouts/Page";
import { ROUTES, buildPath } from "@/routes/paths";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyBoxArt } from "@/components/common/illustrations";
import {
  useAnnouncement,
  useBanners,
  useBrand,
  useCatalog,
  usePublicCoupons,
  useSelectedBranch,
} from "@/hooks/useStorefront";
import { toast } from "@/store/toastStore";
import { quickAdd } from "@/store/cartStore";
import { TOAST } from "@/constants/toast.constants";
import { CART_COPY } from "@/features/cart/constants";
import type { Product } from "@/types/domain.types";
import { AnnouncementBar } from "@/features/home/components/AnnouncementBar";
import { BannerCarousel } from "@/features/home/components/BannerCarousel";
import { BranchSheet } from "@/features/home/components/BranchSheet";
import { ALL_CATEGORIES, CategoryChips } from "@/features/home/components/CategoryChips";
import { CollapsedHeader } from "@/features/home/components/CollapsedHeader";
import { CouponRail } from "@/features/home/components/CouponRail";
import { FeaturedStrip } from "@/features/home/components/FeaturedStrip";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { HomeSkeleton } from "@/features/home/components/HomeSkeleton";
import { ProductCard } from "@/features/home/components/ProductCard";
import { SectionHeader } from "@/features/home/components/SectionHeader";
import { HOME_COPY } from "@/features/home/constants";

export function HomePage() {
  const navigate = useNavigate();
  const brandQuery = useBrand();
  const { branch, needsSelection } = useSelectedBranch();
  const shopId = branch?.id ?? null;

  const catalogQuery = useCatalog(shopId);
  const bannersQuery = useBanners(shopId);
  const announcementQuery = useAnnouncement(shopId);
  const couponsQuery = usePublicCoupons(shopId);

  const [branchSheetOpen, setBranchSheetOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const [collapsed, setCollapsed] = useState(false);

  // Show the compact address+search bar once the hero scrolls out of view.
  const HERO_COLLAPSE_AT = 120;
  const onScroll = (e: UIEvent<HTMLDivElement>) =>
    setCollapsed(e.currentTarget.scrollTop > HERO_COLLAPSE_AT);

  const products = useMemo(() => catalogQuery.data?.products ?? [], [catalogQuery.data]);
  const categories = useMemo(() => catalogQuery.data?.categories ?? [], [catalogQuery.data]);

  // Each category chip is backed by the first product photo in that category.
  const imageByCategory = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const category of categories) {
      map[category.id] = products.find((p) => p.categoryId === category.id && p.images[0])
        ?.images[0];
    }
    return map;
  }, [categories, products]);

  const visibleProducts = useMemo(
    () =>
      categoryFilter === ALL_CATEGORIES
        ? products
        : products.filter((p) => p.categoryId === categoryFilter),
    [products, categoryFilter],
  );

  const featured = useMemo(() => products.filter((p) => p.isFeatured), [products]);

  const onProductTap = (product: Product) => navigate(buildPath.product(product.id));

  const onQuickAdd = (product: Product) => {
    const result = quickAdd(product);
    if (result === "no-variant") return;
    toast.success(result === "replaced-branch" ? CART_COPY.BRANCH_REPLACED : TOAST.ADDED_TO_CART);
  };

  if (brandQuery.isLoading || (shopId && catalogQuery.isLoading)) {
    return (
      <Page>
        <HomeSkeleton />
      </Page>
    );
  }

  if (brandQuery.isError) {
    return (
      <Page>
        <ErrorState error={brandQuery.error} onRetry={() => brandQuery.refetch()} />
      </Page>
    );
  }

  return (
    <>
      <AnnouncementBar announcement={announcementQuery.data ?? null} />
      <CollapsedHeader
        visible={collapsed}
        branch={branch}
        onBranchTap={() => setBranchSheetOpen(true)}
      />
      <Page onScroll={onScroll}>
        <HomeHeader
          brand={brandQuery.data ?? null}
          branch={branch}
          onBranchTap={() => setBranchSheetOpen(true)}
        />

        {shopId && (
          <>
            <CategoryChips
              categories={categories}
              imageByCategory={imageByCategory}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />

            <div className="pt-2">
              <BannerCarousel banners={bannersQuery.data ?? []} />
            </div>

            {(couponsQuery.data?.length ?? 0) > 0 && (
              <>
                <SectionHeader title={HOME_COPY.OFFERS} />
                <CouponRail coupons={couponsQuery.data ?? []} />
              </>
            )}

            {featured.length > 0 && (
              <>
                <SectionHeader title={HOME_COPY.TOP_PRODUCTS} action={<ExploreAll onTap={() => navigate(ROUTES.SEARCH)} />} />
                <FeaturedStrip products={featured} onTap={onProductTap} onAdd={onQuickAdd} />
              </>
            )}

            {visibleProducts.length > 0 ? (
              <>
                <SectionHeader title={HOME_COPY.MOST_ORDERED} action={<ExploreAll onTap={() => navigate(ROUTES.SEARCH)} />} />
                <div className="grid grid-cols-2 gap-3 px-4 pb-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                  {visibleProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onTap={onProductTap}
                      onAdd={onQuickAdd}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<EmptyBoxArt className="h-16 w-16" />}
                title={HOME_COPY.EMPTY_CATALOG_TITLE}
                description={HOME_COPY.EMPTY_CATALOG_DESC}
              />
            )}
          </>
        )}
      </Page>

      <BranchSheet
        open={branchSheetOpen || needsSelection}
        onClose={() => setBranchSheetOpen(false)}
        required={needsSelection}
      />
    </>
  );
}

function ExploreAll({ onTap }: { onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      {HOME_COPY.EXPLORE_ALL}
    </button>
  );
}
