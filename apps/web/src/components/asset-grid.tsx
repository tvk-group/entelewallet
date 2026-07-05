'use client';

import { useAccount, useBalance, useReadContracts, useChainId } from 'wagmi';
import { getTokensForChain } from '@entelewallet/config';
import { ERC20_ABI } from '@entelewallet/blockchain';
import { AssetCard } from './asset-card';
import { useMemo } from 'react';
import type { Address } from 'viem';

export function AssetGrid() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const tokens = getTokensForChain(chainId || 1);

  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const erc20Tokens = tokens.filter((t) => t.contractAddress && !t.isNative);

  const contracts = useMemo(
    () =>
      erc20Tokens.map((token) => ({
        address: token.contractAddress as Address,
        abi: ERC20_ABI,
        functionName: 'balanceOf' as const,
        args: [address as Address],
        chainId: token.chainId,
      })),
    [erc20Tokens, address],
  );

  const { data: balances, isLoading: erc20Loading } = useReadContracts({
    contracts,
    query: { enabled: !!address && contracts.length > 0 },
  });

  if (!isConnected) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => {
        if (token.isNative) {
          return (
            <AssetCard
              key={token.symbol}
              token={token}
              balance={nativeBalance?.value}
              loading={nativeLoading}
            />
          );
        }

        const erc20Index = erc20Tokens.findIndex((t) => t.symbol === token.symbol);
        const balanceResult =
          erc20Index >= 0 ? balances?.[erc20Index] : undefined;

        return (
          <AssetCard
            key={token.symbol}
            token={token}
            balance={
              balanceResult?.status === 'success'
                ? (balanceResult.result as bigint)
                : undefined
            }
            loading={erc20Loading && !token.pendingOfficialConfiguration}
            error={
              balanceResult?.status === 'failure' ? 'Failed' : undefined
            }
          />
        );
      })}
    </div>
  );
}
