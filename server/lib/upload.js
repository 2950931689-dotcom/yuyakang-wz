import multer from "multer";
import path from "node:path";
import { UPLOADS_DIR } from "./jsonStore.js";

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/mp3",
  "application/pdf",
]);

const SIZE_LIMITS = {
  image: 20 * 1024 * 1024,
  video: 300 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  document: 50 * 1024 * 1024,
  other: 50 * 1024 * 1024,
};

export function getMediaCategory(mimeType) {
  if (!mimeType) return "other";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "document";
  return "other";
}

export function getMaxSizeForMime(mimeType) {
  return SIZE_LIMITS[getMediaCategory(mimeType)] ?? SIZE_LIMITS.other;
}

export function sanitizeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const safeBase = base || "file";
  const stamp = Date.now();
  return `${safeBase}-${stamp}${ext}`;
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename(_req, file, cb) {
    cb(null, sanitizeFilename(file.originalname));
  },
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error(`Unsupported file type: ${file.mimetype}`);
    err.code = "UNSUPPORTED_TYPE";
    return cb(err);
  }
  return cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 },
});

export function validateUploadedFile(file) {
  if (!file) {
    return { ok: false, error: "No file uploaded", status: 400 };
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return { ok: false, error: `Unsupported file type: ${file.mimetype}`, status: 400 };
  }

  const maxSize = getMaxSizeForMime(file.mimetype);
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return {
      ok: false,
      error: `File too large. Max ${mb}MB for ${getMediaCategory(file.mimetype)} files`,
      status: 400,
    };
  }

  return { ok: true };
}

export function buildUploadResponse(file) {
  const type = getMediaCategory(file.mimetype);
  const uploadedAt = new Date().toISOString();

  return {
    ok: true,
    file: {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      type,
      uploadedAt,
    },
  };
}
