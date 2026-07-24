import { describe, expect, it } from 'vitest';
import { SiweMessage } from 'siwe';
import {
  createSiweMessage,
  generateNonce,
  getSiweMessageString,
  validateExactStoredMessage,
  validateSiweExpectations,
  verifySiweMessage,
} from './index';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const TEST_CHAIN_ID = 1;

function buildMessage(overrides: Partial<Parameters<typeof createSiweMessage>[0]> = {}) {
  const nonce = overrides.nonce ?? generateNonce();
  const expirationTime = overrides.expirationTime ?? new Date(Date.now() + 8 * 60 * 1000);
  const siwe = createSiweMessage({
    address: TEST_ADDRESS,
    chainId: TEST_CHAIN_ID,
    nonce,
    domain: 'entelewallet.app',
    uri: 'https://entelewallet.app',
    statement: 'Sign in to EnteleWALLET',
    expirationTime,
    ...overrides,
  });
  return { message: getSiweMessageString(siwe), nonce, expirationTime };
}

describe('SIWE validation', () => {
  it('requires exact message match with server-stored payload', () => {
    const { message } = buildMessage();
    expect(validateExactStoredMessage(message, message).success).toBe(true);
    expect(validateExactStoredMessage(message, `${message} `).success).toBe(false);
  });

  it('rejects domain mismatch', () => {
    const { message, nonce } = buildMessage();
    const result = validateSiweExpectations(message, {
      domain: 'evil.example',
      uri: 'https://entelewallet.app',
      nonce,
      chainId: TEST_CHAIN_ID,
      address: TEST_ADDRESS,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Domain mismatch');
  });

  it('rejects URI mismatch', () => {
    const { message, nonce } = buildMessage();
    const result = validateSiweExpectations(message, {
      domain: 'entelewallet.app',
      uri: 'https://evil.example',
      nonce,
      chainId: TEST_CHAIN_ID,
      address: TEST_ADDRESS,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('URI mismatch');
  });

  it('rejects address mismatch', () => {
    const { message, nonce } = buildMessage();
    const result = validateSiweExpectations(message, {
      domain: 'entelewallet.app',
      uri: 'https://entelewallet.app',
      nonce,
      chainId: TEST_CHAIN_ID,
      address: '0x0000000000000000000000000000000000000001',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Address mismatch');
  });

  it('rejects chain mismatch', () => {
    const { message, nonce } = buildMessage();
    const result = validateSiweExpectations(message, {
      domain: 'entelewallet.app',
      uri: 'https://entelewallet.app',
      nonce,
      chainId: 56,
      address: TEST_ADDRESS,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Chain ID mismatch');
  });

  it('rejects expired nonce messages', () => {
    const { message, nonce } = buildMessage({
      expirationTime: new Date(Date.now() - 60_000),
    });
    const result = validateSiweExpectations(message, {
      domain: 'entelewallet.app',
      uri: 'https://entelewallet.app',
      nonce,
      chainId: TEST_CHAIN_ID,
      address: TEST_ADDRESS,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Message expired');
  });

  it('rejects invalid signatures', async () => {
    const { message, nonce } = buildMessage();
    const result = await verifySiweMessage(
      message,
      '0x' + '11'.repeat(65),
      'entelewallet.app',
      nonce,
    );
    expect(result.success).toBe(false);
  });

  it('generates unique nonces', () => {
    const nonces = new Set(Array.from({ length: 20 }, () => generateNonce()));
    expect(nonces.size).toBe(20);
  });

  it('parses SIWE message fields', () => {
    const { message } = buildMessage();
    const parsed = new SiweMessage(message);
    expect(parsed.domain).toBe('entelewallet.app');
    expect(parsed.uri).toBe('https://entelewallet.app');
  });
});
