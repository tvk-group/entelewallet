import { test, expect } from '@playwright/test';

test.describe('EnteleWALLET smoke tests', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EnteleWALLET/i);
  });

  test('connect page loads', async ({ page }) => {
    await page.goto('/connect');
    await expect(page.locator('body')).toBeVisible();
  });

  test('overview page loads', async ({ page }) => {
    await page.goto('/overview');
    await expect(page.locator('body')).toBeVisible();
  });

  test('assets page loads', async ({ page }) => {
    await page.goto('/assets');
    await expect(page.locator('body')).toBeVisible();
  });

  test('security page loads', async ({ page }) => {
    await page.goto('/security');
    await expect(page.locator('body')).toBeVisible();
  });

  test('SIWE verify endpoint rejects missing body', async ({ request }) => {
    const response = await request.post('/api/wallet/verify', {
      headers: { origin: 'http://localhost:3000' },
      data: {},
    });
    expect([400, 403, 413]).toContain(response.status());
  });

  test('SIWE nonce endpoint rejects disallowed origin in production-like request', async ({
    request,
  }) => {
    const response = await request.post('/api/wallet/nonce', {
      headers: { origin: 'https://evil.example' },
      data: {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        chainId: 1,
      },
    });
    expect([400, 403]).toContain(response.status());
  });

  test('verification status is not public for arbitrary wallets', async ({ request }) => {
    const response = await request.get(
      '/api/wallet/verify?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    );
    expect(response.status()).toBe(403);
  });

  test('language selector is present on home', async ({ page }) => {
    await page.goto('/');
    const languageControl = page
      .locator('select, [data-testid="language-selector"], button')
      .first();
    await expect(languageControl).toBeVisible();
  });
});

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('home renders on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
