import { getChainConfig } from '@entelewallet/config';
import type { TokenConfig } from '@entelewallet/types';
import { getAddress } from 'viem';

export function getExplorerAddressUrl(chainId: number, address: string): string {
  const chain = getChainConfig(chainId);
  const base = chain?.blockExplorers.default.url ?? 'https://etherscan.io';
  return `${base}/address/${getAddress(address)}`;
}

export function getExplorerTxUrl(chainId: number, hash: string): string {
  const chain = getChainConfig(chainId);
  const base = chain?.blockExplorers.default.url ?? 'https://etherscan.io';
  return `${base}/tx/${hash}`;
}

export function getExplorerTokenUrl(chainId: number, token: TokenConfig): string {
  if (token.explorerUrl) return token.explorerUrl;
  const chain = getChainConfig(chainId);
  const base = chain?.blockExplorers.default.url ?? 'https://etherscan.io';
  if (token.contractAddress) {
    return `${base}/token/${getAddress(token.contractAddress)}`;
  }
  return base;
}

export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' },
        ],
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' },
        ],
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

/** Multicall3 deployed at same address on most EVM chains */
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;
