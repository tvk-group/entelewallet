import type { TransparencyAddress } from '@entelewallet/types';

export { CONTACT, CONTACT_EMAIL, SUPPORT_EMAIL, SECURITY_EMAIL, LEGAL_EMAIL, PRIVACY_EMAIL, PARTNERS_EMAIL, PRESS_EMAIL, PUBLIC_CONTACT_EMAILS } from './contact';

/** Primary PWA app domain — entelewallet.app */
export const CANONICAL_APP_DOMAIN = 'entelewallet.app';
export const CANONICAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://entelewallet.app';

/** Alias redirect domain */
export const APP_ALIAS_DOMAIN = 'app.entelewallet.com';
export const APP_ALIAS_URL =
  process.env.NEXT_PUBLIC_APP_ALIAS_URL || 'https://app.entelewallet.com';

/** Official domains for security center */
export const OFFICIAL_DOMAINS = [
  'entelewallet.app',
  'entelewallet.com',
  'entelekron.io',
  'tvk.group',
] as const;

/** Redirect-only domains */
export const REDIRECT_DOMAINS = [
  'app.entelewallet.com',
  'wallet.entelekron.io',
  'entelewallet.org',
] as const;

export const DOMAIN_CONFIG = {
  app: CANONICAL_APP_URL,
  appAlias: APP_ALIAS_URL,
  marketing: process.env.NEXT_PUBLIC_MARKETING_URL || 'https://entelewallet.com',
  security: process.env.NEXT_PUBLIC_SECURITY_URL || 'https://entelewallet.org',
  entelekron: process.env.NEXT_PUBLIC_ENTELEKRON_URL || 'https://entelekron.io',
  transparency: 'https://entelekron.io/transparency',
  investorApp: 'https://entelekron.app',
} as const;

/** @deprecated Use officialAddresses.ts — kept for backward compat */
export const TRANSPARENCY_ADDRESSES: TransparencyAddress[] = [];

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
  install: '/install',
  ecosystem: '/ecosystem',
  officialDomains: '/official-domains',
  privacy: '/privacy',
  terms: '/terms',
  risk: '/risk',
  disclaimer: '/disclaimer',
} as const;

export const NAV_ROUTES = [
  { href: ROUTES.overview, key: 'nav.overview' },
  { href: ROUTES.assets, key: 'nav.assets' },
  { href: ROUTES.vesting, key: 'nav.vesting' },
  { href: ROUTES.claims, key: 'nav.claims' },
  { href: ROUTES.transparency, key: 'nav.transparency' },
  { href: ROUTES.security, key: 'nav.security' },
  { href: ROUTES.support, key: 'nav.support' },
  { href: ROUTES.install, key: 'nav.install' },
] as const;

export const SEO_DEFAULT = {
  title: 'EnteleWALLET | Secure Wallet Dashboard for the EnteleKRON Ecosystem',
  description:
    'Connect, verify and monitor your EnteleKRON ecosystem wallet with EnteleWALLET Lite at entelewallet.app.',
  ogImage: '/og/entelewallet-lite-og.png',
} as const;
