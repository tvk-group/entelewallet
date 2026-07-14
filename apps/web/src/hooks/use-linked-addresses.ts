'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import type { LinkedAddresses, NonEvmBalance } from '@entelewallet/types';
import {
  isValidCardanoAddress,
  isValidSuiAddress,
  readLinkedAddresses,
  writeLinkedAddresses,
} from '@/lib/linked-addresses';
import { getCoingeckoId } from '@entelewallet/config';
import { useTokenPrices } from '@/hooks/use-token-prices';
import type { TokenConfig } from '@entelewallet/types';
import { formatUnits } from 'viem';

async function fetchNonEvmBalances(linked: LinkedAddresses): Promise<NonEvmBalance[]> {
  const params = new URLSearchParams();
  if (linked.sui) params.set('sui', linked.sui);
  if (linked.cardano) params.set('cardano', linked.cardano);
  if (!params.toString()) return [];

  const res = await fetch(`/api/portfolio/non-evm?${params.toString()}`);
  const data = (await res.json()) as {
    balances: Array<NonEvmBalance & { error?: string }>;
  };

  return (data.balances ?? []).filter((row) => !row.error && row.balance);
}

export function useLinkedAddresses() {
  const { address } = useAccount();
  const [linked, setLinked] = useState<LinkedAddresses>({});

  useEffect(() => {
    if (address) {
      setLinked(readLinkedAddresses(address));
    } else {
      setLinked({});
    }
  }, [address]);

  const priceTokens: TokenConfig[] = [
    {
      symbol: 'SUI',
      name: 'Sui',
      decimals: 9,
      network: 'sui',
      chainId: 0,
      coingeckoId: 'sui',
      enabled: true,
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      decimals: 6,
      network: 'cardano',
      chainId: 0,
      coingeckoId: 'cardano',
      enabled: true,
    },
  ];

  const { prices } = useTokenPrices(priceTokens);

  const balancesQuery = useQuery({
    queryKey: ['non-evm-balances', linked.sui, linked.cardano],
    queryFn: () => fetchNonEvmBalances(linked),
    enabled: !!(linked.sui || linked.cardano),
    staleTime: 60_000,
  });

  const balancesWithUsd = (balancesQuery.data ?? []).map((row) => {
    const id = getCoingeckoId({
      symbol: row.symbol,
      coingeckoId: row.symbol === 'SUI' ? 'sui' : 'cardano',
      isNative: true,
    });
    const price = id ? prices[id] : undefined;
    const amount = Number(formatUnits(BigInt(row.balance), row.decimals));
    return {
      ...row,
      valueUsd: price !== undefined && Number.isFinite(amount) ? amount * price : undefined,
    };
  });

  const saveLinked = useCallback(
    (patch: Partial<LinkedAddresses>) => {
      if (!address) return false;
      const next: LinkedAddresses = { ...linked, ...patch };
      if (next.sui && !isValidSuiAddress(next.sui)) return false;
      if (next.cardano && !isValidCardanoAddress(next.cardano)) return false;
      writeLinkedAddresses(address, next);
      setLinked(next);
      return true;
    },
    [address, linked],
  );

  const clearLinked = useCallback(
    (network: keyof LinkedAddresses) => {
      if (!address) return;
      const next = { ...linked };
      delete next[network];
      writeLinkedAddresses(address, next);
      setLinked(next);
    },
    [address, linked],
  );

  return {
    linked,
    balances: balancesWithUsd,
    isLoading: balancesQuery.isLoading,
    saveLinked,
    clearLinked,
    isValidSuiAddress,
    isValidCardanoAddress,
    refetch: balancesQuery.refetch,
  };
}
