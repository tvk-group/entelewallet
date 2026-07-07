import type { ChainDefinition, ChainVerification } from './types';

const VERIFICATION_KEYS: (keyof ChainVerification)[] = [
  'rpcVerified',
  'explorerVerified',
  'signingTested',
  'balanceDetectionTested',
  'tokenDetectionTested',
];

export function isFullyVerified(verification: ChainVerification): boolean {
  return VERIFICATION_KEYS.every((key) => verification[key] === true);
}

export function canEnableTransactions(chain: ChainDefinition): boolean {
  if (!chain.rpcUrls.length) return false;
  if (!chain.blockExplorerUrls.length) return false;
  if (chain.status === 'planned') return false;
  return isFullyVerified(chain.verification);
}

export function withTransactionGate(chain: ChainDefinition): ChainDefinition {
  return {
    ...chain,
    capabilities: {
      ...chain.capabilities,
      transactions: canEnableTransactions(chain),
    },
  };
}
