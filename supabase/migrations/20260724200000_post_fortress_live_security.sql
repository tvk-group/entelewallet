-- Post-fortress live security hotfix:
-- 1. Harden SECURITY DEFINER RPCs (empty search_path, explicit grants)
-- 2. Remove anonymous/authenticated INSERT on support_security_reports
-- 3. Schedule hourly rate-limit bucket cleanup via pg_cron

-- ---------------------------------------------------------------------------
-- consume_wallet_nonce
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_wallet_nonce(
  p_wallet_address TEXT,
  p_nonce TEXT
)
RETURNS SETOF public.wallet_auth_nonces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_wallet_address IS NULL OR length(trim(p_wallet_address)) = 0 OR length(p_wallet_address) > 128 THEN
    RETURN;
  END IF;

  IF p_nonce IS NULL OR length(p_nonce) = 0 OR length(p_nonce) > 256 THEN
    RETURN;
  END IF;

  RETURN QUERY
  UPDATE public.wallet_auth_nonces
  SET used_at = now()
  WHERE wallet_address = lower(p_wallet_address)
    AND nonce = p_nonce
    AND used_at IS NULL
    AND expires_at > now()
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_wallet_nonce(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_wallet_nonce(TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.consume_wallet_nonce(TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_wallet_nonce(TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- increment_rate_limit_bucket
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_rate_limit_bucket(
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
SET search_path = ''
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_expires TIMESTAMPTZ;
BEGIN
  IF p_bucket_key IS NULL OR length(p_bucket_key) = 0 OR length(p_bucket_key) > 256 THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100000 THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;

  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );
  v_expires := v_window_start + make_interval(secs => p_window_seconds);

  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, count, expires_at)
  VALUES (p_bucket_key, v_window_start, 1, v_expires)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET count = public.rate_limit_buckets.count + 1
  RETURNING public.rate_limit_buckets.count INTO v_count;

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

REVOKE ALL ON FUNCTION public.increment_rate_limit_bucket(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_rate_limit_bucket(TEXT, INTEGER, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.increment_rate_limit_bucket(TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit_bucket(TEXT, INTEGER, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- cleanup_expired_rate_limit_buckets
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limit_buckets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.rate_limit_buckets WHERE expires_at < now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_rate_limit_buckets() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_expired_rate_limit_buckets() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_expired_rate_limit_buckets() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rate_limit_buckets() TO service_role;

-- ---------------------------------------------------------------------------
-- support_security_reports — service-role inserts only (via API route)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit security reports" ON public.support_security_reports;

-- ---------------------------------------------------------------------------
-- pg_cron: hourly cleanup of expired rate-limit buckets
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'cleanup_expired_rate_limit_buckets'
  ) THEN
    PERFORM cron.schedule(
      'cleanup_expired_rate_limit_buckets',
      '0 * * * *',
      $cron$SELECT public.cleanup_expired_rate_limit_buckets()$cron$
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Regression assertions: privileged RPCs are service_role-only
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  fn_sig TEXT;
  fn_oid OID;
BEGIN
  FOREACH fn_sig IN ARRAY ARRAY[
    'public.consume_wallet_nonce(text,text)',
    'public.increment_rate_limit_bucket(text,integer,integer)',
    'public.cleanup_expired_rate_limit_buckets()'
  ]
  LOOP
    fn_oid := to_regprocedure(fn_sig);
    IF fn_oid IS NULL THEN
      RAISE EXCEPTION 'Expected function % is missing', fn_sig;
    END IF;

    IF has_function_privilege('anon', fn_oid, 'EXECUTE') THEN
      RAISE EXCEPTION 'anon must not have EXECUTE on %', fn_sig;
    END IF;

    IF has_function_privilege('authenticated', fn_oid, 'EXECUTE') THEN
      RAISE EXCEPTION 'authenticated must not have EXECUTE on %', fn_sig;
    END IF;

    IF NOT has_function_privilege('service_role', fn_oid, 'EXECUTE') THEN
      RAISE EXCEPTION 'service_role must have EXECUTE on %', fn_sig;
    END IF;
  END LOOP;
END $$;
