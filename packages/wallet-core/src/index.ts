import { SiweMessage } from 'siwe';
import type { WalletVerificationStatus } from '@entelewallet/types';

export interface CreateSiweMessageParams {
  address: string;
  chainId: number;
  nonce: string;
  domain: string;
  uri: string;
  statement: string;
  expirationTime?: Date;
}

export function createSiweMessage(params: CreateSiweMessageParams): SiweMessage {
  return new SiweMessage({
    domain: params.domain,
    address: params.address,
    statement: params.statement,
    uri: params.uri,
    version: '1',
    chainId: params.chainId,
    nonce: params.nonce,
    expirationTime: params.expirationTime?.toISOString(),
  });
}

export function getSiweMessageString(message: SiweMessage): string {
  return message.prepareMessage();
}

export interface VerificationResult {
  success: boolean;
  address?: string;
  chainId?: number;
  error?: string;
}

export interface StoredNonceExpectations {
  message: string;
  domain: string;
  nonce: string;
  chainId: number;
  uri?: string;
}

export interface SiweValidationExpectations {
  domain: string;
  uri: string;
  nonce: string;
  chainId: number;
  address: string;
}

/** Client message must exactly match the server-stored SIWE payload. */
export function validateExactStoredMessage(
  receivedMessage: string,
  storedMessage: string,
): VerificationResult {
  if (receivedMessage !== storedMessage) {
    return { success: false, error: 'Message mismatch' };
  }
  return { success: true };
}

/** Parse and validate SIWE fields against server expectations before signature check. */
export function validateSiweExpectations(
  message: string,
  expectations: SiweValidationExpectations,
): VerificationResult {
  try {
    const siweMessage = new SiweMessage(message);

    if (siweMessage.domain !== expectations.domain) {
      return { success: false, error: 'Domain mismatch' };
    }
    if (siweMessage.uri !== expectations.uri) {
      return { success: false, error: 'URI mismatch' };
    }
    if (siweMessage.nonce !== expectations.nonce) {
      return { success: false, error: 'Nonce mismatch' };
    }
    if (siweMessage.chainId !== expectations.chainId) {
      return { success: false, error: 'Chain ID mismatch' };
    }
    if (siweMessage.address.toLowerCase() !== expectations.address.toLowerCase()) {
      return { success: false, error: 'Address mismatch' };
    }

    if (siweMessage.expirationTime) {
      const expiresAt = new Date(siweMessage.expirationTime);
      if (expiresAt.getTime() <= Date.now()) {
        return { success: false, error: 'Message expired' };
      }
    }

    return {
      success: true,
      address: siweMessage.address,
      chainId: siweMessage.chainId,
    };
  } catch {
    return { success: false, error: 'Invalid message format' };
  }
}

export async function verifySiweMessage(
  message: string,
  signature: string,
  expectedDomain: string,
  expectedNonce: string,
): Promise<VerificationResult> {
  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (fields.data.domain !== expectedDomain) {
      return { success: false, error: 'Domain mismatch' };
    }
    if (fields.data.nonce !== expectedNonce) {
      return { success: false, error: 'Nonce mismatch' };
    }

    if (fields.data.expirationTime) {
      const expiresAt = new Date(fields.data.expirationTime);
      if (expiresAt.getTime() <= Date.now()) {
        return { success: false, error: 'Message expired' };
      }
    }

    return {
      success: true,
      address: fields.data.address,
      chainId: fields.data.chainId,
    };
  } catch {
    return {
      success: false,
      error: 'Invalid signature',
    };
  }
}

export function getVerificationBadgeKey(status: WalletVerificationStatus): string {
  const map: Record<WalletVerificationStatus, string> = {
    disconnected: 'wallet.status.disconnected',
    connected_unverified: 'wallet.status.connectedUnverified',
    signature_pending: 'wallet.status.signaturePending',
    verified: 'wallet.status.verified',
    verification_failed: 'wallet.status.verificationFailed',
    wrong_network: 'wallet.status.wrongNetwork',
    unsupported_network: 'wallet.status.unsupportedNetwork',
    linked_to_account: 'wallet.status.linkedToAccount',
    linked_to_other_account: 'wallet.status.linkedToOtherAccount',
    revoked: 'wallet.status.revoked',
  };
  return map[status];
}

export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
