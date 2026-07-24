import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { nonceStore, cleanExpiredNonces } from '@/lib/nonce-store';
import { allowMemoryNonceStore, isProductionRuntime } from '@entelewallet/config';
import { normalizeAddress } from '@entelewallet/utils';

export class NonceStorageUnavailableError extends Error {
  constructor(message = 'nonce_storage_unavailable') {
    super(message);
    this.name = 'NonceStorageUnavailableError';
  }
}

export interface StoredWalletNonce {
  nonce: string;
  expiresAt: Date;
  used: boolean;
  chainId: number;
  domain: string;
  message: string;
  uri: string;
}

function memoryKey(walletAddress: string, nonce: string): string {
  return `${walletAddress.toLowerCase()}-${nonce}`;
}

function mapSupabaseRow(data: {
  nonce: string;
  expires_at: string;
  chain_id: number | null;
  domain: string;
  message: string;
}): StoredWalletNonce {
  const uriMatch = data.message.match(/^URI: (.+)$/m);
  return {
    nonce: data.nonce,
    expiresAt: new Date(data.expires_at),
    used: true,
    chainId: data.chain_id ?? 0,
    domain: data.domain,
    message: data.message,
    uri: uriMatch?.[1] ?? '',
  };
}

function requirePersistentStorage(): void {
  if (isProductionRuntime() && !isSupabaseAdminConfigured()) {
    throw new NonceStorageUnavailableError();
  }
}

export async function storeWalletNonce(params: {
  walletAddress: string;
  chainId: number;
  nonce: string;
  message: string;
  domain: string;
  uri: string;
  expiresAt: Date;
}): Promise<void> {
  const normalized = normalizeAddress(params.walletAddress).toLowerCase();
  requirePersistentStorage();
  const admin = createAdminClient();

  if (admin) {
    const { error } = await admin.from('wallet_auth_nonces').insert({
      wallet_address: normalized,
      chain_id: params.chainId,
      nonce: params.nonce,
      message: params.message,
      domain: params.domain,
      expires_at: params.expiresAt.toISOString(),
    });

    if (!error) return;

    if (isProductionRuntime()) {
      console.error('[wallet_nonce] Supabase insert failed in production');
      throw new NonceStorageUnavailableError();
    }

    console.warn('[wallet_nonce] Supabase insert failed, using memory fallback in dev');
  } else if (isProductionRuntime()) {
    throw new NonceStorageUnavailableError();
  }

  if (!allowMemoryNonceStore()) {
    throw new NonceStorageUnavailableError();
  }

  nonceStore.set(memoryKey(normalized, params.nonce), {
    nonce: params.nonce,
    expiresAt: params.expiresAt,
    used: false,
    chainId: params.chainId,
    domain: params.domain,
    message: params.message,
    uri: params.uri,
  });
  cleanExpiredNonces();
}

export async function consumeWalletNonce(
  walletAddress: string,
  nonce: string,
): Promise<StoredWalletNonce | null> {
  const normalized = normalizeAddress(walletAddress).toLowerCase();
  requirePersistentStorage();
  const admin = createAdminClient();

  if (admin) {
    const { data, error } = await admin.rpc('consume_wallet_nonce', {
      p_wallet_address: normalized,
      p_nonce: nonce,
    });

    if (error) {
      const fallback = await consumeWalletNonceFallback(admin, normalized, nonce);
      if (fallback) return fallback;

      if (isProductionRuntime()) {
        console.error('[wallet_nonce] Supabase consume failed in production');
        throw new NonceStorageUnavailableError();
      }

      console.warn('[wallet_nonce] Supabase consume failed, trying memory fallback in dev');
    } else if (Array.isArray(data) && data.length > 0) {
      return mapSupabaseRow(data[0]);
    } else if (data && !Array.isArray(data)) {
      return mapSupabaseRow(data);
    }
  } else if (isProductionRuntime()) {
    throw new NonceStorageUnavailableError();
  }

  if (!allowMemoryNonceStore()) {
    throw new NonceStorageUnavailableError();
  }

  return consumeWalletNonceFromMemory(normalized, nonce);
}

async function consumeWalletNonceFallback(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  normalized: string,
  nonce: string,
): Promise<StoredWalletNonce | null> {
  if (!admin) return null;

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from('wallet_auth_nonces')
    .update({ used_at: now })
    .eq('wallet_address', normalized)
    .eq('nonce', nonce)
    .is('used_at', null)
    .gt('expires_at', now)
    .select('*');

  if (error || !data?.length) return null;
  return mapSupabaseRow(data[0]);
}

function consumeWalletNonceFromMemory(normalized: string, nonce: string): StoredWalletNonce | null {
  const key = memoryKey(normalized, nonce);
  const stored = nonceStore.get(key);
  if (!stored) return null;

  if (stored.used || stored.expiresAt < new Date()) {
    nonceStore.delete(key);
    return null;
  }

  stored.used = true;
  nonceStore.set(key, stored);

  return {
    nonce: stored.nonce,
    expiresAt: stored.expiresAt,
    used: true,
    chainId: stored.chainId,
    domain: stored.domain,
    message: stored.message ?? '',
    uri: stored.uri ?? '',
  };
}

/** Test helper — clear in-memory nonce store. */
export function resetMemoryNonceStoreForTests(): void {
  nonceStore.clear();
}
