import { NextRequest } from 'next/server';
import {
  CANONICAL_APP_DOMAIN,
  CANONICAL_APP_URL,
  MARKETING_DOMAIN,
  OFFICIAL_DOMAINS,
  REDIRECT_DOMAINS,
  WALLETCONNECT_ALLOWED_ORIGINS,
} from '@entelewallet/config';
import { allowMemoryNonceStore, isProductionRuntime } from '@entelewallet/config';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const MAX_WALLET_API_BODY_BYTES = 16_384;

export const SAFE_WALLET_API_ERROR = 'Request could not be processed';
export const SAFE_NONCE_UNAVAILABLE_ERROR =
  'Verification is temporarily unavailable. Please try again later.';
export const SAFE_RATE_LIMIT_UNAVAILABLE_ERROR =
  'Service is temporarily unavailable. Please try again later.';

function normalizeHost(host: string | null | undefined): string {
  return (host ?? CANONICAL_APP_DOMAIN).toLowerCase().split(':')[0] ?? CANONICAL_APP_DOMAIN;
}

function hostToOrigin(host: string, proto = 'https'): string {
  const normalized = normalizeHost(host);
  const scheme = LOCAL_HOSTS.has(normalized) ? 'http' : proto;
  const port = host?.includes(':') && LOCAL_HOSTS.has(normalized) ? `:${host.split(':')[1]}` : '';
  return `${scheme}://${normalized}${port}`;
}

/** Official production origins — explicit allowlist only. */
export function getProductionWalletApiOrigins(): Set<string> {
  const origins = new Set<string>();

  origins.add(CANONICAL_APP_URL.replace(/\/$/, ''));
  origins.add(`https://${CANONICAL_APP_DOMAIN}`);
  origins.add(`https://${MARKETING_DOMAIN}`);
  origins.add(`https://www.${MARKETING_DOMAIN}`);

  for (const domain of OFFICIAL_DOMAINS) {
    origins.add(`https://${domain}`);
    origins.add(`https://www.${domain}`);
  }

  for (const domain of REDIRECT_DOMAINS) {
    origins.add(`https://${domain}`);
  }

  for (const origin of WALLETCONNECT_ALLOWED_ORIGINS) {
    if (origin.startsWith('https://') && !origin.includes('localhost')) {
      origins.add(origin);
    }
  }

  return origins;
}

/** Preview deployment origins — exact Vercel URLs plus explicit allowlist only. */
export function getPreviewWalletApiOrigins(): Set<string> {
  const origins = new Set<string>();

  const vercelUrl = process.env.VERCEL_URL?.trim();
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL?.trim();

  if (vercelUrl) origins.add(`https://${vercelUrl}`);
  if (vercelBranchUrl) origins.add(`https://${vercelBranchUrl}`);

  const allowlist = process.env.PREVIEW_ORIGIN_ALLOWLIST?.split(',') ?? [];
  for (const entry of allowlist) {
    const trimmed = entry.trim();
    if (trimmed) origins.add(trimmed);
  }

  return origins;
}

export function getDevWalletApiOrigins(): Set<string> {
  return new Set(['http://localhost:3000', 'http://localhost:3001']);
}

export function isPreviewRuntime(): boolean {
  return process.env.VERCEL_ENV === 'preview';
}

export function getAllowedWalletApiOrigins(): Set<string> {
  if (allowMemoryNonceStore() && !isProductionRuntime()) {
    return new Set([...getProductionWalletApiOrigins(), ...getDevWalletApiOrigins()]);
  }

  if (isPreviewRuntime()) {
    return getPreviewWalletApiOrigins();
  }

  return getProductionWalletApiOrigins();
}

/** Hosts allowed in SIWE domain field (must match the browser origin). */
export function isAllowedSiweHost(host: string): boolean {
  const normalized = normalizeHost(host);
  if (LOCAL_HOSTS.has(normalized)) return true;

  if (isPreviewRuntime()) {
    const previewHosts = new Set(
      [...getPreviewWalletApiOrigins()].map((origin) => {
        try {
          return new URL(origin).hostname;
        } catch {
          return '';
        }
      }),
    );
    return previewHosts.has(normalized);
  }

  if ((OFFICIAL_DOMAINS as readonly string[]).includes(normalized)) return true;
  if ((REDIRECT_DOMAINS as readonly string[]).includes(normalized)) return true;
  if (normalized === CANONICAL_APP_DOMAIN) return true;
  if (normalized === MARKETING_DOMAIN || normalized === `www.${MARKETING_DOMAIN}`) return true;
  if (normalized === 'www.entelewallet.com') return true;
  return false;
}

/** Resolve SIWE domain + URI from the incoming request host. */
export function resolveSiweOrigin(
  host: string | null | undefined,
  proto: string | null | undefined,
): { domain: string; uri: string } {
  const normalized = normalizeHost(host);

  if (!isAllowedSiweHost(host ?? '')) {
    return { domain: CANONICAL_APP_DOMAIN, uri: CANONICAL_APP_URL };
  }

  const scheme = proto?.split(',')[0]?.trim() || (LOCAL_HOSTS.has(normalized) ? 'http' : 'https');

  const port = host?.includes(':') && LOCAL_HOSTS.has(normalized) ? `:${host.split(':')[1]}` : '';

  const domain = normalized === 'www.entelewallet.com' ? MARKETING_DOMAIN : normalized;

  return {
    domain,
    uri: `${scheme}://${normalized}${port}`,
  };
}

export function isOriginAllowed(origin: string): boolean {
  const allowed = getAllowedWalletApiOrigins();
  return allowed.has(origin);
}

export function validateWalletApiOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (origin) {
    return isOriginAllowed(origin);
  }

  if (referer) {
    try {
      return isOriginAllowed(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  if (allowMemoryNonceStore() && host) {
    const requestOrigin = hostToOrigin(host, request.headers.get('x-forwarded-proto') ?? 'https');
    return isOriginAllowed(requestOrigin);
  }

  return false;
}

export async function readWalletApiBody(request: NextRequest): Promise<string | null> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_WALLET_API_BODY_BYTES) {
    return null;
  }

  const raw = await request.text();
  if (raw.length > MAX_WALLET_API_BODY_BYTES) {
    return null;
  }
  return raw;
}

export function getClientIp(request: Pick<NextRequest, 'headers'>): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
