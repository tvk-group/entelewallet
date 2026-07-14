import { NextResponse } from 'next/server';

type SuiBalanceResult = {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
};

async function fetchSuiBalance(address: string) {
  const res = await fetch('https://fullnode.mainnet.sui.io', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getBalance',
      params: [address],
    }),
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error('sui_rpc_error');
  const json = (await res.json()) as { result?: SuiBalanceResult; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

async function fetchCardanoBalance(address: string) {
  const res = await fetch('https://api.koios.rest/api/v1/account_info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _addresses: [address] }),
    next: { revalidate: 30 },
  });

  if (!res.ok) throw new Error('cardano_api_error');
  const rows = (await res.json()) as Array<{ balance?: string }>;
  const row = rows[0];
  if (!row?.balance) return null;
  return row.balance;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sui = searchParams.get('sui')?.trim();
  const cardano = searchParams.get('cardano')?.trim();

  const balances = [];

  if (sui) {
    try {
      const result = await fetchSuiBalance(sui);
      if (result && BigInt(result.totalBalance) > 0n) {
        balances.push({
          networkId: 'sui' as const,
          address: sui,
          symbol: 'SUI',
          balance: result.totalBalance,
          decimals: 9,
        });
      }
    } catch {
      balances.push({ networkId: 'sui' as const, address: sui, error: 'fetch_failed' });
    }
  }

  if (cardano) {
    try {
      const lovelace = await fetchCardanoBalance(cardano);
      if (lovelace && BigInt(lovelace) > 0n) {
        balances.push({
          networkId: 'cardano' as const,
          address: cardano,
          symbol: 'ADA',
          balance: lovelace,
          decimals: 6,
        });
      }
    } catch {
      balances.push({ networkId: 'cardano' as const, address: cardano, error: 'fetch_failed' });
    }
  }

  return NextResponse.json({ balances });
}
