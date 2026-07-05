import {
  copyFile,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
  access,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.join(__dirname, "..");
export const DATA_DIR = path.join(SERVER_ROOT, "data");
export const BACKUPS_DIR = path.join(SERVER_ROOT, "backups");
export const UPLOADS_DIR = path.join(SERVER_ROOT, "uploads");
export const UPLOADS_TRASH_DIR = path.join(UPLOADS_DIR, "_trash");

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

export async function backupJson(filePath) {
  if (!(await fileExists(filePath))) return null;

  await mkdir(BACKUPS_DIR, { recursive: true });
  const ext = path.extname(filePath) || ".json";
  const base = path.basename(filePath, ext);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUPS_DIR, `${base}.${stamp}${ext}`);
  await copyFile(filePath, backupPath);
  return backupPath;
}

export async function writeJsonSafe(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });

  const tmpPath = `${filePath}.tmp`;
  const payload = `${JSON.stringify(data, null, 2)}\n`;

  try {
    await writeFile(tmpPath, payload, "utf8");
    await rename(tmpPath, filePath);
  } catch (err) {
    try {
      await unlink(tmpPath);
    } catch {
      /* ignore cleanup failure */
    }
    throw err;
  }
}

export async function updateJsonSection(filePath, sectionKey, sectionValue) {
  const current = await readJson(filePath, {});
  await backupJson(filePath);

  const next = {
    ...current,
    [sectionKey]: sectionValue,
    meta: {
      ...(current.meta ?? {}),
      updatedAt: new Date().toISOString(),
    },
  };

  await writeJsonSafe(filePath, next);
  return {
    section: next[sectionKey],
    updatedAt: next.meta.updatedAt,
  };
}

/** @deprecated Prefer writeJsonSafe + backupJson */
export async function writeJson(filePath, data, { backup = false } = {}) {
  if (backup && (await fileExists(filePath))) {
    await backupJson(filePath);
  }
  await writeJsonSafe(filePath, data);
}

export async function ensureDataFiles() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(BACKUPS_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(UPLOADS_TRASH_DIR, { recursive: true });

  const siteContentPath = path.join(DATA_DIR, "site-content.json");
  const siteExamplePath = path.join(DATA_DIR, "site-content.example.json");
  const bookingsPath = path.join(DATA_DIR, "bookings.json");

  if (!(await fileExists(siteContentPath)) && (await fileExists(siteExamplePath))) {
    await copyFile(siteExamplePath, siteContentPath);
  }

  if (!(await fileExists(bookingsPath))) {
    await writeJsonSafe(bookingsPath, []);
  }
}
