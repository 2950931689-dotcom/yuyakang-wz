import { copyFile, mkdir, readFile, rename, unlink, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.join(__dirname, "..");
export const DATA_DIR = path.join(SERVER_ROOT, "data");
export const BACKUPS_DIR = path.join(SERVER_ROOT, "backups");

export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(filePath, fallback = null) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (fallback !== null) return fallback;
    throw err;
  }
}

export async function writeJson(filePath, data, { backup = false } = {}) {
  await mkdir(path.dirname(filePath), { recursive: true });

  if (backup && (await fileExists(filePath))) {
    await mkdir(BACKUPS_DIR, { recursive: true });
    const base = path.basename(filePath, ".json");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await copyFile(filePath, path.join(BACKUPS_DIR, `${base}.${stamp}.json`));
  }

  const tmpPath = `${filePath}.tmp`;
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(tmpPath, payload, "utf8");
  await rename(tmpPath, filePath);
}

export async function ensureDataFiles() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(BACKUPS_DIR, { recursive: true });

  const siteContentPath = path.join(DATA_DIR, "site-content.json");
  const siteExamplePath = path.join(DATA_DIR, "site-content.example.json");
  const bookingsPath = path.join(DATA_DIR, "bookings.json");

  if (!(await fileExists(siteContentPath)) && (await fileExists(siteExamplePath))) {
    await copyFile(siteExamplePath, siteContentPath);
  }

  if (!(await fileExists(bookingsPath))) {
    await writeJson(bookingsPath, [], { backup: false });
  }
}
