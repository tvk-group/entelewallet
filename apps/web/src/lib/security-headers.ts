import {
  CANONICAL_APP_DOMAIN,
  CANONICAL_APP_URL,
  MARKETING_DOMAIN,
  WALLETCONNECT_ALLOWED_ORIGINS,
} from '@entelewallet/config';

/**
 * Documented third-party origins required by EnteleWALLET Lite.
 * CSP is deployed in report-only mode first — see docs/SECURITY_RELEASE_GATES.md.
 */
export const CSP_ORIGIN_INVENTORY = {
  self: ["'self'"],
  walletConnect: [
    'https://explorer-api.walletconnect.com',
    'https://verify.walletconnect.com',
    'https://verify.walletconnect.org',
    'https://relay.walletconnect.com',
    'wss://relay.walletconnect.com',
    'https://pulse.walletconnect.org',
    'wss://relay.walletconnect.org',
    'https://rpc.walletconnect.org',
    'wss://rpc.walletconnect.org',
    'https://api.web3modal.org',
    'https://api.web3modal.com',
  ],
  supabase: ['https://*.supabase.co', 'wss://*.supabase.co'],
  rpc: [
    'https://*.alchemy.com',
    'wss://*.alchemy.com',
    'https://*.infura.io',
    'wss://*.infura.io',
    'https://mainnet.base.org',
    'https://rpc.ankr.com',
    'https://ethereum.publicnode.com',
    'https://fullnode.mainnet.sui.io',
    'https://api.koios.rest',
  ],
  pricing: ['https://api.coingecko.com', 'https://pro-api.coinmarketcap.com'],
  entelekron: ['https://entelekron.io', 'https://entelekron.app'],
  images: ['https://assets.coingecko.com', 'https://s2.coinmarketcap.com', 'data:'],
  fonts: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  analytics: [] as string[],
  appOrigins: WALLETCONNECT_ALLOWED_ORIGINS.filter((origin) => origin.startsWith('https://')),
} as const;

export const CSP_REPORT_PATH = '/api/security/csp-report';

function buildContentSecurityPolicyReportOnly(): string {
  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `script-src 'self' 'unsafe-inline' ${CSP_ORIGIN_INVENTORY.walletConnect.join(' ')}`,
    `style-src 'self' 'unsafe-inline' ${CSP_ORIGIN_INVENTORY.fonts[0]}`,
    `font-src 'self' ${CSP_ORIGIN_INVENTORY.fonts[1]} data:`,
    `img-src 'self' ${CSP_ORIGIN_INVENTORY.images.join(' ')} blob:`,
    `connect-src 'self' ${[
      ...CSP_ORIGIN_INVENTORY.walletConnect,
      ...CSP_ORIGIN_INVENTORY.supabase,
      ...CSP_ORIGIN_INVENTORY.rpc,
      ...CSP_ORIGIN_INVENTORY.pricing,
      ...CSP_ORIGIN_INVENTORY.entelekron,
      ...CSP_ORIGIN_INVENTORY.appOrigins,
    ].join(' ')}`,
    `frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `report-uri ${CSP_REPORT_PATH}`,
  ];

  return directives.join('; ');
}

export function getSecurityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
    'X-Frame-Options': 'DENY',
    // WalletConnect verify popups require same-origin-allow-popups.
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Content-Security-Policy-Report-Only': buildContentSecurityPolicyReportOnly(),
  };

  if (isProduction) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

export function applySecurityHeaders(response: Response, isProduction: boolean): Response {
  const headers = getSecurityHeaders(isProduction);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const CANONICAL_SECURITY_DOMAINS = {
  app: CANONICAL_APP_DOMAIN,
  appUrl: CANONICAL_APP_URL,
  marketing: MARKETING_DOMAIN,
} as const;
