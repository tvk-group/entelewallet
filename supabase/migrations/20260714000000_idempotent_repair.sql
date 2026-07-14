-- Safe to re-run: completes or repairs a partially applied initial schema.
-- Run this in the Supabase SQL Editor if the initial migration failed partway through.

-- wallet_connections
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  wallet_address TEXT NOT NULL,
  chain_id INTEGER,
  wallet_type TEXT,
  is_primary BOOLEAN DEFAULT false,
  verification_status TEXT,
  verified_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_connections_address ON wallet_connections (wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_connections_one_active_per_address
  ON wallet_connections (wallet_address)
  WHERE revoked_at IS NULL;

ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet connections" ON wallet_connections;
CREATE POLICY "Users can view own wallet connections"
  ON wallet_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wallet connections" ON wallet_connections;
CREATE POLICY "Users can insert own wallet connections"
  ON wallet_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wallet connections" ON wallet_connections;
CREATE POLICY "Users can update own wallet connections"
  ON wallet_connections FOR UPDATE
  USING (auth.uid() = user_id);

-- wallet_auth_nonces
CREATE TABLE IF NOT EXISTS wallet_auth_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  chain_id INTEGER,
  nonce TEXT NOT NULL,
  message TEXT NOT NULL,
  domain TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_auth_nonces_lookup ON wallet_auth_nonces (wallet_address, nonce);

ALTER TABLE wallet_auth_nonces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No client access to nonces" ON wallet_auth_nonces;
CREATE POLICY "No client access to nonces"
  ON wallet_auth_nonces FOR ALL
  USING (false);

-- wallet_auth_events
CREATE TABLE IF NOT EXISTS wallet_auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  wallet_address TEXT,
  chain_id INTEGER,
  event_type TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_auth_events_address ON wallet_auth_events (wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_auth_events_user_id ON wallet_auth_events (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_auth_events_verification_lookup
  ON wallet_auth_events (wallet_address, chain_id, event_type, created_at DESC);

ALTER TABLE wallet_auth_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own auth events" ON wallet_auth_events;
CREATE POLICY "Users can view own auth events"
  ON wallet_auth_events FOR SELECT
  USING (auth.uid() = user_id);

-- support_security_reports
CREATE TABLE IF NOT EXISTS support_security_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  subject TEXT,
  message TEXT,
  severity TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE support_security_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit security reports" ON support_security_reports;
CREATE POLICY "Anyone can submit security reports"
  ON support_security_reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "No public read on security reports" ON support_security_reports;
CREATE POLICY "No public read on security reports"
  ON support_security_reports FOR SELECT
  USING (false);
