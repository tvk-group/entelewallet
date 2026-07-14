'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getAlchemyDiscoveryChainIds } from '@entelewallet/config';
import type { PortfolioAsset } from '@entelewallet/types';
import {
  hideDiscoveredToken,
  readHiddenDiscovered,
} from '@/lib/discovered-token-storage';

const DISCOVERY_CHAIN_IDS = getAlchemyDiscoveryChainIds();

async function fetchDiscoveredForChain(
  address: string,
  chainId: number,
  hidden: string[],
): Promise<PortfolioAsset[]> {
  const params = new URLSearchParams({
    address,
    chainId: String(chainId),
    hidden: hidden.join(','),
  });
  const res = await fetch(`/api/portfolio/discover?${params.toString()}`);
  const data = (await res.json()) as { discovered?: PortfolioAsset[] };
  return data.discovered ?? [];
}

async function fetchAllDiscovered(
  address: string,
  hiddenByChain: Record<number, string[]>,
): Promise<PortfolioAsset[]> {
  const results = await Promise.all(
    DISCOVERY_CHAIN_IDS.map((chainId) =>
      fetchDiscoveredForChain(address, chainId, hiddenByChain[chainId] ?? []),
    ),
  );
  return results.flat().sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
}

export function useDiscoveredTokens(enabled: boolean) {
  const { address } = useAccount();
  const [hiddenByChain, setHiddenByChain] = useState<Record<number, string[]>>({});

  const hiddenKey = DISCOVERY_CHAIN_IDS.map(
    (id) => `${id}:${(hiddenByChain[id] ?? readHiddenDiscovered(address ?? '', id)).join('|')}`,
  ).join(';');

  const query = useQuery({
    queryKey: ['discovered-tokens', address, hiddenKey, enabled],
    queryFn: () => {
      const map: Record<number, string[]> = {};
      for (const chainId of DISCOVERY_CHAIN_IDS) {
        map[chainId] = hiddenByChain[chainId] ?? readHiddenDiscovered(address!, chainId);
      }
      return fetchAllDiscovered(address!, map);
    },
    enabled: enabled && !!address,
    staleTime: 120_000,
    retry: 1,
  });

  const dismissToken = useCallback(
    (contractAddress: string, chainId?: number) => {
      if (!address) return;
      const targetChain = chainId ?? 1;
      const next = hideDiscoveredToken(address, targetChain, contractAddress);
      setHiddenByChain((prev) => ({ ...prev, [targetChain]: next }));
    },
    [address],
  );

  return {
    discovered: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    dismissToken,
    refetch: query.refetch,
  };
}
