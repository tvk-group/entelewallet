import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getPreviewWalletApiOrigins,
  getProductionWalletApiOrigins,
  isOriginAllowed,
  resolveSiweOrigin,
  validateWalletApiOrigin,
} from './siwe-api-security';

describe('SIWE API security', () => {
  it('allows canonical production origins only', () => {
    const origins = getProductionWalletApiOrigins();
    expect(origins.has('https://entelewallet.app')).toBe(true);
    expect(origins.has('https://app.entelewallet.com')).toBe(true);
    expect([...origins].some((origin) => origin.includes('vercel.app'))).toBe(false);
  });

  it('allows only explicit preview origins', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_URL', 'entelewallet-app-git-fix-abc.vercel.app');
    vi.stubEnv('PREVIEW_ORIGIN_ALLOWLIST', 'https://preview.entelewallet.dev');

    const origins = getPreviewWalletApiOrigins();
    expect(origins.has('https://entelewallet-app-git-fix-abc.vercel.app')).toBe(true);
    expect(origins.has('https://preview.entelewallet.dev')).toBe(true);
    expect(origins.has('https://random-other.vercel.app')).toBe(false);

    vi.unstubAllEnvs();
  });

  it('rejects arbitrary vercel.app origins in preview mode', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_URL', 'entelewallet-app-git-fix-abc.vercel.app');

    expect(isOriginAllowed('https://evil-preview.vercel.app')).toBe(false);

    vi.unstubAllEnvs();
  });

  it('validates wallet API origin header in development', () => {
    const request = new NextRequest('http://localhost:3000/api/wallet/nonce', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
      },
    });
    expect(validateWalletApiOrigin(request)).toBe(true);
  });

  it('rejects unknown origins in production mode without referer', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');

    const request = new NextRequest('https://entelewallet.app/api/wallet/nonce', {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
    });
    expect(validateWalletApiOrigin(request)).toBe(false);

    vi.unstubAllEnvs();
  });

  it('resolves SIWE origin for canonical domain', () => {
    const origin = resolveSiweOrigin('entelewallet.app', 'https');
    expect(origin.domain).toBe('entelewallet.app');
    expect(origin.uri).toBe('https://entelewallet.app');
  });

  it('does not include wildcard vercel hosts in production allowlist', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    const allowed = getProductionWalletApiOrigins();
    expect([...allowed].every((origin) => !origin.includes('vercel.app'))).toBe(true);
    vi.unstubAllEnvs();
  });
});
