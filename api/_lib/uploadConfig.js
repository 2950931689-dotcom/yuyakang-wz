/** MIME whitelist and size limits — mirrors server/lib/upload.js */

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/mp3',
  'audio/x-wav',
  'audio/aac',
  'audio/mp4',
  'audio/ogg',
  'application/pdf',
]);

export const ALLOWED_BUCKETS = new Set(['images', 'audio', 'videos']);

export const SIZE_LIMITS = {
  image: 20 * 1024 * 1024,
  video: 300 * 1024 * 1024,
  audio: 30 * 1024 * 1024,
  document: 50 * 1024 * 1024,
  other: 50 * 1024 * 1024,
};

export function getMediaCategory(mimeType) {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'document';
  return 'other';
}

export function getMaxSizeForMime(mimeType) {
  return SIZE_LIMITS[getMediaCategory(mimeType)] ?? SIZE_LIMITS.other;
}

/** Map MIME → Supabase Storage bucket. */
export function getBucketForMime(mimeType) {
  const category = getMediaCategory(mimeType);
  if (category === 'image' || category === 'document') return 'images';
  if (category === 'audio') return 'audio';
  if (category === 'video') return 'videos';
  return null;
}

/** Validate bucket matches MIME category. */
export function bucketMatchesMime(bucket, mimeType) {
  return getBucketForMime(mimeType) === bucket;
}
