'use client';

import { useEffect, useMemo } from 'react';
import { useAccount, useBalance, useChainId, useReadContracts } from 'wagmi';
import { getChainConfig, getTokensForChain } from '@entelewallet/config';
import { ERC20_ABI } from '@entelewallet/blockchain';
import { useNetworkView } from '@/lib/network-view-context';
import {
  balanceCacheKey,
  readBalanceCache,
  writeBalanceCache,
  type CachedPortfolioBalances,
} from '@/lib/balance-cache';
import { BALANCE_GC_MS, BALANCE_STALE_MS } from '@/lib/query-client';
import type { Address } from 'viem';

const balanceQueryOptions = {
  staleTime: BALANCE_STALE_MS,
  gcTime: BALANCE_GC_MS,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  placeholderData: <T,>(previous: T | undefined) => previous,
} as const;

export function usePortfolioBalances() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { networkViewId, activeNetwork } = useNetworkView();
  const tokens = useMemo(
    () => getTokensForChain(chainId, networkViewId),
    [chainId, networkViewId],
  );

  const cacheKey =
    address && chainId ? balanceCacheKey(address, chainId, networkViewId) : null;
  const cached = useMemo(
    () => (cacheKey ? readBalanceCache(cacheKey) : null),
    [cacheKey],
  );

  const chainConfig = getChainConfig(chainId);
  const nativeSymbol = chainConfig?.nativeCurrency.symbol ?? 'ETH';
  const nativeDecimals = chainConfig?.nativeCurrency.decimals ?? 18;

  const nativeInitial =
    cached?.native !== undefined
      ? {
          value: BigInt(cached.native),
          decimals: nativeDecimals,
          symbol: nativeSymbol,
          formatted: '0',
        }
      : undefined;

  const {
    data: nativeBalance,
    isLoading: nativeLoading,
    isFetching: nativeFetching,
    isError: nativeError,
    refetch: refetchNative,
  } = useBalance({
    address,
    chainId,
    query: {
      ...balanceQueryOptions,
      enabled: !!address && !!chainId,
      ...(nativeInitial
        ? { initialData: nativeInitial, initialDataUpdatedAt: cached?.updatedAt }
        : {}),
    },
  });

  const erc20Tokens = useMemo(
    () => tokens.filter((token) => token.contractAddress && !token.isNative),
    [tokens],
  );

  const contracts = useMemo(
    () =>
      erc20Tokens.map((token) => ({
        address: token.contractAddress as Address,
        abi: ERC20_ABI,
        functionName: 'balanceOf' as const,
        args: [address as Address],
        chainId,
      })),
    [erc20Tokens, address, chainId],
  );

  const {
    data: erc20Results,
    isLoading: erc20Loading,
    isFetching: erc20Fetching,
    isError: erc20Error,
    refetch: refetchErc20,
  } = useReadContracts({
    contracts,
    allowFailure: true,
    query: {
      ...balanceQueryOptions,
      enabled: !!address && !!chainId && contracts.length > 0,
    },
  });

  const erc20Balances = useMemo(() => {
    const map = new Map<string, bigint>();

    for (const token of erc20Tokens) {
      const cachedValue = cached?.erc20[token.symbol];
      if (cachedValue !== undefined) {
        map.set(token.symbol, BigInt(cachedValue));
      }
    }

    erc20Results?.forEach((result, index) => {
      if (result?.status === 'success') {
        map.set(erc20Tokens[index]!.symbol, result.result as bigint);
      }
    });

    return map;
  }, [cached, erc20Results, erc20Tokens]);

  const nativeValue =
    nativeBalance?.value ??
    (cached?.native !== undefined ? BigInt(cached.native) : undefined);

  const hasCachedData = Boolean(cached);
  const hasLiveNative = nativeBalance !== undefined;
  const hasLiveErc20 =
    contracts.length === 0 || (erc20Results !== undefined && !erc20Loading);

  useEffect(() => {
    if (!cacheKey || !address) return;
    if (!hasLiveNative && !hasLiveErc20) return;

    const next: CachedPortfolioBalances = {
      updatedAt: Date.now(),
      erc20: { ...(cached?.erc20 ?? {}) },
    };

    if (nativeBalance?.value !== undefined) {
      next.native = nativeBalance.value.toString();
    } else if (cached?.native !== undefined) {
      next.native = cached.native;
    }

    erc20Results?.forEach((result, index) => {
      const symbol = erc20Tokens[index]?.symbol;
      if (!symbol) return;
      if (result?.status === 'success') {
        next.erc20[symbol] = (result.result as bigint).toString();
      }
    });

    writeBalanceCache(cacheKey, next);
  }, [
    address,
    cacheKey,
    cached,
    erc20Results,
    erc20Tokens,
    hasLiveErc20,
    hasLiveNative,
    nativeBalance?.value,
  ]);

  const isInitialLoading =
    !!address &&
    !hasCachedData &&
    ((nativeLoading && nativeValue === undefined) ||
      (erc20Loading && contracts.length > 0 && erc20Balances.size === 0));

  const isRefreshing =
    (nativeFetching && nativeValue !== undefined) ||
    (erc20Fetching && erc20Balances.size > 0);

  return {
    tokens,
    activeNetwork,
    nativeValue,
    erc20Balances,
    isInitialLoading,
    isRefreshing,
    hasError: nativeError || erc20Error,
    refetch: () => {
      void refetchNative();
      void refetchErc20();
    },
  };
}
