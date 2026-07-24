interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
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
  buckets.set(key, bucket);
  return { allowed: true, remaining: limit - bucket.count };
}

/** Reset all buckets — test helper only. */
export function resetRateLimitsForTests(): void {
  buckets.clear();
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
} as const;

export function buildRateLimitKeys(
  ip: string,
  walletAddress?: string,
): { ipKey: string; ipWalletKey?: string } {
  const normalizedIp = ip.split(',')[0]?.trim() || 'unknown';
  const ipKey = normalizedIp;
  const ipWalletKey = walletAddress ? `${normalizedIp}:${walletAddress.toLowerCase()}` : undefined;
  return { ipKey, ipWalletKey };
}

export function enforceWalletApiRateLimit(params: {
  scope: 'nonce' | 'verify';
  ip: string;
  walletAddress?: string;
}): RateLimitResult {
  const limits = WALLET_API_LIMITS[params.scope];
  const { ipKey, ipWalletKey } = buildRateLimitKeys(params.ip, params.walletAddress);

  const ipResult = checkRateLimit(
    `${params.scope}:ip:${ipKey}`,
    limits.perIp.limit,
    limits.perIp.windowMs,
  );
  if (!ipResult.allowed) return ipResult;

  if (ipWalletKey) {
    const walletResult = checkRateLimit(
      `${params.scope}:ip-wallet:${ipWalletKey}`,
      limits.perIpWallet.limit,
      limits.perIpWallet.windowMs,
    );
    if (!walletResult.allowed) return walletResult;
  }

  return { allowed: true };
}
