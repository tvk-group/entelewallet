import { describe, expect, it } from 'vitest';
import {
  estimateUpstreamRequestCount,
  isValidContractAddress,
  parsePriceContracts,
  parsePriceIds,
  PRICES_API_LIMITS,
  resolveTrustedCoingeckoPlatform,
} from './prices-api';

describe('prices-api', () => {
  it('validates supported chainId and derives platform server-side', () => {
    const result = resolveTrustedCoingeckoPlatform({ chainId: 1 });
    expect(result).toEqual({ platform: 'ethereum' });
  });

  it('rejects platform and chainId mismatches', () => {
    const result = resolveTrustedCoingeckoPlatform({
      chainId: 1,
      requestedPlatform: 'polygon-pos',
    });
    expect(result).toEqual({ error: 'Platform does not match chainId', status: 400 });
  });

  it('rejects unsupported chainId values', () => {
    const result = resolveTrustedCoingeckoPlatform({ chainId: 999999 });
    expect(result).toEqual({ error: 'Unsupported chainId', status: 400 });
  });

  it('validates contract addresses and caps list size', () => {
    const valid = '0x1111111111111111111111111111111111111111';
    const invalid = 'not-an-address';
    const contracts = parsePriceContracts(`${valid},${invalid},${valid}`);
    expect(contracts).toEqual([valid]);
    expect(isValidContractAddress(valid)).toBe(true);
    expect(isValidContractAddress(invalid)).toBe(false);
  });

  it('caps ids, contracts, and upstream request estimates', () => {
    const ids = parsePriceIds(Array.from({ length: 100 }, (_, i) => `token-${i}`).join(','));
    const contracts = parsePriceContracts(
      Array.from(
        { length: 100 },
        (_, index) => `0x${(index + 1).toString(16).padStart(40, '0')}`,
      ).join(','),
    );
    expect(ids.length).toBe(PRICES_API_LIMITS.maxIds);
    expect(contracts.length).toBe(PRICES_API_LIMITS.maxContracts);
    expect(estimateUpstreamRequestCount(ids, contracts)).toBeLessThanOrEqual(
      PRICES_API_LIMITS.maxUpstreamRequests,
    );
  });
});
