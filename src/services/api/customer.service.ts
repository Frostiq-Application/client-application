import { del, get, patch, post } from "./request";
import { API_ENDPOINTS } from "@/constants/api.constants";
import type { Paginated } from "@/types/api.types";
import type {
  Address,
  AuthResponse,
  CouponValidationResult,
  CustomerProfile,
  Order,
  SlotsResponse,
} from "@/types/domain.types";

export interface AddressInput {
  label?: string;
  fullAddress: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  isDefault?: boolean;
}

export interface GuestCartItemInput {
  productId: string;
  variantId: string;
  flavorOptionId?: string;
  quantity: number;
  addonIds?: string[];
}

export interface PlaceOrderInput {
  shopId: string;
  deliveryType: "delivery" | "pickup";
  deliveryAddressId?: string;
  scheduledDate: string;
  scheduledSlotStart?: string;
  scheduledSlotEnd?: string;
  paymentMethod: "cod" | "upi_manual" | "other";
  couponCode?: string;
  customerNote?: string;
}

/** Authenticated customer surface: auth, profile, addresses, cart, orders. */
export const customerService = {
  googleLogin: (appSlug: string, idToken: string): Promise<AuthResponse> =>
    post(API_ENDPOINTS.googleLogin, { appSlug, idToken }),

  me: (): Promise<CustomerProfile> => get(API_ENDPOINTS.me),

  updateProfile: (input: { name?: string; phone?: string }): Promise<CustomerProfile> =>
    patch(API_ENDPOINTS.profile, input),

  listAddresses: (): Promise<Address[]> => get(API_ENDPOINTS.addresses),
  addAddress: (input: AddressInput): Promise<Address> => post(API_ENDPOINTS.addresses, input),
  updateAddress: (id: string, input: AddressInput): Promise<Address> =>
    patch(API_ENDPOINTS.address(id), input),
  deleteAddress: (id: string): Promise<void> => del(API_ENDPOINTS.address(id)),

  /** Push the local guest cart to the server cart (server cart backs checkout). */
  migrateCart: (shopId: string, items: GuestCartItemInput[]): Promise<unknown> =>
    post(API_ENDPOINTS.cartMigrate, { shopId, items }),

  /** Clear the server cart for a branch (idempotent pre-migrate reset). */
  clearServerCart: (shopId: string): Promise<void> =>
    del(API_ENDPOINTS.cart, { params: { shopId } }),

  placeOrder: (input: PlaceOrderInput): Promise<Order> => post(API_ENDPOINTS.myOrders, input),

  myOrders: (params?: { page?: number; limit?: number }): Promise<Paginated<Order>> =>
    get(API_ENDPOINTS.myOrders, { params }),

  myOrder: (id: string): Promise<Order> => get(API_ENDPOINTS.myOrder(id)),

  validateCoupon: (
    shopId: string,
    code: string,
    subtotal: number,
  ): Promise<CouponValidationResult> =>
    post(API_ENDPOINTS.validateCoupon, { shopId, code, subtotal }),

  slots: (
    shopId: string,
    date: string,
    productIds?: string,
    deliveryType?: "delivery" | "pickup",
  ): Promise<SlotsResponse> =>
    get(API_ENDPOINTS.slots, { params: { shopId, date, productIds, deliveryType } }),

  availableDates: (
    shopId: string,
    productIds?: string,
    deliveryType?: "delivery" | "pickup",
  ): Promise<{ dates: string[] }> =>
    get(API_ENDPOINTS.availableDates, { params: { shopId, productIds, deliveryType } }),
};
