import { post } from "./request";
import { API_ENDPOINTS } from "@/constants/api.constants";
import { getGuestId } from "@/lib/guestId";
import { getToken } from "@/lib/authToken";

/**
 * Fire-and-forget wishlist interest tracking. Records a save/unsave against the
 * branch so the shop admin gets analytics. Never throws — the local wishlist UX
 * must never depend on this network call succeeding. The guest id attributes
 * anonymous shoppers; the backend prefers the customer token when present.
 */
export function trackWishlist(
  shopId: string,
  productId: string,
  action: "save" | "unsave",
): void {
  // Skip when we don't know the branch yet (e.g. no branch selected).
  if (!shopId) return;
  const body: { productId: string; action: "save" | "unsave"; guestId?: string } = {
    productId,
    action,
  };
  // Only send a guestId for anonymous shoppers; logged-in ones are keyed by token.
  if (!getToken()) body.guestId = getGuestId();

  void post(API_ENDPOINTS.wishlistTrack(shopId), body).catch(() => {
    // Analytics is best-effort; swallow failures silently.
  });
}
