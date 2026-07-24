import { CHAIN_COINGECKO_PLATFORM, getCoingeckoPlatform } from '@entelewallet/config';

export const PRICES_API_LIMITS = {
  maxIds: 50,
  maxContracts: 50,
  maxQueryLength: 2048,
  maxUpstreamRequests: 6,
} as const;

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isValidContractAddress(address: string): boolean {
  return EVM_ADDRESS_RE.test(address);
}

export function parsePriceIds(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0 && id.length <= 128 && /^[a-z0-9-]+$/i.test(id)),
    ),
  ].slice(0, PRICES_API_LIMITS.maxIds);
}

export function parsePriceContracts(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(',')
        .map((address) => address.trim().toLowerCase())
        .filter((address) => isValidContractAddress(address)),
    ),
  ].slice(0, PRICES_API_LIMITS.maxContracts);
}

export function resolveTrustedCoingeckoPlatform(params: {
  chainId: number;
  requestedPlatform?: string | null;
}): { platform: string } | { error: string; status: number } {
  if (!Number.isInteger(params.chainId) || params.chainId <= 0) {
    return { error: 'Invalid chainId', status: 400 };
  }

  const derivedPlatform = getCoingeckoPlatform(params.chainId);
  if (!derivedPlatform) {
    return { error: 'Unsupported chainId', status: 400 };
  }

  const requested = params.requestedPlatform?.trim();
  if (requested && requested !== derivedPlatform) {
    return { error: 'Platform does not match chainId', status: 400 };
  }

  if (!Object.values(CHAIN_COINGECKO_PLATFORM).includes(derivedPlatform)) {
    return { error: 'Unsupported chainId', status: 400 };
  }

  return { platform: derivedPlatform };
}

export function estimateUpstreamRequestCount(ids: string[], contracts: string[]): number {
  const idRequests = ids.length > 0 ? 1 : 0;
  const contractRequests = contracts.length > 0 ? Math.ceil(contracts.length / 100) : 0;
  return idRequests + contractRequests;
}
