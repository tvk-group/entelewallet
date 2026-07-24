import { createHmac } from 'crypto';
import {
  allowMemoryNonceStore,
  isDeployedProduction,
  isProductionRuntime,
} from '@entelewallet/config';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export class RateLimitStorageUnavailableError extends Error {
  constructor(message = 'rate_limit_storage_unavailable') {
    super(message);
    this.name = 'RateLimitStorageUnavailableError';
  }
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, MemoryBucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

export const WALLET_API_LIMITS = {
  nonce: {
    perIp: { limit: 20, windowMs: 60_000 },
    perIpWallet: { limit: 8, windowMs: 60_000 },
  },
  verify: {
    perIp: { limit: 30, windowMs: 60_000 },
    perIpWallet: { limit: 12, windowMs: 60_000 },
  },
  cspReport: {
    perIp: { limit: 30, windowMs: 60_000 },
  },
} as const;

function allowMemoryRateLimit(): boolean {
  return allowMemoryNonceStore();
}

function getRateLimitHmacSecret(): string {
  const secret =
    process.env.RATE_LIMIT_HMAC_SECRET?.trim() || process.env.WALLET_VERIFICATION_SECRET?.trim();

  if (isProductionRuntime()) {
    if (!secret || secret.length < 32) {
      throw new RateLimitStorageUnavailableError();
    }
    return secret;
  }

  return secret || 'test-rate-limit-hmac-secret-32-bytes-min!!';
}

function shouldUsePersistentRateLimit(): boolean {
  return isSupabaseAdminConfigured() && (isDeployedProduction() || !allowMemoryRateLimit());
}

export function deriveRateLimitBucketKey(scope: string, identifier: string): string {
  return createHmac('sha256', getRateLimitHmacSecret())
    .update(`${scope}:${identifier}`)
    .digest('hex');
}

export function deriveClientIdentifier(
  ip: string,
  walletAddress?: string,
): {
  ipKey: string;
  ipWalletKey?: string;
} {
  const normalizedIp = ip.split(',')[0]?.trim() || 'unknown';
  const ipKey = deriveRateLimitBucketKey('client-ip', normalizedIp);
  const ipWalletKey = walletAddress
    ? deriveRateLimitBucketKey('client-ip-wallet', `${normalizedIp}:${walletAddress.toLowerCase()}`)
    : undefined;
  return { ipKey, ipWalletKey };
}

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);
  return { allowed: true, remaining: limit - bucket.count };
}

async function checkPersistentRateLimit(
  bucketKey: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const admin = createAdminClient();
  if (!admin) {
    if (isDeployedProduction()) {
      throw new RateLimitStorageUnavailableError();
    }
    return checkMemoryRateLimit(bucketKey, limit, windowMs);
  }

  const windowSeconds = Math.max(1, Math.floor(windowMs / 1000));
  const { data, error } = await admin.rpc('increment_rate_limit_bucket', {
    p_bucket_key: bucketKey,
    p_window_seconds: windowSeconds,
    p_limit: limit,
  });

  if (error) {
    if (isDeployedProduction()) {
      console.error('[rate_limit] Supabase increment failed in production');
      throw new RateLimitStorageUnavailableError();
    }
    return checkMemoryRateLimit(bucketKey, limit, windowMs);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    if (isDeployedProduction()) {
      throw new RateLimitStorageUnavailableError();
    }
    return checkMemoryRateLimit(bucketKey, limit, windowMs);
  }

  return {
    allowed: Boolean(row.allowed),
    retryAfterSeconds: row.retry_after_seconds || undefined,
    remaining: row.allowed ? Math.max(0, limit - row.current_count) : 0,
  };
}

async function checkRateLimitKey(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (allowMemoryRateLimit() && !shouldUsePersistentRateLimit()) {
    return checkMemoryRateLimit(key, limit, windowMs);
  }
  return checkPersistentRateLimit(key, limit, windowMs);
}

export async function enforceWalletApiRateLimit(params: {
  scope: 'nonce' | 'verify';
  ip: string;
  walletAddress?: string;
}): Promise<RateLimitResult> {
  const limits = WALLET_API_LIMITS[params.scope];
  const { ipKey, ipWalletKey } = deriveClientIdentifier(params.ip, params.walletAddress);

  const ipResult = await checkRateLimitKey(
    `${params.scope}:ip:${ipKey}`,
    limits.perIp.limit,
    limits.perIp.windowMs,
  );
  if (!ipResult.allowed) return ipResult;

  if (ipWalletKey) {
    const walletResult = await checkRateLimitKey(
      `${params.scope}:ip-wallet:${ipWalletKey}`,
      limits.perIpWallet.limit,
      limits.perIpWallet.windowMs,
    );
    if (!walletResult.allowed) return walletResult;
  }

  return { allowed: true };
}

export async function enforceCspReportRateLimit(ip: string): Promise<RateLimitResult> {
  const limits = WALLET_API_LIMITS.cspReport;
  const { ipKey } = deriveClientIdentifier(ip);
  return checkRateLimitKey(`csp-report:ip:${ipKey}`, limits.perIp.limit, limits.perIp.windowMs);
}

/** Reset in-memory buckets — test helper only. */
export function resetRateLimitsForTests(): void {
  memoryBuckets.clear();
}

/** Delete expired persistent buckets — call from cron or maintenance job. */
export async function cleanupExpiredRateLimitBuckets(): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const { data, error } = await admin.rpc('cleanup_expired_rate_limit_buckets');
  if (error) {
    console.warn('[rate_limit] cleanup failed:', error.message);
    return 0;
  }
  return typeof data === 'number' ? data : 0;
}

// Backward-compatible sync helper for unit tests of memory path only.
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  return checkMemoryRateLimit(key, limit, windowMs, now);
}
