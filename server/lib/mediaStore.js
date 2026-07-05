import { mkdir, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR, UPLOADS_TRASH_DIR } from "./jsonStore.js";
import { getMediaCategory } from "./upload.js";

export async function listMediaFiles() {
  await mkdir(UPLOADS_DIR, { recursive: true });

  let entries;
  try {
    entries = await readdir(UPLOADS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const filePath = path.join(UPLOADS_DIR, entry.name);
    const info = await stat(filePath);

    files.push({
      filename: entry.name,
      url: `/uploads/${entry.name}`,
      type: inferTypeFromName(entry.name),
      size: info.size,
      uploadedAt: info.mtime.toISOString(),
    });
  }

  return files.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

function inferTypeFromName(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".webp": "image",
    ".gif": "image",
    ".mp4": "video",
    ".webm": "video",
    ".mp3": "audio",
    ".mpeg": "audio",
    ".wav": "audio",
    ".pdf": "document",
  };
  return map[ext] ?? "other";
}

export function resolveSafeUploadPath(filename) {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) {
    throw new Error("Invalid filename");
  }

  const resolved = path.resolve(UPLOADS_DIR, base);
  const uploadsRoot = path.resolve(UPLOADS_DIR);
  const relative = path.relative(uploadsRoot, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path traversal blocked");
  }

  return resolved;
}

export async function moveUploadToTrash(filename) {
  const sourcePath = resolveSafeUploadPath(filename);
  await mkdir(UPLOADS_TRASH_DIR, { recursive: true });

  const stamp = Date.now();
  const trashName = `${path.basename(filename, path.extname(filename))}-${stamp}${path.extname(filename)}`;
  const targetPath = path.join(UPLOADS_TRASH_DIR, trashName);

  await rename(sourcePath, targetPath);
  return trashName;
}

export { getMediaCategory };
