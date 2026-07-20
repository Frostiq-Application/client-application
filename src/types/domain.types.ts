/**
 * Domain models mirroring the service-application storefront DTOs.
 * Kept intentionally close to the backend response shapes.
 */

import type {
  DeliveryType,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from "@/constants/status.constants";

// ---- Brand & branches (discovery) ----

export interface Branch {
  id: string;
  branchName: string;
  slug: string;
  displayArea: string | null;
  address: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  whatsappNumber: string | null;
  openingTime: string | null;
  closingTime: string | null;
  closedDays: string[];
  isOpenNow: boolean;
  distanceKm: number | null;
}

export interface BrandFeatures {
  can_use_custom_cake: boolean;
  can_use_whatsapp_checkout: boolean;
}

export interface Brand {
  accountId: string;
  /** Tenant id (schema name) of this brand. */
  tenantId: string;
  name: string;
  appSlug: string;
  logoUrl: string | null;
  themeColor: string | null;
  isActive: boolean;
  /** Storefront-relevant plan flags (absent on older backends → treat as off). */
  features?: BrandFeatures;
  branches: Branch[];
}

// ---- Custom cake ordering (add-on module) ----

export type CustomCakeStatus =
  | "submitted"
  | "under_review"
  | "quotation_sent"
  | "accepted"
  | "rejected"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

/** Option lists for the request form, grouped by field key. */
export type CustomCakeOptions = Record<string, { id: string; label: string }[]>;

export interface CustomCakeRequestInput {
  guestId?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  cakeType?: string;
  weight?: string;
  shape?: string;
  theme?: string;
  occasion?: string;
  sponge?: string;
  cream?: string;
  filling?: string;
  flavour?: string;
  colour?: string;
  decorations?: string[];
  topper?: string;
  cakeMessage?: string;
  referenceImageUrls?: string[];
  deliveryType: DeliveryType;
  neededDate?: string;
  neededTime?: string;
  deliveryAddress?: string;
  notes?: string;
  specialInstructions?: string;
  allergyInfo?: string;
}

export interface CustomCakeRequest {
  id: string;
  requestNumber: string;
  shopId: string;
  status: CustomCakeStatus;
  contactName: string;
  contactPhone: string;
  cakeType: string | null;
  weight: string | null;
  shape: string | null;
  theme: string | null;
  occasion: string | null;
  sponge: string | null;
  cream: string | null;
  filling: string | null;
  flavour: string | null;
  colour: string | null;
  decorations: string[];
  topper: string | null;
  cakeMessage: string | null;
  referenceImageUrls: string[];
  deliveryType: DeliveryType;
  neededDate: string | null;
  neededTime: string | null;
  deliveryAddress: string | null;
  notes: string | null;
  specialInstructions: string | null;
  allergyInfo: string | null;
  quotedPrice: string | null;
  resolutionReason: string | null;
  convertedOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One entry of a request's status-history timeline (customer-visible). */
export interface CustomCakeEvent {
  id: string;
  requestId: string;
  status: CustomCakeStatus;
  note: string | null;
  changedBy: string | null;
  changedAt: string;
}

// ---- Catalog ----

export interface ProductVariant {
  id: string;
  label: string;
  price: string;
  isDefault: boolean;
  unitType: string;
  sortOrder: number;
}

export interface FlavorOption {
  id: string;
  flavorName: string;
  priceDelta: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string | null;
  productType: ProductType;
  name: string;
  description: string | null;
  images: string[];
  isEggless: boolean;
  isActive: boolean;
  minOrderHours: number;
  isFeatured: boolean;
  variants: ProductVariant[];
  flavorOptions: FlavorOption[];
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface Addon {
  id: string;
  name: string;
  imageUrl: string | null;
  price: string;
  unitType: string;
  isActive: boolean;
}

export interface BranchCatalog {
  categories: Category[];
  products: Product[];
}

// ---- CMS (public storefront) ----

export interface Banner {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  tapAction: "none" | "open_product" | "open_category" | "open_url";
  tapTarget: string | null;
  displayOrder: number;
}

export interface Announcement {
  id: string;
  message: string;
  bgColor: string | null;
  textColor: string | null;
}

export interface Occasion {
  id: string;
  name: string;
  iconUrl: string | null;
  displayOrder: number;
  productIds: string[];
}

// ---- Customer & addresses ----

export interface CustomerProfile {
  id: string;
  accountId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Address {
  id: string;
  label: string | null;
  fullAddress: string;
  landmark: string | null;
  city: string | null;
  pincode: string | null;
  latitude: string | null;
  longitude: string | null;
  isDefault: boolean;
}

export interface AuthResponse {
  accessToken: string;
  customer: CustomerProfile;
}

// ---- Cart ----

export interface CartItemAddon {
  id: string;
  addonId: string;
  name: string;
  priceSnapshot: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  flavorOptionId: string | null;
  productName: string;
  variantLabel: string;
  flavorName: string | null;
  image: string | null;
  quantity: number;
  unitPriceSnapshot: string;
  lineTotal: string;
  addons: CartItemAddon[];
}

export interface Cart {
  id: string;
  shopId: string;
  items: CartItem[];
  subtotal: string;
}

// ---- Coupons ----

/** Public storefront coupon (no id — keyed by code). */
export interface Coupon {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: string;
  minOrderAmount: string | null;
  displayLabel: string | null;
}

// ---- Orders ----

export interface OrderItemAddon {
  name: string;
  price: string;
  imageUrl: string | null;
}

export interface OrderItem {
  id: string;
  productName: string;
  variantLabel: string;
  flavorName: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  imageUrl: string | null;
  addons: OrderItemAddon[];
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note: string | null;
  changedBy: string | null;
  changedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddressId: string | null;
  scheduledDate: string;
  scheduledSlotStart: string | null;
  scheduledSlotEnd: string | null;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid";
  customerNote: string | null;
  cancellationReason: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
}

// ---- Scheduling responses ----

export interface SlotsResponse {
  date: string;
  open: boolean;
  closedReason: string | null;
  slots: {
    start: string;
    end: string;
    /** False once the branch's per-slot capacity is exhausted. */
    available: boolean;
    /** Orders still bookable in this slot; null = unlimited. */
    remaining: number | null;
  }[];
}

// ---- Coupon validation ----

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: string;
  code: string;
}
