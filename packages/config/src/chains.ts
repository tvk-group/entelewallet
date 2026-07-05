import type { ChainConfig } from '@entelewallet/types';

const isDev = process.env.NODE_ENV === 'development';

const BASE_CHAINS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com'],
    blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } },
  },
  8453: {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'],
    blockExplorers: { default: { name: 'Basescan', url: 'https://basescan.org' } },
  },
};

const SEPOLIA_CHAIN: ChainConfig = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
  testnet: true,
};

export const SUPPORTED_CHAIN_IDS: number[] = isDev ? [1, 8453, 11155111] : [1, 8453];

export const CHAINS: Record<number, ChainConfig> = isDev
  ? { ...BASE_CHAINS, 11155111: SEPOLIA_CHAIN }
  : BASE_CHAINS;

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAINS[chainId];
}

export function isSupportedChain(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}

export function getDefaultChainId(): number {
  return 1;
}
