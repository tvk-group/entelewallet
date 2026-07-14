'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { fetchMultiChainPortfolio } from '@/lib/multi-chain-balances';
import { useTokenPrices } from '@/hooks/use-token-prices';
import { getFullPortfolioChainIds, getTokensForChain } from '@entelewallet/config';
import { useMemo } from 'react';

export function useMultiChainPortfolio() {
  const { address } = useAccount();

  const portfolioChainIds = useMemo(() => getFullPortfolioChainIds(), []);

  const priceTokens = useMemo(() => {
    return portfolioChainIds.flatMap((chainId) => getTokensForChain(chainId));
  }, [portfolioChainIds]);

  const { prices } = useTokenPrices(priceTokens);

  const query = useQuery({
    queryKey: ['multi-chain-portfolio', address, Object.keys(prices).join(',')],
    queryFn: () => fetchMultiChainPortfolio(address as Address, prices),
    enabled: !!address,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  return {
    holdings: query.data?.holdings ?? [],
    breakdown: query.data?.breakdown ?? [],
    crossChainTotalUsd: query.data?.crossChainTotalUsd,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
