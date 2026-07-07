export type WalletVerificationStatus =
  | 'disconnected'
  | 'connected_unverified'
  | 'signature_pending'
  | 'verified'
  | 'verification_failed'
  | 'wrong_network'
  | 'unsupported_network'
  | 'linked_to_account'
  | 'linked_to_other_account'
  | 'revoked';

export type AccountState =
  | 'guest'
  | 'connected_wallet'
  | 'verified_wallet'
  | 'account_created'
  | 'account_linked'
  | 'investor_linked'
  | 'partner_linked'
  | 'admin_role';

export type WalletAuthEventType =
  | 'connect'
  | 'disconnect'
  | 'nonce_created'
  | 'verification_started'
  | 'verification_success'
  | 'verification_failed'
  | 'wallet_linked'
  | 'wallet_unlinked'
  | 'primary_changed';

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  chainId: number;
  contractAddress?: string;
  explorerUrl?: string;
  logo?: string;
  /** CoinGecko API id for USD price quotes (optional). */
  coingeckoId?: string;
  /**
   * Fiat display policy. `none` = show token amount only (no listing/sale price quotes).
   * Use for unlisted ecosystem tokens such as ENK.
   */
  fiatQuotePolicy?: 'market' | 'none';
  enabled: boolean;
  pendingOfficialConfiguration?: boolean;
  isNative?: boolean;
  /** Network view IDs (from chain registry) where this token appears. */
  networkViews?: string[];
}

export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: {
    default: { name: string; url: string };
  };
  testnet?: boolean;
}

export interface TransparencyAddress {
  key: string;
  label: string;
  address?: string;
  explorerUrl?: string;
  pendingOfficialVerification?: boolean;
}

export interface WalletConnectionRecord {
  id: string;
  userId?: string;
  walletAddress: string;
  chainId: number;
  walletType?: string;
  isPrimary: boolean;
  verificationStatus: WalletVerificationStatus;
  verifiedAt?: string;
  linkedAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}
