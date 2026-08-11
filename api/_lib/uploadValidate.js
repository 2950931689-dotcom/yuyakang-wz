import path from 'node:path';
import {
  ALLOWED_BUCKETS,
  ALLOWED_MIME_TYPES,
  bucketMatchesMime,
  getBucketForMime,
  getMaxSizeForMime,
  getMediaCategory,
} from './uploadConfig.js';

const PATH_SEGMENT_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function sanitizeStorageFilename(originalName) {
  const ext = path.extname(String(originalName || '')).toLowerCase();
  const base = path
    .basename(String(originalName || 'file'), ext)
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  const safeBase = base || 'file';
  return `${safeBase}${ext}`;
}

/**
 * Build Storage object path: cms/YYYY/MM/{timestamp}-{safeName} or documents/...
 */
export function buildStoragePath(originalFilename, mimeType) {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const safeName = sanitizeStorageFilename(originalFilename);
  const prefix = mimeType === 'application/pdf' ? 'documents' : 'cms';
  return `${prefix}/${yyyy}/${mm}/${timestamp}-${safeName}`;
}

export function isSafeStoragePath(storagePath) {
  if (!storagePath || typeof storagePath !== 'string') return false;
  if (storagePath.includes('\\')) return false;
  if (storagePath.includes('..')) return false;
  if (storagePath.startsWith('/')) return false;

  const segments = storagePath.split('/');
  if (segments.length < 3) return false;

  const [root] = segments;
  if (root !== 'cms' && root !== 'documents') return false;

  return segments.every((segment) => segment.length > 0 && PATH_SEGMENT_PATTERN.test(segment));
}

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

export function validateSignBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, error: 'Invalid request body' };
  }

  const filename = typeof body.filename === 'string' ? body.filename.trim() : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim().toLowerCase() : '';
  const size = parsePositiveInt(body.size);

  if (!filename) {
    return { ok: false, status: 400, error: 'filename is required' };
  }
  if (!mimeType) {
    return { ok: false, status: 400, error: 'mimeType is required' };
  }
  if (size == null) {
    return { ok: false, status: 400, error: 'size must be a positive number' };
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { ok: false, status: 400, error: 'Unsupported file type' };
  }

  const maxSize = getMaxSizeForMime(mimeType);
  if (size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return {
      ok: false,
      status: 400,
      error: `File too large. Max ${mb}MB for ${getMediaCategory(mimeType)} files`,
    };
  }

  const bucket = getBucketForMime(mimeType);
  if (!bucket) {
    return { ok: false, status: 400, error: 'Unsupported file type' };
  }

  const storagePath = buildStoragePath(filename, mimeType);
  const type = getMediaCategory(mimeType);
  const uploadedAt = new Date().toISOString();

  return {
    ok: true,
    data: {
      filename: sanitizeStorageFilename(filename),
      mimeType,
      size,
      bucket,
      path: storagePath,
      type,
      uploadedAt,
      context: typeof body.context === 'string' ? body.context.slice(0, 64) : null,
      usage: typeof body.usage === 'string' ? body.usage.slice(0, 64) : null,
    },
  };
}

export function validateCompleteBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, error: 'Invalid request body' };
  }

  const bucket = typeof body.bucket === 'string' ? body.bucket.trim() : '';
  const storagePath = typeof body.path === 'string' ? body.path.trim() : '';
  const filename = typeof body.filename === 'string' ? body.filename.trim() : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim().toLowerCase() : '';
  const size = parsePositiveInt(body.size);
  const type =
    typeof body.type === 'string' ? body.type.trim() : getMediaCategory(mimeType);

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return { ok: false, status: 400, error: 'Invalid bucket' };
  }
  if (!isSafeStoragePath(storagePath)) {
    return { ok: false, status: 400, error: 'Invalid storage path' };
  }
  if (!filename) {
    return { ok: false, status: 400, error: 'filename is required' };
  }
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return { ok: false, status: 400, error: 'Unsupported file type' };
  }
  if (size == null) {
    return { ok: false, status: 400, error: 'size must be a positive number' };
  }

  if (!bucketMatchesMime(bucket, mimeType)) {
    return { ok: false, status: 400, error: 'Bucket does not match mimeType' };
  }

  const maxSize = getMaxSizeForMime(mimeType);
  if (size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return {
      ok: false,
      status: 400,
      error: `File too large. Max ${mb}MB for ${getMediaCategory(mimeType)} files`,
    };
  }

  return {
    ok: true,
    data: {
      bucket,
      path: storagePath,
      filename: sanitizeStorageFilename(filename),
      mimeType,
      size,
      type,
      uploadedAt: new Date().toISOString(),
    },
  };
}
