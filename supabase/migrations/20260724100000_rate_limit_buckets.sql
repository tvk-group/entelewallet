-- Distributed rate limiting with atomic time-bucketed increments.
-- Bucket keys are HMAC-derived identifiers (never raw IPs).

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (bucket_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires
  ON rate_limit_buckets (expires_at);

ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No client access to rate limit buckets" ON rate_limit_buckets;
CREATE POLICY "No client access to rate limit buckets"
  ON rate_limit_buckets FOR ALL
  USING (false);

CREATE OR REPLACE FUNCTION increment_rate_limit_bucket(
  p_bucket_key TEXT,
  p_window_seconds INTEGER,
  p_limit INTEGER
)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_expires TIMESTAMPTZ;
BEGIN
  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );
  v_expires := v_window_start + make_interval(secs => p_window_seconds);

  INSERT INTO rate_limit_buckets (bucket_key, window_start, count, expires_at)
  VALUES (p_bucket_key, v_window_start, 1, v_expires)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET count = rate_limit_buckets.count + 1
  RETURNING rate_limit_buckets.count INTO v_count;

  IF v_count <= p_limit THEN
    RETURN QUERY SELECT true, v_count, 0;
  ELSE
    RETURN QUERY SELECT
      false,
      v_count,
      GREATEST(1, ceil(extract(epoch FROM (v_expires - now())))::INTEGER);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_expired_rate_limit_buckets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limit_buckets WHERE expires_at < now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION increment_rate_limit_bucket(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION cleanup_expired_rate_limit_buckets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_rate_limit_bucket(TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_rate_limit_buckets() TO service_role;
