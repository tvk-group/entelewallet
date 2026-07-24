import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getAllowedWalletApiOrigins,
  isAllowedSiweHost,
  isPreviewDeploymentHost,
  resolveSiweOrigin,
  validateWalletApiOrigin,
} from './siwe-api-security';
import {
  buildVerificationCookieHeader,
  canReadVerificationStatus,
  createVerificationCookieValue,
  parseVerificationCookieValue,
} from './verification-session';

describe('SIWE API security', () => {
  it('allows canonical and alias origins', () => {
    const origins = getAllowedWalletApiOrigins();
    expect(origins.has('https://entelewallet.app')).toBe(true);
    expect(origins.has('https://app.entelewallet.com')).toBe(true);
  });

  it('validates wallet API origin header', () => {
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

    const request = new NextRequest('https://entelewallet.app/api/wallet/nonce', {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
    });
    expect(validateWalletApiOrigin(request)).toBe(false);

    vi.unstubAllEnvs();
  });

  it('allows preview deployment hosts for SIWE', () => {
    expect(isPreviewDeploymentHost('entelewallet-app-git-main-tvk.vercel.app')).toBe(true);
    expect(isAllowedSiweHost('entelewallet-app-git-main-tvk.vercel.app')).toBe(true);
  });

  it('resolves SIWE origin for canonical domain', () => {
    const origin = resolveSiweOrigin('entelewallet.app', 'https');
    expect(origin.domain).toBe('entelewallet.app');
    expect(origin.uri).toBe('https://entelewallet.app');
  });

  it('protects verification status reads', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const other = '0x0000000000000000000000000000000000000001';
    const cookie = createVerificationCookieValue({
      address,
      chainId: 1,
      verifiedAt: new Date().toISOString(),
    });
    const payload = parseVerificationCookieValue(cookie);

    expect(canReadVerificationStatus(address, payload, [])).toBe(true);
    expect(canReadVerificationStatus(other, payload, [])).toBe(false);
    expect(
      canReadVerificationStatus(other, null, ['0x0000000000000000000000000000000000000001']),
    ).toBe(true);
  });

  it('builds secure verification cookie header', () => {
    const header = buildVerificationCookieHeader({
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      verifiedAt: new Date().toISOString(),
    });
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
  });
});
