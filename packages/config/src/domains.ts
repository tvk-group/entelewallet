import type { TransparencyAddress } from '@entelewallet/types';

export { CONTACT, CONTACT_EMAIL, SUPPORT_EMAIL, SECURITY_EMAIL, LEGAL_EMAIL, PRIVACY_EMAIL, PARTNERS_EMAIL, PRESS_EMAIL, PUBLIC_CONTACT_EMAILS } from './contact';

/** Primary PWA app domain — entelewallet.app */
export const CANONICAL_APP_DOMAIN = 'entelewallet.app';
export const CANONICAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://entelewallet.app';

/** Marketing / public website (separate repo: entelewallet-site) */
export const CANONICAL_WEBSITE_DOMAIN = 'entelewallet.com';
export const CANONICAL_WEBSITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL || 'https://entelewallet.com';

/** Alias redirect domains → canonical app */
export const APP_ALIAS_DOMAIN = 'app.entelewallet.com';
export const APP_ALIAS_URL =
  process.env.NEXT_PUBLIC_APP_ALIAS_URL || 'https://app.entelewallet.com';

/** Hostnames that 308-redirect to CANONICAL_APP_DOMAIN */
export const APP_ALIAS_HOSTS = [
  'www.entelewallet.app',
  'app.entelewallet.com',
  'www.app.entelewallet.com',
] as const;

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
  marketing: CANONICAL_WEBSITE_URL,
  security: process.env.NEXT_PUBLIC_SECURITY_URL || 'https://entelewallet.org',
  entelekron: process.env.NEXT_PUBLIC_ENTELEKRON_URL || 'https://entelekron.io',
  /** Official transparency center — served by EnteleWALLET Lite (entelekron.io/transparency is not deployed). */
  transparency: `${CANONICAL_APP_URL.replace(/\/$/, '')}/transparency`,
  investorApp: 'https://entelekron.app',
  /** Investor portal sign-in and wallet linking (EnteleKRON PWA dashboard). */
  investorAppDashboard: 'https://entelekron.app/dashboard',
} as const;

/** @deprecated Use officialAddresses.ts — kept for backward compat */
export const TRANSPARENCY_ADDRESSES: TransparencyAddress[] = [];

/** In-app routes (served by entelewallet-app) */
export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  authCallback: '/auth/callback',
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
  install: '/install',
  officialDomains: '/official-domains',
} as const;

/**
 * Marketing routes on entelewallet.com (separate repo).
 * Keys match path segments; values are website-relative paths.
 */
export const WEBSITE_ROUTES = {
  home: '/',
  roadmap: '/roadmap',
  ecosystem: '/ecosystem',
  legal: '/legal',
  privacy: '/privacy',
  terms: '/terms',
  risk: '/risk',
  disclaimer: '/disclaimer',
} as const;

/** App paths that redirect to entelewallet.com (marketing split) */
export const MARKETING_REDIRECT_PATHS = [
  '/roadmap',
  '/ecosystem',
  '/legal',
  '/privacy',
  '/terms',
  '/risk',
  '/disclaimer',
] as const;

/** Build a full URL on the marketing website (entelewallet.com). */
export function websiteUrl(path: keyof typeof WEBSITE_ROUTES | `/${string}`): string {
  const base = CANONICAL_WEBSITE_URL.replace(/\/$/, '');
  if (typeof path === 'string' && path.startsWith('/')) {
    return `${base}${path}`;
  }
  const segment = WEBSITE_ROUTES[path as keyof typeof WEBSITE_ROUTES];
  return segment === '/' ? base : `${base}${segment}`;
}

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
  tagline: 'SECURE • INTELLIGENT • CONNECTED',
} as const;

/** Origins that must be allowlisted in the WalletConnect / Reown Cloud dashboard. */
export const WALLETCONNECT_ALLOWED_ORIGINS = [
  'https://entelewallet.app',
  'https://app.entelewallet.com',
  'https://wallet.entelekron.io',
  'http://localhost:3000',
  'http://localhost:3001',
] as const;
