import { createSupabaseAdmin, getSupabaseConfigError, sanitizeTableError } from './supabaseServer.js';
import { deleteStorageObject } from './uploadStorage.js';

function mapInsertError(error) {
  const safe = sanitizeTableError(error);
  return safe || 'Failed to register media asset';
}

/**
 * Insert row into public.media_assets.
 */
export async function insertMediaAsset({
  type,
  title,
  url,
  thumbnailUrl,
  bucket,
  path,
  mimeType,
  size,
  metadata,
}) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, status: 503, error: 'Storage unavailable', source: 'not_configured' };
  }

  try {
    const supabase = createSupabaseAdmin();
    const now = new Date().toISOString();

    const row = {
      type: type || null,
      title: title || null,
      url,
      thumbnail_url: thumbnailUrl || null,
      bucket,
      path,
      mime_type: mimeType,
      size,
      metadata: metadata ?? {},
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('media_assets')
      .insert(row)
      .select('id, bucket, path')
      .single();

    if (error) {
      return {
        ok: false,
        status: 500,
        error: mapInsertError(error),
      };
    }

    return {
      ok: true,
      asset: {
        id: data.id,
        bucket: data.bucket,
        path: data.path,
      },
    };
  } catch {
    return {
      ok: false,
      status: 500,
      error: 'Failed to register media asset',
    };
  }
}

/**
 * Complete upload: insert media_assets; rollback Storage object on failure.
 */
export async function completeMediaUpload(payload, { context, usage } = {}) {
  const insertResult = await insertMediaAsset({
    type: payload.type,
    title: payload.filename,
    url: payload.publicUrl,
    thumbnailUrl: payload.type === 'image' ? payload.publicUrl : null,
    bucket: payload.bucket,
    path: payload.path,
    mimeType: payload.mimeType,
    size: payload.size,
    metadata: {
      filename: payload.filename,
      uploadedAt: payload.uploadedAt,
      source: 'signed-upload',
      ...(context ? { context } : {}),
      ...(usage ? { usage } : {}),
    },
  });

  if (!insertResult.ok) {
    await deleteStorageObject(payload.bucket, payload.path);
    return insertResult;
  }

  return insertResult;
}
