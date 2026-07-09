/**
 * Print Render Dashboard env vars from .env.local (secrets stay local).
 * Usage: node scripts/print-render-env.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const outPath = path.join(root, ".render-env.local.txt");

const RENDER_KEYS = [
  "NODE_ENV",
  "API_ONLY",
  "HOST",
  "PUBLIC_SITE_URL",
  "ALLOWED_ORIGINS",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
  "ADMIN_SESSION_MAX_AGE",
];

const DEFAULTS = {
  NODE_ENV: "production",
  API_ONLY: "true",
  HOST: "0.0.0.0",
  PUBLIC_SITE_URL: "https://www.yuyakang.top",
  ALLOWED_ORIGINS: "https://yuyakang.top,https://www.yuyakang.top",
  ADMIN_SESSION_MAX_AGE: "86400000",
};

function parseEnv(text) {
  const map = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return map;
}

if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy from .env.example and fill admin secrets.");
  process.exit(1);
}

const local = parseEnv(await readFile(envPath, "utf8"));
const lines = [
  "# Render Dashboard → yuyakang-api → Environment",
  "# Copy each KEY=VALUE into Render (do not commit this file)",
  "",
];

for (const key of RENDER_KEYS) {
  const value = local[key] ?? DEFAULTS[key];
  if (!value) {
    lines.push(`# MISSING: ${key}`);
    continue;
  }
  if (value.includes("replace-with")) {
    lines.push(`# INVALID placeholder — regenerate: ${key}`);
    continue;
  }
  lines.push(`${key}=${value}`);
}

lines.push("", "# After deploy verify:", "# https://<your-service>.onrender.com/api/health");
lines.push("# Custom domain: api.yuyakang.top");

await writeFile(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${path.relative(root, outPath)}`);
console.log("Open it and paste each variable into Render Dashboard → Environment.");
