import { describe, expect, it } from 'vitest';
import {
  DANGEROUS_FEATURE_FLAGS,
  FEATURES,
  isDangerousFeatureFlag,
  isFeatureEnabled,
} from './features';

describe('dangerous feature gating', () => {
  it('keeps all dangerous flags disabled in source', () => {
    for (const flag of DANGEROUS_FEATURE_FLAGS) {
      expect(FEATURES[flag]).toBe(false);
    }
  });

  it('does not allow env override for dangerous flags', () => {
    for (const flag of DANGEROUS_FEATURE_FLAGS) {
      const previous = process.env[`NEXT_PUBLIC_${flag}`];
      process.env[`NEXT_PUBLIC_${flag}`] = 'true';
      expect(isFeatureEnabled(flag)).toBe(false);
      if (previous === undefined) {
        delete process.env[`NEXT_PUBLIC_${flag}`];
      } else {
        process.env[`NEXT_PUBLIC_${flag}`] = previous;
      }
    }
  });

  it('classifies dangerous flags correctly', () => {
    expect(isDangerousFeatureFlag('ENABLE_SEND_TOKENS')).toBe(true);
    expect(isDangerousFeatureFlag('ENABLE_WALLET_CONNECT')).toBe(false);
  });

  it('allows env override for safe flags', () => {
    const previous = process.env.NEXT_PUBLIC_ENABLE_CLAIMS;
    process.env.NEXT_PUBLIC_ENABLE_CLAIMS = 'true';
    expect(isFeatureEnabled('ENABLE_CLAIMS')).toBe(true);
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_CLAIMS;
    } else {
      process.env.NEXT_PUBLIC_ENABLE_CLAIMS = previous;
    }
  });
});
