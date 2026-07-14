import type { LinkedAddresses } from '@entelewallet/types';

const KEY_PREFIX = 'entelewallet-linked-addresses';

function storageKey(evmAddress: string): string {
  return `${KEY_PREFIX}-${evmAddress.toLowerCase()}`;
}

export function readLinkedAddresses(evmAddress: string): LinkedAddresses {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(storageKey(evmAddress));
    if (!raw) return {};
    return JSON.parse(raw) as LinkedAddresses;
  } catch {
    return {};
  }
}

export function writeLinkedAddresses(evmAddress: string, linked: LinkedAddresses): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(evmAddress), JSON.stringify(linked));
}

export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address.trim());
}

export function isValidCardanoAddress(address: string): boolean {
  const trimmed = address.trim();
  return /^(addr1|stake1)[a-z0-9]{50,}$/i.test(trimmed);
}
