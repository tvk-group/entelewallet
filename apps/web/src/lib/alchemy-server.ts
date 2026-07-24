import { buildAlchemyUrl } from '@entelewallet/config';
import { getAddress, isAddress } from 'viem';

export type AlchemyTokenBalance = {
  contractAddress: string;
  tokenBalance: string;
};

export type AlchemyTokenMetadata = {
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
};

async function alchemyRpc<T>(chainId: number, method: string, params: unknown[]): Promise<T> {
  const apiKey = process.env.ALCHEMY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY not configured');
  }

  const url = buildAlchemyUrl(chainId, apiKey);
  if (!url) {
    throw new Error(`Alchemy not configured for chain ${chainId}`);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Alchemy HTTP ${res.status}`);
  }

  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) {
    throw new Error(json.error.message);
  }
  if (json.result === undefined) {
    throw new Error('Alchemy empty result');
  }
  return json.result;
}

export async function fetchAlchemyTokenBalances(
  chainId: number,
  walletAddress: string,
): Promise<AlchemyTokenBalance[]> {
  if (!isAddress(walletAddress)) return [];

  const result = await alchemyRpc<{ tokenBalances: AlchemyTokenBalance[] }>(
    chainId,
    'alchemy_getTokenBalances',
    [getAddress(walletAddress), 'erc20'],
  );

  return result.tokenBalances ?? [];
}

export async function fetchAlchemyTokenMetadata(
  chainId: number,
  contractAddress: string,
): Promise<AlchemyTokenMetadata> {
  return alchemyRpc<AlchemyTokenMetadata>(chainId, 'alchemy_getTokenMetadata', [contractAddress]);
}

/** Drop zero balances and invalid contracts. */
export function filterAlchemyBalances(balances: AlchemyTokenBalance[]): AlchemyTokenBalance[] {
  return balances.filter((row) => {
    if (
      !row.contractAddress ||
      row.contractAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      return false;
    }
    try {
      const value = BigInt(row.tokenBalance);
      return value > 0n;
    } catch {
      return false;
    }
  });
}
