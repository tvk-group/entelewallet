import { QueryClient } from '@tanstack/react-query';

/** Balance queries stay fresh briefly; cached data shows instantly while revalidating. */
export const BALANCE_STALE_MS = 45_000;
export const BALANCE_GC_MS = 10 * 60_000;

export function createEnteleQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: BALANCE_STALE_MS,
        gcTime: BALANCE_GC_MS,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  });
}
