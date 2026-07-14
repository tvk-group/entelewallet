import { NextRequest, NextResponse } from 'next/server';
import { BRAND_ASSETS, CANONICAL_APP_DOMAIN, isMarketingHost } from '@entelewallet/config';

function buildManifest(origin: string, isCom: boolean) {
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
    background_color: isCom ? '#ecfdf5' : '#ffffff',
    theme_color: isCom ? '#0f766e' : '#1e40af',
    orientation: 'portrait-primary',
    icons: [
      {
        src: isCom ? BRAND_ASSETS.pwaComIcon192 : BRAND_ASSETS.pwaAppIcon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: isCom ? BRAND_ASSETS.pwaComIcon512 : BRAND_ASSETS.pwaAppIcon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: isCom ? BRAND_ASSETS.pwaComIcon192 : BRAND_ASSETS.pwaAppIcon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: isCom ? BRAND_ASSETS.pwaComIcon512 : BRAND_ASSETS.pwaAppIcon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

export function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? CANONICAL_APP_DOMAIN;
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;
  const isCom = isMarketingHost(host);
  const manifest = buildManifest(origin, isCom);

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  });
}
