import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeAddress } from '@entelewallet/utils';
import { nonceStore, cleanExpiredNonces } from '@/lib/nonce-store';

export interface StoredWalletNonce {
  nonce: string;
  expiresAt: Date;
  used: boolean;
  chainId: number;
  domain: string;
  message: string;
}

function memoryKey(walletAddress: string, nonce: string): string {
  return `${walletAddress.toLowerCase()}-${nonce}`;
}

export async function storeWalletNonce(params: {
  walletAddress: string;
  chainId: number;
  nonce: string;
  message: string;
  domain: string;
  expiresAt: Date;
}): Promise<void> {
  const normalized = normalizeAddress(params.walletAddress).toLowerCase();
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
    console.warn('[wallet_nonce] Supabase insert failed, using memory fallback:', error.message);
  }

  nonceStore.set(memoryKey(normalized, params.nonce), {
    nonce: params.nonce,
    expiresAt: params.expiresAt,
    used: false,
    chainId: params.chainId,
    domain: params.domain,
    message: params.message,
  });
  cleanExpiredNonces();
}

export async function consumeWalletNonce(
  walletAddress: string,
  nonce: string,
): Promise<StoredWalletNonce | null> {
  const normalized = normalizeAddress(walletAddress).toLowerCase();
  const admin = createAdminClient();

  if (admin) {
    const now = new Date().toISOString();
    const { data, error } = await admin
      .from('wallet_auth_nonces')
      .select('*')
      .eq('wallet_address', normalized)
      .eq('nonce', nonce)
      .is('used_at', null)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[wallet_nonce] Supabase lookup failed:', error.message);
    } else if (data) {
      await admin
        .from('wallet_auth_nonces')
        .update({ used_at: now })
        .eq('id', data.id);

      return {
        nonce: data.nonce,
        expiresAt: new Date(data.expires_at),
        used: true,
        chainId: data.chain_id ?? 0,
        domain: data.domain,
        message: data.message,
      };
    }
  }

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
  };
}
