import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/navigation/TopBar";
import { Page } from "@/components/layouts/Page";
import { LoadingScreen } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyBoxArt } from "@/components/common/illustrations";
import { ProductCard } from "@/features/home/components/ProductCard";
import { HOME_COPY } from "@/features/home/constants";
import { useCatalog, useSelectedBranch } from "@/hooks/useStorefront";
import { storefrontService } from "@/services/api/storefront.service";
import { QK } from "@/constants/query-keys.constants";
import { PAGINATION } from "@/constants/app.constants";
import { buildPath } from "@/routes/paths";

/** Products of one category — pushed from the Home category grid. */
export function CategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const { branch } = useSelectedBranch();
  const shopId = branch?.id ?? null;

  // Title: pushed nav state first, catalog cache as fallback.
  const { data: catalog } = useCatalog(shopId);
  const stateName = (location.state as { name?: string } | null)?.name;
  const title = useMemo(
    () => stateName ?? catalog?.categories.find((c) => c.id === categoryId)?.name ?? "Category",
    [stateName, catalog, categoryId],
  );

  const query = useQuery({
    queryKey: QK.products(shopId ?? "", { categoryId }),
    queryFn: () =>
      storefrontService.browseProducts(shopId as string, {
        categoryId,
        page: PAGINATION.DEFAULT_PAGE,
        limit: 50,
      }),
    enabled: !!shopId && !!categoryId,
  });

  const products = query.data?.data ?? [];

  return (
    <>
      <TopBar back title={title} />
      <Page>
        {query.isLoading ? (
          <LoadingScreen />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<EmptyBoxArt className="h-16 w-16" />}
            title={HOME_COPY.EMPTY_CATALOG_TITLE}
            description={HOME_COPY.EMPTY_CATALOG_DESC}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pb-8 pt-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onTap={(p) => navigate(buildPath.product(p.id))}
              />
            ))}
          </div>
        )}
      </Page>
    </>
  );
}
