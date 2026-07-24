'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  collectCoingeckoIds,
  contractPriceKey,
  getCoingeckoId,
  getCoingeckoPlatform,
} from '@entelewallet/config';
import type { PortfolioAsset, TokenConfig } from '@entelewallet/types';
import { formatUnits } from 'viem';

export type TokenPrices = Record<string, number>;

async function fetchPrices(ids: string[]): Promise<TokenPrices> {
  if (ids.length === 0) return {};
  const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids.join(','))}`);
  const data = (await res.json()) as { prices?: TokenPrices };
  return data.prices ?? {};
}

async function fetchContractPrices(chainId: number, contracts: string[]): Promise<TokenPrices> {
  if (contracts.length === 0) return {};
  const platform = getCoingeckoPlatform(chainId);
  if (!platform) return {};

  const res = await fetch(
    `/api/prices?platform=${encodeURIComponent(platform)}&chainId=${chainId}&contracts=${encodeURIComponent(contracts.join(','))}`,
  );
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

export function useDiscoveredAssetPrices(assets: PortfolioAsset[]) {
  const contractGroups = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const asset of assets) {
      if (!asset.contractAddress || asset.fiatQuotePolicy === 'none' || asset.chainId === undefined)
        continue;
      const list = map.get(asset.chainId) ?? [];
      list.push(asset.contractAddress.toLowerCase());
      map.set(asset.chainId, list);
    }
    return [...map.entries()];
  }, [assets]);

  const queryKey = contractGroups
    .map(([chainId, addrs]) => `${chainId}:${addrs.sort().join('|')}`)
    .join(';');

  const query = useQuery({
    queryKey: ['contract-prices', queryKey],
    queryFn: async () => {
      const merged: TokenPrices = {};
      await Promise.all(
        contractGroups.map(async ([chainId, contracts]) => {
          const prices = await fetchContractPrices(chainId, contracts);
          Object.assign(merged, prices);
        }),
      );
      return merged;
    },
    enabled: contractGroups.length > 0,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  return { prices: query.data ?? {}, isLoading: query.isLoading };
}

export function getTokenUsdValue(
  token: TokenConfig,
  balance: bigint | undefined,
  prices: TokenPrices,
): number | undefined {
  if (balance === undefined) return undefined;
  const id = getCoingeckoId(token);
  const price = id ? prices[id] : undefined;
  if (price === undefined) return undefined;
  const amount = Number(formatUnits(balance, token.decimals));
  if (!Number.isFinite(amount)) return undefined;
  return amount * price;
}

export function getAssetUsdValue(
  asset: Pick<
    PortfolioAsset,
    'chainId' | 'contractAddress' | 'decimals' | 'balance' | 'coingeckoId' | 'fiatQuotePolicy'
  >,
  prices: TokenPrices,
): number | undefined {
  if (
    !asset.balance ||
    asset.fiatQuotePolicy === 'none' ||
    asset.chainId === undefined ||
    asset.decimals === undefined
  )
    return undefined;
  const balance = BigInt(asset.balance);
  if (balance === 0n) return undefined;

  let price: number | undefined;
  if (asset.coingeckoId) {
    price = prices[asset.coingeckoId];
  }
  if (price === undefined && asset.contractAddress) {
    price = prices[contractPriceKey(asset.chainId, asset.contractAddress)];
  }
  if (price === undefined) return undefined;

  const amount = Number(formatUnits(balance, asset.decimals));
  if (!Number.isFinite(amount)) return undefined;
  return amount * price;
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
