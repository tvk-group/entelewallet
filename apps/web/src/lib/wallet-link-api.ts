import type { WalletConnectionRecord } from '@entelewallet/types';

export interface LinkWalletResponse {
  success: boolean;
  connection?: WalletConnectionRecord;
  error?: string;
}

export interface WalletConnectionsResponse {
  connections: WalletConnectionRecord[];
  walletStatus?: {
    linkedToCurrentUser: boolean;
    linkedToOtherUser: boolean;
  };
}

export async function fetchWalletConnections(address?: string): Promise<WalletConnectionsResponse> {
  const url = address
    ? `/api/wallet/connections?address=${encodeURIComponent(address)}`
    : '/api/wallet/connections';
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) return { connections: [] };
  return (await res.json()) as WalletConnectionsResponse;
}

export async function linkWalletToAccount(params: {
  address: string;
  chainId: number;
  walletType?: string;
}): Promise<LinkWalletResponse> {
  const res = await fetch('/api/wallet/link', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = (await res.json()) as LinkWalletResponse;
  if (!res.ok) {
    return { success: false, error: data.error ?? 'link_failed' };
  }
  return data;
}

export async function unlinkWalletFromAccount(address: string): Promise<boolean> {
  const res = await fetch('/api/wallet/link', {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  return res.ok;
}
