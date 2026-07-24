#!/usr/bin/env node
/**
 * Enforceable security release gate for EnteleWALLET.
 * Fails the build when dangerous features are enabled or bypassable via env vars.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const dangerousFlags = [
  'ENABLE_CREATE_WALLET',
  'ENABLE_IMPORT_WALLET',
  'ENABLE_PRIVATE_KEY_STORAGE',
  'ENABLE_SEND_TOKENS',
  'ENABLE_SWAP',
  'ENABLE_MOBILE_WALLET',
  'ENABLE_BROWSER_EXTENSION',
  'ENABLE_ACCOUNT_ABSTRACTION',
  'ENABLE_WALLET_ONLY_LOGIN',
];

const errors = [];
const warnings = [];
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function read(path) {
  return readFileSync(path, 'utf8');
}

function walkFiles(dir, extensions, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
      walkFiles(full, extensions, files);
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

// 1. Dangerous flags must be false in source
const featuresPath = join(root, 'packages/config/src/features.ts');
const featuresContent = read(featuresPath);

for (const flag of dangerousFlags) {
  const enabledRegex = new RegExp(`${flag}:\\s*true`);
  if (enabledRegex.test(featuresContent)) {
    errors.push(`Dangerous flag ${flag} is enabled in features.ts`);
  }
}

// 2. Dangerous flags must not be env-overridable
if (!featuresContent.includes('DANGEROUS_FEATURE_FLAGS')) {
  errors.push('features.ts must define DANGEROUS_FEATURE_FLAGS');
}
if (!featuresContent.includes('isDangerousFeatureFlag')) {
  errors.push('features.ts must gate env overrides with isDangerousFeatureFlag()');
}
if (
  /NEXT_PUBLIC_\$\{flag\}/.test(featuresContent) &&
  !featuresContent.includes('isDangerousFeatureFlag(flag)')
) {
  errors.push('isFeatureEnabled() must not allow env override for dangerous flags');
}

// 3. .env examples must not enable dangerous flags
for (const envFile of ['.env.example', 'apps/web/.env.example']) {
  const envPath = join(root, envFile);
  try {
    const envContent = read(envPath);
    for (const flag of dangerousFlags) {
      const envRegex = new RegExp(`NEXT_PUBLIC_${flag}=true`, 'i');
      if (envRegex.test(envContent)) {
        errors.push(`${envFile} sets NEXT_PUBLIC_${flag}=true`);
      }
    }
  } catch {
    warnings.push(`Could not read ${envFile}`);
  }
}

// 4. No direct dangerous env reads bypassing isFeatureEnabled
const sourceFiles = walkFiles(join(root, 'apps/web/src'), ['.ts', '.tsx']);
const configFiles = walkFiles(join(root, 'packages/config/src'), ['.ts']);
const allSource = [...sourceFiles, ...configFiles];

for (const file of allSource) {
  const content = read(file);
  for (const flag of dangerousFlags) {
    if (content.includes(`process.env.NEXT_PUBLIC_${flag}`)) {
      errors.push(`${file} reads NEXT_PUBLIC_${flag} directly — use isFeatureEnabled()`);
    }
  }
}

// 5. Forbidden implementation patterns in app source
const forbiddenPatterns = [/seed.?phrase/i, /private.?key.?import/i, /mnemonic/i];
const webSrc = join(root, 'apps/web/src');

for (const pattern of forbiddenPatterns) {
  for (const file of walkFiles(webSrc, ['.ts', '.tsx'])) {
    if (file.includes('security') || file.includes('warning') || file.includes('legal')) continue;
    const content = read(file);
    if (pattern.test(content)) {
      warnings.push(`Pattern ${pattern} found in ${file} (review manually)`);
    }
  }
}

// 6. Production nonce storage must fail closed
const nonceServerPath = join(root, 'apps/web/src/lib/wallet-nonce-server.ts');
try {
  const nonceContent = read(nonceServerPath);
  if (!nonceContent.includes('allowMemoryNonceStore')) {
    errors.push('wallet-nonce-server.ts must gate memory fallback with allowMemoryNonceStore()');
  }
  if (!nonceContent.includes('isProductionRuntime')) {
    errors.push(
      'wallet-nonce-server.ts must fail closed in production when Supabase is unavailable',
    );
  }
} catch {
  errors.push('wallet-nonce-server.ts not found');
}

// 7. Distributed rate limiting must fail closed in production
const rateLimitPath = join(root, 'apps/web/src/lib/rate-limit.ts');
try {
  const rateLimitContent = read(rateLimitPath);
  if (!rateLimitContent.includes('RateLimitStorageUnavailableError')) {
    errors.push('rate-limit.ts must define RateLimitStorageUnavailableError');
  }
  if (!rateLimitContent.includes('increment_rate_limit_bucket')) {
    errors.push('rate-limit.ts must use Supabase increment_rate_limit_bucket RPC');
  }
  if (!rateLimitContent.includes('deriveRateLimitBucketKey')) {
    errors.push('rate-limit.ts must HMAC-derive bucket keys');
  }
} catch {
  errors.push('rate-limit.ts not found');
}

// 8. Verification session must not reuse Supabase service role key
const verificationSessionPath = join(root, 'apps/web/src/lib/verification-session.ts');
try {
  const verificationContent = read(verificationSessionPath);
  if (verificationContent.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    errors.push('verification-session.ts must not fall back to SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!verificationContent.includes('VerificationSecretUnavailableError')) {
    errors.push('verification-session.ts must fail closed without WALLET_VERIFICATION_SECRET');
  }
  if (!verificationContent.includes('sessionId')) {
    errors.push('verification-session.ts must include sessionId in signed payload');
  }
} catch {
  errors.push('verification-session.ts not found');
}

// 9. Preview origins must not accept wildcard vercel.app
const siweSecurityPath = join(root, 'apps/web/src/lib/siwe-api-security.ts');
try {
  const siweContent = read(siweSecurityPath);
  if (siweContent.includes("endsWith('.vercel.app')")) {
    errors.push('siwe-api-security.ts must not accept all *.vercel.app origins');
  }
  if (!siweContent.includes('PREVIEW_ORIGIN_ALLOWLIST')) {
    errors.push('siwe-api-security.ts must support PREVIEW_ORIGIN_ALLOWLIST');
  }
} catch {
  errors.push('siwe-api-security.ts not found');
}

// 10. CSP reporting endpoint must exist
const cspReportPath = join(root, 'apps/web/src/app/api/security/csp-report/route.ts');
try {
  read(cspReportPath);
} catch {
  errors.push('CSP report endpoint missing at apps/web/src/app/api/security/csp-report/route.ts');
}

// 11. Node.js 22 runtime
if (!packageJson.engines?.node?.includes('22')) {
  errors.push('package.json engines.node must require Node.js 22');
}

// 12. Test command must not be a placeholder
if (
  typeof packageJson.scripts?.test === 'string' &&
  packageJson.scripts.test.includes('placeholder')
) {
  errors.push('Root test script is still a placeholder');
}

if (errors.length) {
  console.error('❌ Security check failed:\n');
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn('⚠️  Security warnings:\n');
  for (const warning of warnings) console.warn(`  • ${warning}`);
}

console.log('✅ Security check passed — release gates enforced.');
process.exit(0);
