import { test, expect } from '@playwright/test';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

test.describe('EnteleWALLET smoke tests', () => {
  test('home page loads with hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EnteleWALLET/i);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('connect page shows connect heading', async ({ page }) => {
    await page.goto('/connect');
    await expect(page.getByRole('heading', { level: 1, name: /Connect Wallet/i })).toBeVisible();
  });

  test('overview page shows overview heading', async ({ page }) => {
    await page.goto('/overview');
    await expect(page.getByRole('heading', { level: 1, name: /Wallet Overview/i })).toBeVisible();
  });

  test('assets page shows assets heading', async ({ page }) => {
    await page.goto('/assets');
    await expect(page.getByRole('heading', { level: 1, name: /^Assets$/i })).toBeVisible();
  });

  test('security page shows security center heading', async ({ page }) => {
    await page.goto('/security');
    await expect(page.getByRole('heading', { level: 1, name: /Security Center/i })).toBeVisible();
  });

  test('security headers are present', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['cross-origin-opener-policy']).toBe('same-origin-allow-popups');
    expect(headers['content-security-policy-report-only']).toContain('/api/security/csp-report');
  });

  test('canonical redirect for alias host', async ({ request }) => {
    const response = await request.get('/', {
      headers: { Host: 'app.entelewallet.com' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toMatch(/https:\/\/entelewallet\.app\/?/);
  });

  test('language selector opens and changes locale', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('language-selector').click();
    await expect(page.getByRole('heading', { name: /Select Language|Sprache/i })).toBeVisible();
    await page.getByRole('button', { name: /Deutsch/i }).click();
    await expect(page.getByTestId('language-selector')).toContainText('Deutsch');
  });

  test('SIWE verify endpoint rejects missing body', async ({ request }) => {
    const response = await request.post('/api/wallet/verify', {
      headers: { origin: 'http://localhost:3000' },
      data: {},
    });
    expect([400, 403, 413]).toContain(response.status());
  });

  test('SIWE nonce endpoint rejects disallowed origin', async ({ request }) => {
    const response = await request.post('/api/wallet/nonce', {
      headers: { origin: 'https://evil.example' },
      data: {
        address: TEST_ADDRESS,
        chainId: 1,
      },
    });
    expect([400, 403]).toContain(response.status());
  });

  test('verification status is not public for arbitrary wallets', async ({ request }) => {
    const response = await request.get(`/api/wallet/verify?address=${TEST_ADDRESS}`);
    expect(response.status()).toBe(403);
  });

  test('CSP report endpoint accepts valid JSON reports', async ({ request }) => {
    const response = await request.post('/api/security/csp-report', {
      headers: { 'content-type': 'application/csp-report' },
      data: JSON.stringify({
        'csp-report': {
          'document-uri': 'http://localhost:3000/',
          'violated-directive': 'script-src',
          'blocked-uri': 'inline',
        },
      }),
    });
    expect(response.status()).toBe(204);
  });

  test('CSP report endpoint rejects oversized payloads', async ({ request }) => {
    const response = await request.post('/api/security/csp-report', {
      headers: {
        'content-type': 'application/csp-report',
        'content-length': '99999',
      },
      data: 'x'.repeat(100),
    });
    expect([400, 413]).toContain(response.status());
  });

  test('CSP report endpoint rejects invalid content type', async ({ request }) => {
    const response = await request.post('/api/security/csp-report', {
      headers: { 'content-type': 'text/plain' },
      data: 'not-json',
    });
    expect(response.status()).toBe(415);
  });
});

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile bottom navigation works', async ({ page }) => {
    await page.goto('/overview');
    const nav = page.locator('nav.mobile-bottom-nav');
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: /Security/i }).click();
    await expect(page).toHaveURL(/\/security/);
    await expect(page.getByRole('heading', { level: 1, name: /Security Center/i })).toBeVisible();
  });
});
