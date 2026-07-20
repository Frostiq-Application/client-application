import { useEffect, useRef } from "react";
import { fetchEventSource, EventStreamContentType } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/store/authStore";
import { getGuestId } from "@/lib/guestId";
import { env } from "@/config/env";
import type { CustomCakeStatus } from "@/types/domain.types";

/** One custom-cake-request change pushed by the requester SSE stream. */
export interface CustomCakeStreamEvent {
  accountId: string;
  shopId: string;
  customerId: string | null;
  guestId: string | null;
  requestId: string;
  requestNumber: string;
  type: "created" | "status" | "quote" | "converted";
  status: CustomCakeStatus;
  at: string;
}

/** Thrown to signal fetchEventSource it should stop retrying (auth is dead). */
class FatalStreamError extends Error {}

/**
 * Subscribes to the requester's realtime custom-cake stream (SSE) for a branch
 * and invokes `onEvent` for each change. Guest-friendly: a logged-in customer
 * sends a Bearer token; a guest passes their device id as `?guestId=`.
 *
 * Uses fetch-event-source (not native EventSource) so the token can ride in a
 * header. Reconnects with capped exponential backoff; goes quiet without a
 * branch. Re-subscribes when the branch or sign-in state changes.
 */
export function useCustomCakeStream(
  shopId: string | null,
  onEvent: (e: CustomCakeStreamEvent) => void,
): void {
  const token = useAuthStore((s) => s.token);

  // Keep the latest callback without re-subscribing on every render.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!shopId) return;

    const controller = new AbortController();
    let retryMs = 1000;

    // Logged-in customers stream by token; guests by their device id.
    const guestId = token ? null : getGuestId();
    const url = new URL(
      `${env.apiBaseUrl}/storefront/branches/${shopId}/custom-cake/stream`,
    );
    if (guestId) url.searchParams.set("guestId", guestId);

    fetchEventSource(url.toString(), {
      signal: controller.signal,
      openWhenHidden: true,
      headers: token ? { authorization: `Bearer ${token}` } : undefined,

      async onopen(res) {
        const ct = res.headers.get("content-type") ?? "";
        if (res.ok && ct.includes(EventStreamContentType)) {
          retryMs = 1000;
          return;
        }
        if (res.status === 401) throw new FatalStreamError("Session expired");
        throw new Error(`Stream failed: ${res.status}`);
      },

      onmessage(msg) {
        if (!msg.data) return;
        try {
          onEventRef.current(JSON.parse(msg.data) as CustomCakeStreamEvent);
        } catch {
          /* ignore malformed frames */
        }
      },

      onerror(err) {
        if (err instanceof FatalStreamError) throw err; // stop retrying
        const delay = retryMs;
        retryMs = Math.min(retryMs * 2, 30_000);
        return delay;
      },
    }).catch(() => {
      /* aborted or fatal — nothing more to do */
    });

    return () => controller.abort();
  }, [shopId, token]);
}
