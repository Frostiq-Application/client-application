import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/constants/query-keys.constants";
import { customCakeService } from "@/services/api/customCake.service";

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
    refetchInterval: 30_000,
  });
}

export function useCustomCakeEvents(shopId: string | null, id: string) {
  return useQuery({
    queryKey: shopId
      ? QK.customCakeEvents(shopId, id)
      : ["custom-cake", "events", "none", id],
    queryFn: () => customCakeService.events(shopId as string, id),
    enabled: !!shopId && !!id,
    refetchInterval: 30_000,
  });
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
