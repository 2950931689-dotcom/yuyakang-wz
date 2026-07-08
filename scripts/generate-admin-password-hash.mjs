import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/generate-admin-password-hash.mjs \"your-password\"");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const stored = `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;

console.log("Add to .env.local (do not commit):");
console.log("");
console.log(`ADMIN_PASSWORD_HASH=${stored}`);
console.log("");
