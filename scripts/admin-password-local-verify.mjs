/**
 * Local-only admin password vs scrypt hash diagnostic.
 * Does NOT print plaintext password or full hash.
 *
 * Usage:
 *   node scripts/admin-password-local-verify.mjs
 *
 * Optional flags:
 *   --hash-from-env     Use ADMIN_PASSWORD_HASH from .env.local (skip paste prompt)
 *   --username=admin    Username for verifyAdminCredentials (default: admin)
 */

import { createInterface } from 'node:readline/promises';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { stdin, stdout } from 'node:process';
import { loadScriptEnv } from './lib/load-script-env.mjs';
import {
  hashFingerprint,
  normalizePasswordHash,
  verifyAdminCredentials,
} from '../api/_lib/adminAuth.js';

const args = process.argv.slice(2);
const hashFromEnv = args.includes('--hash-from-env');
const usernameArg = args.find((a) => a.startsWith('--username='));
const usernameDefault = usernameArg ? usernameArg.slice('--username='.length).trim() : 'admin';

/** Mirrors api/_lib/adminAuth.js verifyPassword (private). */
function verifyPasswordDirect(password, storedHash) {
  if (!password || !storedHash) return false;

  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, saltB64, hashB64] = parts;
  try {
    const expected = Buffer.from(hashB64, 'base64');
    const actual = scryptSync(password, Buffer.from(saltB64, 'base64'), 64);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** Mirrors scripts/generate-admin-password-hash.mjs — sanity check only. */
function generateHashLikeScript(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString('base64')}:${hash.toString('base64')}`;
}

function safeHashMeta(rawHash) {
  const normalized = normalizePasswordHash(rawHash);
  return {
    hashPrefixIsScrypt: normalized.startsWith('scrypt:'),
    hashLength: normalized.length,
    hashPartsCount: normalized.split(':').length,
    hashHadWhitespace: rawHash.length !== rawHash.trim().length,
    hashHadQuotes:
      (rawHash.startsWith('"') && rawHash.endsWith('"')) ||
      (rawHash.startsWith("'") && rawHash.endsWith("'")),
    hashHadSpaceInBase64: rawHash.includes(' '),
    hashHadPlusInBase64: rawHash.includes('+'),
    normalizedHashLength: normalized.length,
    hashFingerprint: hashFingerprint(normalized) || 'none',
  };
}

async function main() {
  loadScriptEnv();

  stdout.write('\nAdmin password local verify (no secrets printed)\n\n');

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    stdout.write('Plaintext password (input visible in terminal): ');
    const password = await rl.question('');
    const passwordLength = password.length;

    let rawHash = '';
    let hashSource = 'paste';

    if (hashFromEnv && process.env.ADMIN_PASSWORD_HASH?.trim()) {
      rawHash = process.env.ADMIN_PASSWORD_HASH;
      hashSource = '.env.local';
    } else if (process.env.ADMIN_PASSWORD_HASH?.trim()) {
      const useEnv = (await rl.question('Use ADMIN_PASSWORD_HASH from .env.local? [Y/n]: ')).trim().toLowerCase();
      if (useEnv === '' || useEnv === 'y' || useEnv === 'yes') {
        rawHash = process.env.ADMIN_PASSWORD_HASH;
        hashSource = '.env.local';
      }
    }

    if (!rawHash) {
      rawHash = (await rl.question('Paste ADMIN_PASSWORD_HASH (scrypt:...): ')).trim();
      hashSource = 'paste';
    }

    const usernameInput = await rl.question(`Username for verifyAdminCredentials [${usernameDefault}]: `);
    const username = usernameInput.trim() || usernameDefault;

    const normalizedHash = normalizePasswordHash(rawHash);
    const hashMeta = safeHashMeta(rawHash);

    const directResult = verifyPasswordDirect(password, normalizedHash);

    process.env.ADMIN_USERNAME = username;
    process.env.ADMIN_PASSWORD_HASH = rawHash;
    const adminCredentialsResult = verifyAdminCredentials(username, password);

    const freshHash = generateHashLikeScript(password);
    const generateScriptRoundtrip = verifyPasswordDirect(password, freshHash);

    stdout.write('\n--- Safe result ---\n');
    console.log(
      JSON.stringify(
        {
          hashSource,
          usernameLength: username.length,
          passwordLength,
          ...hashMeta,
          localVerifyResult_direct: directResult,
          localVerifyResult_verifyAdminCredentials: adminCredentialsResult,
          generateScriptRoundtripOk: generateScriptRoundtrip,
          verifierDirect: 'verifyPasswordDirect (mirrors api/_lib/adminAuth.js verifyPassword)',
          verifierAdmin: 'verifyAdminCredentials (api/_lib/adminAuth.js)',
          generateLogic: 'scripts/generate-admin-password-hash.mjs (scryptSync, 64 bytes)',
          interpretation: directResult
            ? 'LOCAL_MATCH: plaintext matches this hash locally → if Vercel still fails, suspect env/deploy mismatch or wrong username on login.'
            : 'LOCAL_MISMATCH: plaintext does NOT match this hash locally → regenerate hash or recheck password before debugging Vercel.',
        },
        null,
        2
      )
    );
    stdout.write('\n');
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
