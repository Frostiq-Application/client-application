import { useEffect, useRef } from "react";
import { fetchEventSource, EventStreamContentType } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/store/authStore";
import { env } from "@/config/env";
import type { OrderStatus } from "@/constants/status.constants";

/** One order change pushed by the backend stream (my/orders/stream). */
export interface OrderStreamEvent {
  orderId: string;
  orderNumber: string;
  type: "created" | "status" | "payment" | "cancelled";
  status: OrderStatus;
  paymentStatus: string;
  at: string;
}

/** Thrown to signal fetchEventSource it should stop retrying (auth is dead). */
class FatalStreamError extends Error {}

/**
 * Subscribes to the customer's realtime order stream (SSE) and invokes
 * `onEvent` for each change. Uses fetch-event-source (not native EventSource)
 * so the Bearer token rides in a header. Reconnects with capped exponential
 * backoff; goes quiet when signed out.
 */
export function useOrderStream(onEvent: (e: OrderStreamEvent) => void): void {
  const token = useAuthStore((s) => s.token);

  // Keep the latest callback without re-subscribing on every render.
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    let retryMs = 1000;

    fetchEventSource(`${env.apiBaseUrl}/my/orders/stream`, {
      signal: controller.signal,
      openWhenHidden: true,
      headers: { authorization: `Bearer ${token}` },

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
          onEventRef.current(JSON.parse(msg.data) as OrderStreamEvent);
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
  }, [token]);
}
