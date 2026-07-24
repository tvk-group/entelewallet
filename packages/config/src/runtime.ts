/**
 * Runtime environment helpers for security-sensitive code paths.
 */

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

/** In-memory nonce storage is permitted only in development and automated tests. */
export function allowMemoryNonceStore(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true'
  );
}

/** True only on live Vercel production deployments (not local production builds). */
export function isDeployedProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}
