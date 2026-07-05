#!/usr/bin/env node
/**
 * i18n completeness checker for EnteleWALLET Lite.
 * Compares all locale files against English base.
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../packages/i18n/messages');

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValue(obj, key) {
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));
const enKeys = flattenKeys(en);
const files = readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');

let hasErrors = false;
const invalidPatterns = [/^TODO/i, /^TRANSLATE/i, /lorem ipsum/i, /^$/];

console.log(`Checking ${files.length} locale files against ${enKeys.length} English keys...\n`);

for (const file of files) {
  const locale = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(messagesDir, file), 'utf8'));
  const localeKeys = flattenKeys(data);
  const missing = enKeys.filter((k) => !localeKeys.includes(k));
  const extra = localeKeys.filter((k) => !enKeys.includes(k));
  const empty = enKeys.filter((k) => {
    const val = getValue(data, k);
    return val === '' || val === undefined || val === null;
  });
  const invalid = enKeys.filter((k) => {
    const val = getValue(data, k);
    return typeof val === 'string' && invalidPatterns.some((p) => p.test(val));
  });

  if (missing.length || extra.length || empty.length || invalid.length) {
    hasErrors = true;
    console.error(`❌ ${locale}:`);
    if (missing.length) console.error(`  Missing keys (${missing.length}): ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
    if (extra.length) console.error(`  Extra keys (${extra.length}): ${extra.slice(0, 5).join(', ')}`);
    if (empty.length) console.error(`  Empty values (${empty.length}): ${empty.slice(0, 5).join(', ')}`);
    if (invalid.length) console.error(`  Invalid values (${invalid.length}): ${invalid.slice(0, 5).join(', ')}`);
  } else {
    console.log(`✅ ${locale}`);
  }
}

if (hasErrors) {
  console.error('\ni18n check failed.');
  process.exit(1);
}

console.log('\nAll locale files are valid.');
process.exit(0);
