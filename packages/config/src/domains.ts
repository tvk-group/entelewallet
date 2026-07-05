import type { TransparencyAddress } from '@entelewallet/types';

/** Canonical app domain — all other app domains redirect here. */
export const CANONICAL_APP_DOMAIN = 'app.entelewallet.com';
export const CANONICAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.entelewallet.com';

/** Official domains — short list for phishing protection. */
export const OFFICIAL_DOMAINS = [
  'app.entelewallet.com',
  'entelewallet.com',
  'entelekron.io',
  'tvk.group',
] as const;

/** Redirect-only domains (not separately hosted). */
export const REDIRECT_DOMAINS = ['entelewallet.app', 'wallet.entelekron.io'] as const;

export const DOMAIN_CONFIG = {
  app: CANONICAL_APP_URL,
  marketing: process.env.NEXT_PUBLIC_MARKETING_URL || 'https://entelewallet.com',
  security: process.env.NEXT_PUBLIC_SECURITY_URL || 'https://entelewallet.org',
  entelekron: process.env.NEXT_PUBLIC_ENTELEKRON_URL || 'https://entelekron.io',
  transparency: 'https://entelekron.io/transparency',
  investorApp: 'https://entelekron.io/investor',
} as const;

export const CONTACT = {
  security: process.env.SECURITY_CONTACT_EMAIL || 'security@tvk.group',
  support: process.env.SUPPORT_EMAIL || 'support@tvk.group',
} as const;

/**
 * Transparency addresses — must match main EnteleKRON platform config.
 * Do not invent addresses.
 */
export const TRANSPARENCY_ADDRESSES: TransparencyAddress[] = [
  { key: 'enk_contract', label: 'ENK Contract', pendingOfficialVerification: true },
  { key: 'treasury_safe', label: 'Treasury Safe', pendingOfficialVerification: true },
  { key: 'presale_safe', label: 'Presale Safe', pendingOfficialVerification: true },
  { key: 'liquidity_safe', label: 'Liquidity Safe', pendingOfficialVerification: true },
  { key: 'vesting_safe', label: 'Vesting Safe', pendingOfficialVerification: true },
  { key: 'ecosystem_reserve_safe', label: 'Ecosystem Reserve Safe', pendingOfficialVerification: true },
  { key: 'governance_safe', label: 'Governance Safe', pendingOfficialVerification: true },
];

export const ROUTES = {
  home: '/',
  connect: '/connect',
  overview: '/overview',
  assets: '/assets',
  transactions: '/transactions',
  vesting: '/vesting',
  claims: '/claims',
  security: '/security',
  transparency: '/transparency',
  settings: '/settings',
  account: '/account',
  support: '/support',
  roadmap: '/roadmap',
  legal: '/legal',
} as const;

export const NAV_ROUTES = [
  { href: ROUTES.overview, key: 'nav.overview' },
  { href: ROUTES.assets, key: 'nav.assets' },
  { href: ROUTES.transactions, key: 'nav.transactions' },
  { href: ROUTES.vesting, key: 'nav.vesting' },
  { href: ROUTES.claims, key: 'nav.claims' },
  { href: ROUTES.transparency, key: 'nav.transparency' },
  { href: ROUTES.security, key: 'nav.security' },
  { href: ROUTES.settings, key: 'nav.settings' },
  { href: ROUTES.account, key: 'nav.account' },
  { href: ROUTES.support, key: 'nav.support' },
  { href: ROUTES.roadmap, key: 'nav.roadmap' },
  { href: ROUTES.legal, key: 'nav.legal' },
] as const;

export const SEO_DEFAULT = {
  title: 'EnteleWALLET Lite | Secure Wallet Dashboard for the EnteleKRON Ecosystem',
  description:
    'Connect, verify and monitor your EnteleKRON ecosystem wallet with EnteleWALLET Lite.',
  ogImage: '/og/entelewallet-lite-og.png',
} as const;
