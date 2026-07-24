# Supabase Cron — Rate Limit Cleanup

The migration `supabase/migrations/20260724200000_post_fortress_live_security.sql` enables `pg_cron` and schedules `public.cleanup_expired_rate_limit_buckets()` to run **once per hour** (`0 * * * *`).

The schedule is idempotent: rerunning the migration does not create duplicate jobs when a job named `cleanup_expired_rate_limit_buckets` already exists.

## Inspect the scheduled job

In the Supabase SQL Editor:

```sql
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'cleanup_expired_rate_limit_buckets';
```

## Inspect recent runs

```sql
SELECT
  j.jobname,
  d.status,
  d.start_time,
  d.end_time,
  d.return_message
FROM cron.job_run_details d
JOIN cron.job j ON j.jobid = d.jobid
WHERE j.jobname = 'cleanup_expired_rate_limit_buckets'
ORDER BY d.start_time DESC
LIMIT 20;
```

- `status = 'succeeded'` — cleanup completed normally.
- `status = 'failed'` — inspect `return_message` for the PostgreSQL error.
- No recent rows — confirm `pg_cron` is enabled for the project and the job is `active = true`.

## Manual run (maintenance)

```sql
SELECT public.cleanup_expired_rate_limit_buckets();
```

Returns the number of deleted `rate_limit_buckets` rows.

## Privileged RPC access

The same migration hardens these `SECURITY DEFINER` functions:

- `public.consume_wallet_nonce(text, text)`
- `public.increment_rate_limit_bucket(text, integer, integer)`
- `public.cleanup_expired_rate_limit_buckets()`

Each function uses `SET search_path = ''`, fully qualified object names, and `EXECUTE` granted only to `service_role`. Regression assertions in the migration verify:

```sql
has_function_privilege('anon', function_oid, 'EXECUTE') = false
has_function_privilege('authenticated', function_oid, 'EXECUTE') = false
has_function_privilege('service_role', function_oid, 'EXECUTE') = true
```

After applying migrations, run **Database → Advisors → Security** in the Supabase dashboard and confirm no new findings for these functions or `support_security_reports` policies.
