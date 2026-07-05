#!/usr/bin/env node
/**
 * Security check placeholder for EnteleWALLET Lite.
 * Verifies dangerous feature flags remain disabled.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const featuresPath = join(__dirname, '../packages/config/src/features.ts');
const content = readFileSync(featuresPath, 'utf8');

const dangerousFlags = [
  'ENABLE_CREATE_WALLET',
  'ENABLE_IMPORT_WALLET',
  'ENABLE_PRIVATE_KEY_STORAGE',
  'ENABLE_SEND_TOKENS',
  'ENABLE_SWAP',
  'ENABLE_MOBILE_WALLET',
  'ENABLE_BROWSER_EXTENSION',
  'ENABLE_ACCOUNT_ABSTRACTION',
];

let failed = false;

for (const flag of dangerousFlags) {
  const regex = new RegExp(`${flag}:\\s*true`);
  if (regex.test(content)) {
    console.error(`❌ Dangerous flag ${flag} is enabled!`);
    failed = true;
  }
}

const forbiddenPatterns = [
  /seed.?phrase/i,
  /private.?key.?import/i,
  /mnemonic/i,
];

// Only check apps/web source, not docs or comments about what's forbidden
const webSrc = join(__dirname, '../apps/web/src');
try {
  const { execSync } = await import('child_process');
  for (const pattern of forbiddenPatterns) {
    try {
      const result = execSync(`grep -rl "${pattern.source}" ${webSrc} --include="*.ts" --include="*.tsx" 2>/dev/null || true`, { encoding: 'utf8' });
      const files = result.trim().split('\n').filter(Boolean);
      const suspicious = files.filter((f) => !f.includes('security') && !f.includes('warning') && !f.includes('legal'));
      if (suspicious.length) {
        console.warn(`⚠️  Pattern ${pattern} found in: ${suspicious.join(', ')} (review manually)`);
      }
    } catch {
      // grep not finding matches is fine
    }
  }
} catch {
  // apps/web may not exist yet during early setup
}

if (failed) {
  console.error('\nSecurity check failed.');
  process.exit(1);
}

console.log('✅ Security check passed — dangerous feature flags are disabled.');
process.exit(0);
