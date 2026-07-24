/** Minimum byte length for server-side HMAC/signing secrets. */
export const MIN_SECRET_BYTE_LENGTH = 32;

export function getSecretByteLength(secret: string): number {
  if (/^[0-9a-f]{64,}$/i.test(secret)) {
    return secret.length / 2;
  }
  try {
    const decoded = Buffer.from(secret, 'base64');
    if (decoded.length >= MIN_SECRET_BYTE_LENGTH) return decoded.length;
  } catch {
    // fall through to utf8 length
  }
  return Buffer.byteLength(secret, 'utf8');
}

export function isSecretStrongEnough(secret: string | undefined): boolean {
  if (!secret?.trim()) return false;
  return getSecretByteLength(secret.trim()) >= MIN_SECRET_BYTE_LENGTH;
}

export function secretsAreIndependent(
  secretA: string | undefined,
  secretB: string | undefined,
): boolean {
  const a = secretA?.trim();
  const b = secretB?.trim();
  if (!a || !b) return false;
  return a !== b;
}
