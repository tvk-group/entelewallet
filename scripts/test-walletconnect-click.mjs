import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '21fef48091f12692cad574a6f7753643';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (err) => errors.push({ type: 'pageerror', message: err.message, stack: err.stack }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ type: 'console', message: msg.text() });
  });

  await page.goto(`${BASE}/connect`, { waitUntil: 'domcontentloaded' });

  // Pre-ack safety to avoid checkbox navigation issues in automation
  await page.evaluate(() => {
    localStorage.setItem('entelewallet-preconnect-ack', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });

  // Click RainbowKit connect button
  const connectBtn = page.locator('[data-testid="rk-connect-button"]').first();
  await connectBtn.waitFor({ state: 'visible', timeout: 15000 });
  await connectBtn.click();

  await page.waitForTimeout(1500);

  // Click WalletConnect in modal
  const wc = page.getByText('WalletConnect', { exact: true }).first();
  if (await wc.isVisible().catch(() => false)) {
    await wc.click();
    await page.waitForTimeout(3000);
  } else {
    errors.push({ type: 'test', message: 'WalletConnect option not visible in modal' });
  }

  const bodyText = await page.locator('body').innerText();
  const crashed = bodyText.includes('Something went wrong') || bodyText.includes('Application error');

  console.log(JSON.stringify({
    base: BASE,
    projectIdSet: Boolean(projectId),
    crashed,
    bodySnippet: bodyText.slice(0, 500),
    errors,
  }, null, 2));

  await browser.close();
  process.exit(crashed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
