import { NextRequest, NextResponse } from 'next/server';
import { CANONICAL_APP_DOMAIN } from '@entelewallet/config';

type PwaVariant = 'app' | 'com';

function resolveVariant(host: string): PwaVariant {
  const normalized = host.toLowerCase().split(':')[0] ?? '';
  if (
    normalized === 'entelewallet.com' ||
    normalized === 'www.entelewallet.com' ||
    normalized.endsWith('.entelewallet.com')
  ) {
    return 'com';
  }
  return 'app';
}

function buildManifest(origin: string, variant: PwaVariant) {
  const isCom = variant === 'com';

  return {
    name: isCom ? 'EnteleWALLET.com' : 'EnteleWALLET',
    short_name: isCom ? 'EW.com' : 'EnteleWALLET',
    description: isCom
      ? 'EnteleWALLET marketing site — secure wallet dashboard for the EnteleKRON ecosystem.'
      : 'Secure wallet-connected dashboard for the EnteleKRON ecosystem — SECURE • INTELLIGENT • CONNECTED',
    start_url: `${origin}/`,
    scope: `${origin}/`,
    id: `${origin}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: isCom ? '#0f766e' : '#1e40af',
    orientation: 'portrait-primary',
    icons: [
      {
        src: isCom ? '/icons/pwa-com-192.png' : '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: isCom ? '/icons/pwa-com-512.png' : '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}

export function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? CANONICAL_APP_DOMAIN;
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;
  const variant = resolveVariant(host);
  const manifest = buildManifest(origin, variant);

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
