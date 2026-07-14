import type { WalletConnectionRecord } from '@entelewallet/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeAddress } from '@entelewallet/utils';

interface WalletConnectionRow {
  id: string;
  user_id: string | null;
  wallet_address: string;
  chain_id: number | null;
  wallet_type: string | null;
  is_primary: boolean | null;
  verification_status: string | null;
  verified_at: string | null;
  linked_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function mapRow(row: WalletConnectionRow): WalletConnectionRecord {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    walletAddress: row.wallet_address,
    chainId: row.chain_id ?? 0,
    walletType: row.wallet_type ?? undefined,
    isPrimary: row.is_primary ?? false,
    verificationStatus: (row.verification_status as WalletConnectionRecord['verificationStatus']) ?? 'verified',
    verifiedAt: row.verified_at ?? undefined,
    linkedAt: row.linked_at ?? undefined,
    revokedAt: row.revoked_at ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function logSupabaseError(context: string, error: { message?: string; code?: string } | null) {
  if (error) {
    console.error(`[wallet_connections] ${context}:`, error.message ?? error);
  }
}

export async function getActiveConnectionForAddress(
  walletAddress: string,
): Promise<WalletConnectionRecord | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = normalizeAddress(walletAddress).toLowerCase();

  const { data, error } = await admin
    .from('wallet_connections')
    .select('*')
    .eq('wallet_address', normalized)
    .is('revoked_at', null)
    .order('linked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logSupabaseError('getActiveConnectionForAddress', error);
    return null;
  }
  if (!data) return null;
  return mapRow(data as WalletConnectionRow);
}

export async function getUserConnections(userId: string): Promise<WalletConnectionRecord[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from('wallet_connections')
    .select('*')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('is_primary', { ascending: false })
    .order('linked_at', { ascending: false });

  if (error) {
    logSupabaseError('getUserConnections', error);
    return [];
  }
  return (data as WalletConnectionRow[]).map(mapRow);
}

export async function recordAuthEvent(params: {
  userId?: string;
  walletAddress: string;
  chainId: number;
  eventType: string;
  ipHash?: string;
  userAgentHash?: string;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin.from('wallet_auth_events').insert({
    user_id: params.userId ?? null,
    wallet_address: normalizeAddress(params.walletAddress).toLowerCase(),
    chain_id: params.chainId,
    event_type: params.eventType,
    ip_hash: params.ipHash ?? null,
    user_agent_hash: params.userAgentHash ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    logSupabaseError(`recordAuthEvent:${params.eventType}`, error);
    return false;
  }
  return true;
}

export async function hasRecentVerification(
  walletAddress: string,
  chainId?: number,
  windowMinutes = 30,
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const normalized = normalizeAddress(walletAddress).toLowerCase();

  let query = admin
    .from('wallet_auth_events')
    .select('id')
    .eq('wallet_address', normalized)
    .eq('event_type', 'verification_success')
    .gte('created_at', since)
    .limit(1);

  if (chainId !== undefined) {
    query = query.eq('chain_id', chainId);
  }

  const { data, error } = await query;

  if (error) {
    logSupabaseError('hasRecentVerification', error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function getLatestVerification(
  walletAddress: string,
): Promise<{ verifiedAt: string; chainId: number } | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const normalized = normalizeAddress(walletAddress).toLowerCase();

  const { data, error } = await admin
    .from('wallet_auth_events')
    .select('created_at, chain_id')
    .eq('wallet_address', normalized)
    .eq('event_type', 'verification_success')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) logSupabaseError('getLatestVerification', error);
    return null;
  }

  return {
    verifiedAt: data.created_at ?? new Date().toISOString(),
    chainId: data.chain_id ?? 0,
  };
}

export async function linkWalletToUser(params: {
  userId: string;
  walletAddress: string;
  chainId: number;
  walletType?: string;
  verifiedAt?: string;
}): Promise<WalletConnectionRecord> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error('supabase_not_configured');
  }

  const normalized = normalizeAddress(params.walletAddress).toLowerCase();
  const now = new Date().toISOString();

  const existing = await getActiveConnectionForAddress(normalized);
  if (existing && existing.userId && existing.userId !== params.userId) {
    throw new Error('wallet_linked_to_other_account');
  }

  if (existing && existing.userId === params.userId) {
    const { data, error } = await admin
      .from('wallet_connections')
      .update({
        chain_id: params.chainId,
        wallet_type: params.walletType ?? null,
        verification_status: 'linked_to_account',
        verified_at: params.verifiedAt ?? existing.verifiedAt ?? now,
        linked_at: existing.linkedAt ?? now,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error || !data) {
      logSupabaseError('linkWalletToUser:update', error);
      throw new Error('link_update_failed');
    }
    return mapRow(data as WalletConnectionRow);
  }

  const { data: userConnections } = await admin
    .from('wallet_connections')
    .select('id')
    .eq('user_id', params.userId)
    .is('revoked_at', null);

  const isPrimary = !userConnections?.length;

  const { data, error } = await admin
    .from('wallet_connections')
    .insert({
      user_id: params.userId,
      wallet_address: normalized,
      chain_id: params.chainId,
      wallet_type: params.walletType ?? null,
      is_primary: isPrimary,
      verification_status: 'linked_to_account',
      verified_at: params.verifiedAt ?? now,
      linked_at: now,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error || !data) {
    logSupabaseError('linkWalletToUser:insert', error);
    if (error?.code === '23505') {
      throw new Error('wallet_linked_to_other_account');
    }
    throw new Error('link_insert_failed');
  }
  return mapRow(data as WalletConnectionRow);
}

export async function unlinkWalletForUser(
  userId: string,
  walletAddress: string,
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) throw new Error('supabase_not_configured');

  const normalized = normalizeAddress(walletAddress).toLowerCase();
  const now = new Date().toISOString();

  const { error } = await admin
    .from('wallet_connections')
    .update({
      revoked_at: now,
      verification_status: 'revoked',
      updated_at: now,
    })
    .eq('user_id', userId)
    .eq('wallet_address', normalized)
    .is('revoked_at', null);

  if (error) {
    logSupabaseError('unlinkWalletForUser', error);
    throw new Error('unlink_failed');
  }
}
