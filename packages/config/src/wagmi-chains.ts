/** Core EVM chains registered in wagmi/RainbowKit — keeps MetaMask connect/switch fast. */
export const WAGMI_CONNECT_CHAIN_IDS = [
  1, // Ethereum
  8453, // Base
  137, // Polygon
  42161, // Arbitrum
  10, // Optimism
  56, // BNB
  43114, // Avalanche
  5000, // Mantle
] as const;

export function isWagmiConnectChain(chainId: number): boolean {
  return (WAGMI_CONNECT_CHAIN_IDS as readonly number[]).includes(chainId);
}
