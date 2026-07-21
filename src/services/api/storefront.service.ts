import { get } from "./request";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { Paginated } from "@/types/api.types";
import type {
  Addon,
  Announcement,
  Banner,
  Brand,
  BrandContent,
  Branch,
  BranchCatalog,
  Coupon,
  Occasion,
  Product,
} from "@/types/domain.types";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BrowseProductsParams {
  search?: string;
  categoryId?: string;
  productType?: string;
  isEggless?: boolean;
  page?: number;
  limit?: number;
}

/** Public storefront discovery + CMS calls. Pure functions — no React here. */
export const storefrontService = {
  getBrand: (tenantId: string, geo?: GeoPoint): Promise<Brand> =>
    get(API_ENDPOINTS.brand(tenantId), { params: geo }),

  getBranch: (shopId: string): Promise<Branch> => get(API_ENDPOINTS.branch(shopId)),

  getCatalog: (shopId: string): Promise<BranchCatalog> =>
    get(API_ENDPOINTS.branchCatalog(shopId)),

  browseProducts: (shopId: string, params: BrowseProductsParams): Promise<Paginated<Product>> =>
    get(API_ENDPOINTS.branchProducts(shopId), { params }),

  getProduct: (shopId: string, productId: string): Promise<Product> =>
    get(API_ENDPOINTS.branchProduct(shopId, productId)),

  getAddons: (shopId: string): Promise<Addon[]> => get(API_ENDPOINTS.branchAddons(shopId)),

  getBanners: (shopId: string): Promise<Banner[]> => get(API_ENDPOINTS.banners(shopId)),

  getAnnouncement: (shopId: string): Promise<Announcement | null> =>
    get(API_ENDPOINTS.announcement(shopId)),

  getOccasions: (shopId: string): Promise<Occasion[]> => get(API_ENDPOINTS.occasions(shopId)),

  getBrandContent: (appSlug: string): Promise<BrandContent> =>
    get(API_ENDPOINTS.brandContent(appSlug)),

  getPublicCoupons: (shopId: string): Promise<Coupon[]> =>
    get(API_ENDPOINTS.publicCoupons(shopId)),
};
