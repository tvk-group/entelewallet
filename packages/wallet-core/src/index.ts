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

    return {
      success: true,
      address: fields.data.address,
      chainId: fields.data.chainId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Verification failed',
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
