import { API_ENDPOINTS } from "@/constants/api.constants";
import { getToken } from "@/lib/authToken";
import { getGuestId } from "@/lib/guestId";
import type {
  CustomCakeEvent,
  CustomCakeOptions,
  CustomCakeRequest,
  CustomCakeRequestInput,
} from "@/types/domain.types";
import { get, post } from "./request";

/**
 * Custom cake ordering (add-on module). Guest-friendly — a guestId is attached
 * for anonymous shoppers so they can see their own requests without an account.
 */
export const customCakeService = {
  options: (shopId: string): Promise<CustomCakeOptions> =>
    get(API_ENDPOINTS.customCakeOptions(shopId)),

  submit: (
    shopId: string,
    input: CustomCakeRequestInput,
  ): Promise<{ id: string; requestNumber: string; status: string }> =>
    post(API_ENDPOINTS.customCakeRequests(shopId), {
      ...input,
      guestId: getToken() ? undefined : getGuestId(),
    }),

  myRequests: (shopId: string): Promise<CustomCakeRequest[]> =>
    get(API_ENDPOINTS.customCakeRequests(shopId), {
      params: getToken() ? undefined : { guestId: getGuestId() },
    }),

  request: (shopId: string, id: string): Promise<CustomCakeRequest> =>
    get(API_ENDPOINTS.customCakeRequest(shopId, id), {
      params: getToken() ? undefined : { guestId: getGuestId() },
    }),

  /** Status-history timeline for a request the requester owns. */
  events: (shopId: string, id: string): Promise<CustomCakeEvent[]> =>
    get(API_ENDPOINTS.customCakeRequestEvents(shopId, id), {
      params: getToken() ? undefined : { guestId: getGuestId() },
    }),

  /** Accept or decline the bakery's quotation. */
  respond: (
    shopId: string,
    id: string,
    accept: boolean,
    note?: string,
  ): Promise<CustomCakeRequest> =>
    post(API_ENDPOINTS.customCakeRespond(shopId, id), {
      accept,
      note,
      guestId: getToken() ? undefined : getGuestId(),
    }),

  /** Upload a reference image; returns its public URL. */
  uploadReference: async (shopId: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await post<{ url: string; key: string }>(
      API_ENDPOINTS.customCakeUpload(shopId),
      form,
    );
    return res.url;
  },
};
