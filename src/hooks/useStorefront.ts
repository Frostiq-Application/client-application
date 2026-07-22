import { useEffect, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { QK } from "@/constants/query-keys.constants";
import { applyBrandTheme } from "@/lib/theme";
import { storefrontService } from "@/services/api/storefront.service";
import { useBranchStore } from "@/store/branchStore";
import { useGeoStore } from "@/store/geoStore";
import type { Branch } from "@/types/domain.types";

/**
 * Loads the brand for this white-label instance's tenant (VITE_TENANT_ID) and
 * applies its accent color to the app theme as soon as it arrives.
 *
 * Coordinates come from the shared geo store rather than an argument, so every
 * caller reads the same cache entry. Passing geo per-component forked the cache:
 * the branch sheet fetched a geo-keyed copy the rest of the app never saw, and
 * its own list blanked out on every key change.
 */
export function useBrand() {
  const geo = useGeoStore((s) => s.geo);

  const query = useQuery({
    queryKey: [...QK.brand(env.tenantId), geo ?? null],
    queryFn: () => storefrontService.getBrand(env.tenantId, geo ?? undefined),
    staleTime: 5 * 60_000,
    // Location arriving changes the key; keep showing the geo-less branches
    // instead of an empty list while the sorted copy is in flight.
    placeholderData: keepPreviousData,
  });

  const themeColor = query.data?.themeColor;
  useEffect(() => {
    if (themeColor !== undefined) applyBrandTheme(themeColor);
  }, [themeColor]);

  return query;
}

/**
 * Storefront feature flags for this brand (custom cake, WhatsApp checkout).
 * Absent on older backends → every flag reads false, so the app keeps its
 * default behaviour.
 */
export function useBrandFeatures(): {
  customCake: boolean;
  whatsappCheckout: boolean;
} {
  const { data: brand } = useBrand();
  return {
    customCake: brand?.features?.can_use_custom_cake ?? false,
    whatsappCheckout: brand?.features?.can_use_whatsapp_checkout ?? false,
  };
}

/**
 * The customer's active branch: persisted choice, self-healing when the
 * branch disappears, defaulting to the first branch for single-outlet brands.
 */
export function useSelectedBranch(): {
  branch: Branch | null;
  branches: Branch[];
  needsSelection: boolean;
  isLoading: boolean;
  selectBranch: (shopId: string) => void;
} {
  const { data: brand, isLoading } = useBrand();
  const selectedShopId = useBranchStore((s) => s.selectedShopId);
  const selectBranch = useBranchStore((s) => s.selectBranch);
  const clearBranch = useBranchStore((s) => s.clearBranch);

  const branches = useMemo(() => brand?.branches ?? [], [brand]);

  const branch = useMemo(
    () => branches.find((b) => b.id === selectedShopId) ?? null,
    [branches, selectedShopId],
  );

  // Self-heal a stale persisted branch; auto-pick when only one exists.
  useEffect(() => {
    if (!brand) return;
    if (selectedShopId && !branch) clearBranch();
    const first = branches[0];
    if (!selectedShopId && branches.length === 1 && first) selectBranch(first.id);
  }, [brand, branch, branches, selectedShopId, selectBranch, clearBranch]);

  return {
    branch,
    branches,
    needsSelection: !isLoading && !!brand && !branch,
    isLoading,
    selectBranch,
  };
}

/** Full catalog (categories + active products) for a branch. */
export function useCatalog(shopId: string | null) {
  return useQuery({
    queryKey: QK.catalog(shopId ?? ""),
    queryFn: () => storefrontService.getCatalog(shopId as string),
    enabled: !!shopId,
  });
}

/** CMS banners for a branch (already cascade-resolved by the backend). */
export function useBanners(shopId: string | null) {
  return useQuery({
    queryKey: QK.banners(shopId ?? ""),
    queryFn: () => storefrontService.getBanners(shopId as string),
    enabled: !!shopId,
    staleTime: 5 * 60_000,
  });
}

/** Active add-ons (candles, cards, toppers…) for checkout extras. */
export function useAddons(shopId: string | null) {
  return useQuery({
    queryKey: QK.addons(shopId ?? ""),
    queryFn: () => storefrontService.getAddons(shopId as string),
    enabled: !!shopId,
    staleTime: 5 * 60_000,
  });
}

/** Public coupons advertised on the storefront. */
export function usePublicCoupons(shopId: string | null) {
  return useQuery({
    queryKey: QK.publicCoupons(shopId ?? ""),
    queryFn: () => storefrontService.getPublicCoupons(shopId as string),
    enabled: !!shopId,
    staleTime: 5 * 60_000,
  });
}

/**
 * Occasions with their featured product ids for a branch (CMS "featured
 * products" — Birthday, Anniversary, etc.). The caller resolves the ids against
 * the loaded catalog, so no extra product fetch is needed.
 */
export function useOccasions(shopId: string | null) {
  return useQuery({
    queryKey: QK.occasions(shopId ?? ""),
    queryFn: () => storefrontService.getOccasions(shopId as string),
    enabled: !!shopId,
    staleTime: 5 * 60_000,
  });
}

/**
 * Brand-level CMS content (tagline, about, social links). Keyed by the brand's
 * appSlug, which comes from the resolved brand — so it waits for the brand.
 */
export function useBrandContent() {
  const { data: brand } = useBrand();
  const appSlug = brand?.appSlug ?? null;
  return useQuery({
    queryKey: QK.brandContent(appSlug ?? ""),
    queryFn: () => storefrontService.getBrandContent(appSlug as string),
    enabled: !!appSlug,
    staleTime: 5 * 60_000,
  });
}

/** Effective announcement bar for a branch (may be null). */
export function useAnnouncement(shopId: string | null) {
  return useQuery({
    queryKey: QK.announcement(shopId ?? ""),
    queryFn: () => storefrontService.getAnnouncement(shopId as string),
    enabled: !!shopId,
    staleTime: 5 * 60_000,
  });
}
