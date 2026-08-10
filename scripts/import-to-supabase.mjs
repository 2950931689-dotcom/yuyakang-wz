#!/usr/bin/env node
/**
 * Import site content JSON into Supabase `site_content` (section rows).
 *
 * Default: dry-run (no writes). Pass --apply to upsert.
 *
 * Usage:
 *   node scripts/import-to-supabase.mjs --dry-run
 *   node scripts/import-to-supabase.mjs --dry-run --source server/data/site-content.json
 *   node scripts/import-to-supabase.mjs --apply
 *
 * Env (required only for --apply):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Never logs or embeds secrets. Never uploads media files.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_CANDIDATES = [
  "server/data/site-content.json",
  "src/data/site-content.mock.json",
  "server/data/site-content.example.json",
];

function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: true,
    source: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--apply") {
      args.apply = true;
      args.dryRun = false;
    } else if (a === "--dry-run") {
      args.dryRun = true;
      args.apply = false;
    } else if (a === "--source") {
      args.source = argv[i + 1] || null;
      i += 1;
    } else if (a.startsWith("--source=")) {
      args.source = a.slice("--source=".length) || null;
    } else if (a === "--help" || a === "-h") {
      args.help = true;
    }
  }

  return args;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadLocalEnv() {
  loadEnvFile(path.join(ROOT, ".env.local"));
  loadEnvFile(path.join(ROOT, ".env"));
}

function resolveSourcePath(explicit) {
  if (explicit) {
    const resolved = path.isAbsolute(explicit)
      ? explicit
      : path.resolve(ROOT, explicit);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Source file not found: ${resolved}`);
    }
    return resolved;
  }

  for (const rel of DEFAULT_CANDIDATES) {
    const candidate = path.resolve(ROOT, rel);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No content source found. Tried:\n${DEFAULT_CANDIDATES.map((c) => `  - ${c}`).join("\n")}`,
  );
}

function readContentJson(sourcePath) {
  let raw;
  try {
    raw = fs.readFileSync(sourcePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read source: ${error.message}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${sourcePath}: ${error.message}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Content root must be a JSON object");
  }

  return { data, rawBytes: Buffer.byteLength(raw, "utf8") };
}

function buildSectionRows(data, sourcePath) {
  const relativeSource = path.relative(ROOT, sourcePath).replace(/\\/g, "/");
  const now = new Date().toISOString();
  const rows = [];

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined; keep null/objects/arrays/primitives as-is in data_json
    if (value === undefined) continue;
    const json = JSON.stringify(value);
    rows.push({
      key,
      data_json: value,
      description: `Imported from ${relativeSource}`,
      updated_at: now,
      _byteSize: Buffer.byteLength(json, "utf8"),
    });
  }

  return rows;
}

function printDryRun({ sourcePath, rows, rawBytes }) {
  console.log("=== Supabase content import (DRY-RUN) ===");
  console.log(`sourcePath: ${path.relative(ROOT, sourcePath).replace(/\\/g, "/")}`);
  console.log(`sourceBytes: ${rawBytes}`);
  console.log(`detected top-level keys: ${rows.map((r) => r.key).join(", ")}`);
  console.log(`planned rows: ${rows.length}`);
  console.log("");
  for (const row of rows) {
    const type = Array.isArray(row.data_json)
      ? `array(${row.data_json.length})`
      : row.data_json === null
        ? "null"
        : typeof row.data_json;
    console.log(`  - ${row.key}  type=${type}  jsonBytes=${row._byteSize}`);
  }
  console.log("");
  console.log("no write performed");
  console.log("Tip: node scripts/import-to-supabase.mjs --apply");
}

function requireApplyEnv() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const missing = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    throw new Error(
      `Missing env for --apply: ${missing.join(", ")}. Set them in .env.local (do not commit).`,
    );
  }
  if (!url.startsWith("https://")) {
    throw new Error("SUPABASE_URL must start with https://");
  }
  return { url, key };
}

function writeBackup({ sourcePath, rows }) {
  const outDir = path.join(ROOT, "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z")
    .replace("T", "-");
  const backupPath = path.join(outDir, `supabase-import-backup-${stamp}.json`);
  const payload = {
    sourcePath: path.relative(ROOT, sourcePath).replace(/\\/g, "/"),
    importedAt: new Date().toISOString(),
    rowCount: rows.length,
    sectionKeys: rows.map((r) => r.key),
    sections: Object.fromEntries(rows.map((r) => [r.key, r.data_json])),
  };
  fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2), "utf8");
  return backupPath;
}

async function applyImport({ sourcePath, rows, url, key }) {
  const backupPath = writeBackup({ sourcePath, rows });
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const upsertRows = rows.map(({ key: sectionKey, data_json, description, updated_at }) => ({
    key: sectionKey,
    data_json,
    description,
    updated_at,
  }));

  const { data, error } = await supabase
    .from("site_content")
    .upsert(upsertRows, { onConflict: "key" })
    .select("key");

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  const keys = (data || []).map((row) => row.key);
  console.log("=== Supabase content import (APPLY) ===");
  console.log(`sourcePath: ${path.relative(ROOT, sourcePath).replace(/\\/g, "/")}`);
  console.log(`upsert row count: ${upsertRows.length}`);
  console.log(`upserted keys: ${keys.join(", ") || upsertRows.map((r) => r.key).join(", ")}`);
  console.log(`backup path: ${path.relative(ROOT, backupPath).replace(/\\/g, "/")}`);
  console.log("completed");
  return { backupPath, keys };
}

function printHelp() {
  console.log(`Usage:
  node scripts/import-to-supabase.mjs [--dry-run] [--source <path>]
  node scripts/import-to-supabase.mjs --apply [--source <path>]

Default source (first existing):
  ${DEFAULT_CANDIDATES.join("\n  ")}

--dry-run   Plan only (default). Does not require Supabase env.
--apply     Upsert into site_content. Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  loadLocalEnv();

  const sourcePath = resolveSourcePath(args.source);
  const { data, rawBytes } = readContentJson(sourcePath);
  const rows = buildSectionRows(data, sourcePath);

  if (!rows.length) {
    throw new Error("No top-level sections found to import");
  }

  if (!args.apply) {
    printDryRun({ sourcePath, rows, rawBytes });
    return;
  }

  const { url, key } = requireApplyEnv();
  await applyImport({ sourcePath, rows, url, key });
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
