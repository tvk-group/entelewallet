-- Updated support_security_reports for EnteleWALLET Lite upgrade
ALTER TABLE IF EXISTS support_security_reports
  ADD COLUMN IF NOT EXISTS report_type text,
  ADD COLUMN IF NOT EXISTS wallet_address text,
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- If table doesn't exist yet, create full schema
CREATE TABLE IF NOT EXISTS support_security_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL DEFAULT 'general_support',
  severity text,
  email text,
  subject text,
  message text,
  wallet_address text,
  url text,
  status text DEFAULT 'new',
  metadata jsonb DEFAULT '{}',
  created_at timestAMPTZ DEFAULT now()
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
