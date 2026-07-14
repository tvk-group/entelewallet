const KEY_PREFIX = 'entelewallet-hidden-discovered';

function storageKey(walletAddress: string, chainId: number): string {
  return `${KEY_PREFIX}-${walletAddress.toLowerCase()}-${chainId}`;
}

export function readHiddenDiscovered(walletAddress: string, chainId: number): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(walletAddress, chainId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.map((v) => v.toLowerCase()) : [];
  } catch {
    return [];
  }
}

export function hideDiscoveredToken(
  walletAddress: string,
  chainId: number,
  contractAddress: string,
): string[] {
  const current = readHiddenDiscovered(walletAddress, chainId);
  const next = [...new Set([...current, contractAddress.toLowerCase()])];
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey(walletAddress, chainId), JSON.stringify(next));
  }
  return next;
}

export function unhideDiscoveredToken(
  walletAddress: string,
  chainId: number,
  contractAddress: string,
): string[] {
  const lowered = contractAddress.toLowerCase();
  const next = readHiddenDiscovered(walletAddress, chainId).filter((v) => v !== lowered);
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey(walletAddress, chainId), JSON.stringify(next));
  }
  return next;
}
