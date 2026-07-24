/**
 * Feature flags for EnteleWALLET Lite.
 * Dangerous full-wallet features must stay false until formal security architecture,
 * independent audit planning and legal approval are completed.
 *
 * Dangerous flags cannot be enabled via NEXT_PUBLIC environment variables.
 * Enabling them requires an intentional source-code change, tests, security review
 * and a separate PR.
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

/** Flags that must never be toggled via environment variables in production. */
export const DANGEROUS_FEATURE_FLAGS = [
  'ENABLE_CREATE_WALLET',
  'ENABLE_IMPORT_WALLET',
  'ENABLE_PRIVATE_KEY_STORAGE',
  'ENABLE_SEND_TOKENS',
  'ENABLE_SWAP',
  'ENABLE_MOBILE_WALLET',
  'ENABLE_BROWSER_EXTENSION',
  'ENABLE_ACCOUNT_ABSTRACTION',
  'ENABLE_WALLET_ONLY_LOGIN',
] as const satisfies readonly FeatureFlag[];

export type DangerousFeatureFlag = (typeof DANGEROUS_FEATURE_FLAGS)[number];

const ENV_OVERRIDABLE_FLAGS: FeatureFlag[] = [
  'ENABLE_WALLET_CONNECT',
  'ENABLE_WALLET_VERIFICATION',
  'ENABLE_CLAIMS',
  'ENABLE_BASE_ACCOUNT',
];

export function isDangerousFeatureFlag(flag: FeatureFlag): flag is DangerousFeatureFlag {
  return (DANGEROUS_FEATURE_FLAGS as readonly string[]).includes(flag);
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (isDangerousFeatureFlag(flag)) {
    return FEATURES[flag];
  }

  if (ENV_OVERRIDABLE_FLAGS.includes(flag)) {
    const envKey = `NEXT_PUBLIC_${flag}`;
    const envValue = typeof process !== 'undefined' ? process.env[envKey] : undefined;
    if (envValue !== undefined) {
      return envValue === 'true';
    }
  }

  return FEATURES[flag];
}
