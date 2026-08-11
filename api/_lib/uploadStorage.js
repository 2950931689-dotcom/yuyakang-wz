import { createSupabaseAdmin, getSupabaseConfigError } from './supabaseServer.js';

export function getSupabaseProjectUrl() {
  return process.env.SUPABASE_URL?.trim().replace(/\/$/, '') || '';
}

/** Public object URL — never trust client-supplied publicUrl. */
export function buildPublicStorageUrl(bucket, objectPath) {
  const base = getSupabaseProjectUrl();
  if (!base || !bucket || !objectPath) return '';
  const encodedPath = objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function mapSupabaseError(error, fallback = 'Storage operation failed') {
  if (!error) return fallback;
  const message = String(error.message || fallback);
  const lower = message.toLowerCase();
  if (lower.includes('invalid') && lower.includes('key')) {
    return 'Storage unavailable';
  }
  if (lower.includes('bucket') && lower.includes('not found')) {
    return 'Storage bucket not found';
  }
  return message.slice(0, 160);
}

/**
 * Create signed upload URL via service role (backend only).
 */
export async function createSignedUpload(bucket, objectPath) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, status: 503, error: 'Storage unavailable', source: 'not_configured' };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(objectPath);

    if (error || !data?.token) {
      return {
        ok: false,
        status: 500,
        error: 'Failed to create upload signature',
      };
    }

    const publicUrl = buildPublicStorageUrl(bucket, objectPath);

    return {
      ok: true,
      bucket,
      path: data.path || objectPath,
      token: data.token,
      signedUrl: data.signedUrl || null,
      publicUrl,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      error: 'Failed to create upload signature',
    };
  }
}

/** Best-effort delete when media_assets insert fails after upload. */
export async function deleteStorageObject(bucket, objectPath) {
  try {
    const supabase = createSupabaseAdmin();
    await supabase.storage.from(bucket).remove([objectPath]);
    return true;
  } catch {
    return false;
  }
}

/** Optional existence check before complete. */
export async function storageObjectExists(bucket, objectPath) {
  try {
    const supabase = createSupabaseAdmin();
    const folder = objectPath.includes('/')
      ? objectPath.slice(0, objectPath.lastIndexOf('/'))
      : '';
    const name = objectPath.includes('/')
      ? objectPath.slice(objectPath.lastIndexOf('/') + 1)
      : objectPath;

    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: 100,
      search: name,
    });

    if (error) return { ok: false, exists: false };

    const exists = Array.isArray(data) && data.some((item) => item.name === name);
    return { ok: true, exists };
  } catch {
    return { ok: false, exists: false };
  }
}
