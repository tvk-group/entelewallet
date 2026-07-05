export const LITE_WARNING =
  'EnteleWALLET Lite connects to your existing wallet. It does not store seed phrases, private keys or custody funds.';

export const SIGNATURE_WARNING =
  'Wallet verification signatures only prove wallet ownership. They do not authorize transfers, spending approvals, payments or blockchain transactions.';

export const MALICIOUS_SIGNATURE_WARNING =
  'A signature request that asks you to approve spending, or that does not clearly say this does not authorize a transaction, is not an EnteleWALLET verification request — do not sign it.';

export const DOMAIN_WARNING = 'Always verify official domains before connecting a wallet.';

export const SEED_PHRASE_WARNING =
  'EnteleWALLET, EnteleKRON, TVK Group, TVK Labs, SOVRA, support staff, partners and moderators will never ask for seed phrases, private keys or recovery phrases.';

export const SIWE_STATEMENT =
  'Sign in to EnteleWALLET. This signature verifies wallet ownership only. It does not authorize a transaction, token transfer, spending approval or payment.';

import { SECURITY_EMAIL } from '@entelewallet/config';

export const PHISHING_TIPS = [
  'Verify the URL matches an official domain before connecting.',
  'Never share your seed phrase or private key with anyone.',
  'EnteleWALLET verification signatures do not cost gas.',
  'Reject any signature that looks like a token approval or transfer.',
  'Use WalletConnect only through the official EnteleWALLET app.',
  `Report suspicious domains to ${SECURITY_EMAIL}.`,
] as const;

export const SUPPORTED_WALLETS = [
  'MetaMask',
  'Rabby',
  'WalletConnect',
  'Coinbase Wallet',
  'Trust Wallet',
  'Rainbow',
  'OKX Wallet',
  'Ledger (via WalletConnect / MetaMask / Rabby)',
] as const;

export { OFFICIAL_DOMAINS, REDIRECT_DOMAINS } from '@entelewallet/config';
