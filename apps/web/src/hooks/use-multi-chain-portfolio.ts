'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchMultiChainPortfolio } from '@/lib/multi-chain-balances';
import { useTokenPrices } from '@/hooks/use-token-prices';
import { getFullPortfolioChainIds, getTokensForChain } from '@entelewallet/config';
import { useMemo } from 'react';

export function useMultiChainPortfolio() {
  const { address, status } = useAccount();

  const portfolioChainIds = useMemo(() => getFullPortfolioChainIds(), []);

  const priceTokens = useMemo(() => {
    return portfolioChainIds.flatMap((chainId) => getTokensForChain(chainId));
  }, [portfolioChainIds]);

  const { prices } = useTokenPrices(priceTokens);

  const walletReady = !!address && status === 'connected';

  const query = useQuery({
    queryKey: ['multi-chain-portfolio', address, Object.keys(prices).join(',')],
    queryFn: () => fetchMultiChainPortfolio(address!, prices),
    enabled: walletReady,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
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
