/**
 * Compute safe SHA-256 fingerprint for normalized ADMIN_PASSWORD_HASH.
 * Matches Vercel login failure header X-Auth-Diag-Hash-Fingerprint.
 *
 * Usage:
 *   node scripts/admin-hash-fingerprint.mjs
 *   node scripts/admin-hash-fingerprint.mjs --hash-from-env
 *
 * Paste scrypt hash when prompted. Only prints length/parts/fingerprint — never full hash.
 */

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { loadScriptEnv } from './lib/load-script-env.mjs';
import { hashFingerprint, normalizePasswordHash } from '../api/_lib/adminAuth.js';

const hashFromEnv = process.argv.includes('--hash-from-env');

async function main() {
  loadScriptEnv();

  const rl = createInterface({ input: stdin, output: stdout });
  let rawHash = '';

  try {
    if (hashFromEnv && process.env.ADMIN_PASSWORD_HASH?.trim()) {
      rawHash = process.env.ADMIN_PASSWORD_HASH;
    } else if (process.env.ADMIN_PASSWORD_HASH?.trim()) {
      const useEnv = (await rl.question('Use ADMIN_PASSWORD_HASH from .env.local? [Y/n]: ')).trim().toLowerCase();
      if (useEnv === '' || useEnv === 'y' || useEnv === 'yes') {
        rawHash = process.env.ADMIN_PASSWORD_HASH;
      }
    }

    if (!rawHash) {
      rawHash = (await rl.question('Paste ADMIN_PASSWORD_HASH (scrypt:...): ')).trim();
    }
  } finally {
    rl.close();
  }

  const normalized = normalizePasswordHash(rawHash);

  stdout.write('\n--- Safe fingerprint ---\n');
  console.log(
    JSON.stringify(
      {
        hashPrefixIsScrypt: normalized.startsWith('scrypt:'),
        hashLength: normalized.length,
        hashPartsCount: normalized.split(':').length,
        hashFingerprint: hashFingerprint(normalized) || 'none',
        algorithm: 'sha256(normalizedHash).hex.slice(0,12)',
        compareWith: 'X-Auth-Diag-Hash-Fingerprint on POST /api/admin/login 401 response',
      },
      null,
      2
    )
  );
  stdout.write('\n');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
