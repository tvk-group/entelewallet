'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collectCoingeckoIds, getCoingeckoId } from '@entelewallet/config';
import type { TokenConfig } from '@entelewallet/types';
import { formatUnits } from 'viem';

export type TokenPrices = Record<string, number>;

async function fetchPrices(ids: string[]): Promise<TokenPrices> {
  if (ids.length === 0) return {};
  const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids.join(','))}`);
  const data = (await res.json()) as { prices?: TokenPrices };
  return data.prices ?? {};
}

export function useTokenPrices(tokens: TokenConfig[]) {
  const ids = useMemo(() => collectCoingeckoIds(tokens), [tokens]);

  const query = useQuery({
    queryKey: ['token-prices', ids.join(',')],
    queryFn: () => fetchPrices(ids),
    enabled: ids.length > 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });

  return {
    prices: query.data ?? {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
}

export function getTokenUsdValue(
  token: TokenConfig,
  balance: bigint | undefined,
  prices: TokenPrices,
): number | undefined {
  if (balance === undefined) return undefined;
  const id = getCoingeckoId(token);
  if (!id || prices[id] === undefined) return undefined;
  const amount = Number(formatUnits(balance, token.decimals));
  if (!Number.isFinite(amount)) return undefined;
  return amount * prices[id];
}

export function formatUsd(value: number | undefined): string | null {
  if (value === undefined || !Number.isFinite(value)) return null;
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });
}
