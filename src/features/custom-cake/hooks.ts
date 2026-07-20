import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/constants/query-keys.constants";
import { customCakeService } from "@/services/api/customCake.service";
import {
  useCustomCakeStream,
  type CustomCakeStreamEvent,
} from "@/hooks/useCustomCakeStream";

export function useCustomCakeOptions(shopId: string | null) {
  return useQuery({
    queryKey: shopId ? QK.customCakeOptions(shopId) : ["custom-cake", "options", "none"],
    queryFn: () => customCakeService.options(shopId as string),
    enabled: !!shopId,
    staleTime: 5 * 60_000,
  });
}

export function useMyCustomCakeRequests(shopId: string | null) {
  return useQuery({
    queryKey: shopId
      ? QK.customCakeRequests(shopId)
      : ["custom-cake", "requests", "none"],
    queryFn: () => customCakeService.myRequests(shopId as string),
    enabled: !!shopId,
  });
}

export function useCustomCakeRequest(shopId: string | null, id: string) {
  return useQuery({
    queryKey: shopId
      ? QK.customCakeRequest(shopId, id)
      : ["custom-cake", "request", "none", id],
    queryFn: () => customCakeService.request(shopId as string, id),
    enabled: !!shopId && !!id,
    // Live updates arrive over SSE (useCustomCakeRealtime); a slow poll is a
    // backstop for missed frames / dropped connections.
    refetchInterval: 60_000,
  });
}

export function useCustomCakeEvents(shopId: string | null, id: string) {
  return useQuery({
    queryKey: shopId
      ? QK.customCakeEvents(shopId, id)
      : ["custom-cake", "events", "none", id],
    queryFn: () => customCakeService.events(shopId as string, id),
    enabled: !!shopId && !!id,
    refetchInterval: 60_000,
  });
}

/**
 * Subscribes to the realtime custom-cake stream for a branch and invalidates the
 * affected request views as changes land. Optionally narrows to a single
 * `requestId` (detail page) — the requests-list cache is always refreshed too.
 */
export function useCustomCakeRealtime(
  shopId: string | null,
  requestId?: string,
) {
  const qc = useQueryClient();
  const onEvent = useCallback(
    (e: CustomCakeStreamEvent) => {
      if (!shopId) return;
      if (requestId && e.requestId !== requestId) {
        // Detail page: still keep the list fresh, skip the per-request refetch.
        void qc.invalidateQueries({ queryKey: QK.customCakeRequests(shopId) });
        return;
      }
      void qc.invalidateQueries({ queryKey: QK.customCakeRequests(shopId) });
      void qc.invalidateQueries({
        queryKey: QK.customCakeRequest(shopId, e.requestId),
      });
      void qc.invalidateQueries({
        queryKey: QK.customCakeEvents(shopId, e.requestId),
      });
    },
    [qc, shopId, requestId],
  );
  useCustomCakeStream(shopId, onEvent);
}

/** Accept or decline the bakery's quotation, then refresh the request views. */
export function useRespondToQuote(shopId: string | null, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accept, note }: { accept: boolean; note?: string }) =>
      customCakeService.respond(shopId as string, id, accept, note),
    onSuccess: () => {
      if (!shopId) return;
      void qc.invalidateQueries({ queryKey: QK.customCakeRequest(shopId, id) });
      void qc.invalidateQueries({ queryKey: QK.customCakeEvents(shopId, id) });
      void qc.invalidateQueries({ queryKey: QK.customCakeRequests(shopId) });
    },
  });
}
