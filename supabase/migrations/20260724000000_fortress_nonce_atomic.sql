-- Fortress security foundation: atomic nonce consumption and uniqueness constraint.
-- Ensures concurrent verification cannot reuse the same nonce.

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_auth_nonces_unique
  ON wallet_auth_nonces (wallet_address, nonce);

CREATE OR REPLACE FUNCTION consume_wallet_nonce(
  p_wallet_address TEXT,
  p_nonce TEXT
)
RETURNS SETOF wallet_auth_nonces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE wallet_auth_nonces
  SET used_at = now()
  WHERE wallet_address = lower(p_wallet_address)
    AND nonce = p_nonce
    AND used_at IS NULL
    AND expires_at > now()
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION consume_wallet_nonce(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_wallet_nonce(TEXT, TEXT) TO service_role;
