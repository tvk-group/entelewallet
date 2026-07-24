import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  consumeWalletNonce,
  resetMemoryNonceStoreForTests,
  storeWalletNonce,
  NonceStorageUnavailableError,
} from './wallet-nonce-server';

const TEST_WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('wallet nonce storage (memory fallback in test)', () => {
  beforeEach(() => {
    resetMemoryNonceStoreForTests();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.VERCEL_ENV;
  });

  it('stores and consumes a nonce once', async () => {
    const expiresAt = new Date(Date.now() + 8 * 60 * 1000);
    const message = 'test siwe message';

    await storeWalletNonce({
      walletAddress: TEST_WALLET,
      chainId: 1,
      nonce: 'abc123',
      message,
      domain: 'entelewallet.app',
      uri: 'https://entelewallet.app',
      expiresAt,
    });

    const consumed = await consumeWalletNonce(TEST_WALLET, 'abc123');
    expect(consumed?.message).toBe(message);
    expect(consumed?.domain).toBe('entelewallet.app');
  });

  it('prevents nonce replay', async () => {
    const expiresAt = new Date(Date.now() + 8 * 60 * 1000);
    await storeWalletNonce({
      walletAddress: TEST_WALLET,
      chainId: 1,
      nonce: 'replay-me',
      message: 'message',
      domain: 'entelewallet.app',
      uri: 'https://entelewallet.app',
      expiresAt,
    });

    const first = await consumeWalletNonce(TEST_WALLET, 'replay-me');
    const second = await consumeWalletNonce(TEST_WALLET, 'replay-me');

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });

  it('rejects expired nonces', async () => {
    await storeWalletNonce({
      walletAddress: TEST_WALLET,
      chainId: 1,
      nonce: 'expired',
      message: 'message',
      domain: 'entelewallet.app',
      uri: 'https://entelewallet.app',
      expiresAt: new Date(Date.now() - 1_000),
    });

    const consumed = await consumeWalletNonce(TEST_WALLET, 'expired');
    expect(consumed).toBeNull();
  });

  it('fails closed in production without Supabase', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(
      storeWalletNonce({
        walletAddress: TEST_WALLET,
        chainId: 1,
        nonce: 'prod-fail',
        message: 'message',
        domain: 'entelewallet.app',
        uri: 'https://entelewallet.app',
        expiresAt: new Date(Date.now() + 60_000),
      }),
    ).rejects.toBeInstanceOf(NonceStorageUnavailableError);

    vi.unstubAllEnvs();
  });
});
