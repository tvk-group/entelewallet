'use client';

import { useAccount, useBalance, useReadContracts, useChainId } from 'wagmi';
import { getTokensForChain } from '@entelewallet/config';
import { ERC20_ABI } from '@entelewallet/blockchain';
import { AssetCard } from './asset-card';
import { useMemo } from 'react';
import { useNetworkView } from '@/lib/network-view-context';
import { useT } from '@/lib/i18n-context';
import type { Address } from 'viem';

export function AssetGrid() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { networkViewId, activeNetwork } = useNetworkView();
  const tokens = getTokensForChain(chainId, networkViewId);

  const { data: nativeBalance, isLoading: nativeLoading, isError: nativeError, refetch: refetchNative } =
    useBalance({
      address,
      chainId,
      query: { enabled: !!address && !!chainId },
    });

  const erc20Tokens = tokens.filter((token) => token.contractAddress && !token.isNative);

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
    data: balances,
    isLoading: erc20Loading,
    isError: erc20Error,
    refetch: refetchErc20,
  } = useReadContracts({
    contracts,
    query: { enabled: !!address && !!chainId && contracts.length > 0 },
  });

  if (!isConnected) return null;

  if (tokens.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{t('assets.noTokensForNetwork')}</p>
      </div>
    );
  }

  const hasError = nativeError || erc20Error;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t('assets.tokens')}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {activeNetwork?.name ?? t('assets.network')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void refetchNative();
            void refetchErc20();
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-200 hover:text-cyan-800"
        >
          {t('assets.refresh')}
        </button>
      </div>

      {hasError && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          {t('assets.balanceFetchWarning')}
        </div>
      )}

      <ul className="divide-y divide-slate-100">
        {tokens.map((token) => {
          if (token.isNative) {
            return (
              <li key={`${token.chainId}-${token.symbol}-native`}>
                <AssetCard
                  token={token}
                  balance={nativeBalance?.value}
                  loading={nativeLoading}
                  error={nativeError ? 'Failed' : undefined}
                />
              </li>
            );
          }

          const erc20Index = erc20Tokens.findIndex((entry) => entry.symbol === token.symbol);
          const balanceResult = erc20Index >= 0 ? balances?.[erc20Index] : undefined;

          return (
            <li key={`${token.chainId}-${token.symbol}`}>
              <AssetCard
                token={token}
                balance={
                  balanceResult?.status === 'success'
                    ? (balanceResult.result as bigint)
                    : undefined
                }
                loading={erc20Loading && !token.pendingOfficialConfiguration}
                error={balanceResult?.status === 'failure' ? 'Failed' : undefined}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
