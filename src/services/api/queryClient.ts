import { QueryClient } from "@tanstack/react-query";
import { normalizeError } from "@/lib/apiError";

/**
 * Shared QueryClient. Retries only on network/5xx, never on 4xx (a 404 won't
 * fix itself), and keeps data fresh enough for a snappy storefront.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        const status = normalizeError(error).status;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
