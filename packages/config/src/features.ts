/**
 * Feature flags for EnteleWALLET Lite.
 * Dangerous full-wallet features must stay false until formal security architecture,
 * independent audit planning and legal approval are completed.
 */

export const FEATURES = {
  ENABLE_WALLET_CONNECT: true,
  ENABLE_WALLET_VERIFICATION: true,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_WALLET_ONLY_LOGIN: false,
  /** Gate claims with shared platform flag — do not enable without claim contract config. */
  ENABLE_CLAIMS: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_SEND_TOKENS: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_SWAP: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_CREATE_WALLET: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_IMPORT_WALLET: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_PRIVATE_KEY_STORAGE: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_MOBILE_WALLET: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_BROWSER_EXTENSION: false,
  /** Requires security architecture, audit plan and legal approval before enabling. */
  ENABLE_ACCOUNT_ABSTRACTION: false,
  /** Base Account wallet connector — disabled by default for EnteleWALLET Lite. */
  ENABLE_BASE_ACCOUNT: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envKey = `NEXT_PUBLIC_${flag}`;
  const envValue = typeof process !== 'undefined' ? process.env[envKey] : undefined;
  if (envValue !== undefined) {
    return envValue === 'true';
  }
  return FEATURES[flag];
}
