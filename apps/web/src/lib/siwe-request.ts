import {
  CANONICAL_APP_DOMAIN,
  CANONICAL_APP_URL,
  OFFICIAL_DOMAINS,
  REDIRECT_DOMAINS,
} from '@entelewallet/config';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function normalizeHost(host: string | null | undefined): string {
  return (host ?? CANONICAL_APP_DOMAIN).toLowerCase().split(':')[0] ?? CANONICAL_APP_DOMAIN;
}

/** Hosts allowed in SIWE domain field (must match the browser origin). */
export function isAllowedSiweHost(host: string): boolean {
  const normalized = normalizeHost(host);
  if (LOCAL_HOSTS.has(normalized)) return true;
  if (normalized.endsWith('.vercel.app')) return true;
  if ((OFFICIAL_DOMAINS as readonly string[]).includes(normalized)) return true;
  if ((REDIRECT_DOMAINS as readonly string[]).includes(normalized)) return true;
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

  const scheme =
    proto?.split(',')[0]?.trim() ||
    (LOCAL_HOSTS.has(normalized) ? 'http' : 'https');

  const port =
    host?.includes(':') && LOCAL_HOSTS.has(normalized)
      ? `:${host.split(':')[1]}`
      : '';

  const domain =
    normalized === 'www.entelewallet.com' ? 'entelewallet.com' : normalized;

  return {
    domain,
    uri: `${scheme}://${normalized}${port}`,
  };
}
