import { getAddress, isAddress } from 'viem';

export function normalizeAddress(address: string): string {
  if (!isAddress(address)) {
    throw new Error('Invalid wallet address');
  }
  return getAddress(address);
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/** Redact wallet address for production logs. */
export function redactAddress(address: string): string {
  if (address.length < 12) return '0x…';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Redact signature for production logs. */
export function redactSignature(signature: string): string {
  if (signature.length <= 16) return '0x…';
  return `${signature.slice(0, 10)}…`;
}
