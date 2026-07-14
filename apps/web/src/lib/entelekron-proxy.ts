import { DOMAIN_CONFIG } from '@entelewallet/config';

const ENTELEKRON_BASE = (DOMAIN_CONFIG.entelekron || 'https://entelekron.io').replace(/\/$/, '');

export function forwardEntelekronHeaders(request: Request): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const auth = request.headers.get('authorization');
  if (auth) headers.Authorization = auth;

  const cookie = request.headers.get('cookie');
  if (cookie) headers.Cookie = cookie;

  return headers;
}

export async function proxyEntelekron(
  path: string,
  request: Request,
  init?: RequestInit,
): Promise<Response> {
  const url = `${ENTELEKRON_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...forwardEntelekronHeaders(request),
      ...(init?.headers ?? {}),
    },
  });
}
