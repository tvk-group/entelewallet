export const nonceStore = new Map<
  string,
  {
    nonce: string;
    expiresAt: Date;
    used: boolean;
    chainId: number;
    domain: string;
    message?: string;
    uri?: string;
  }
>();

export function cleanExpiredNonces() {
  for (const [key, value] of nonceStore.entries()) {
    if (value.expiresAt < new Date()) {
      nonceStore.delete(key);
    }
  }
}
