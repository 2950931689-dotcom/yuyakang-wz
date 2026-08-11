import path from 'node:path';
import { createSupabaseAdmin, getSupabaseConfigError, sanitizeTableError } from './supabaseServer.js';
import { deleteStorageObject } from './uploadStorage.js';

const MEDIA_SELECT =
  'id, bucket, path, url, type, title, mime_type, size, metadata, created_at, updated_at';

function mapInsertError(error) {
  const safe = sanitizeTableError(error);
  return safe || 'Failed to register media asset';
}

function basenameFromPath(storagePath) {
  if (!storagePath) return '';
  const idx = storagePath.lastIndexOf('/');
  return idx >= 0 ? storagePath.slice(idx + 1) : storagePath;
}

function filenameFromRow(row) {
  const metaName = row.metadata?.filename;
  if (typeof metaName === 'string' && metaName) return metaName;
  if (row.title) return row.title;

  const leaf = basenameFromPath(row.path);
  const dash = leaf.indexOf('-');
  if (dash > 0 && /^\d+$/.test(leaf.slice(0, dash))) {
    return leaf.slice(dash + 1);
  }
  return leaf;
}

/** Map media_assets row to AdminMediaPage file shape. */
export function mapMediaAssetRow(row) {
  const uploadedAt =
    (typeof row.metadata?.uploadedAt === 'string' && row.metadata.uploadedAt) ||
    row.updated_at ||
    row.created_at;

  return {
    id: row.id,
    filename: filenameFromRow(row),
    url: row.url,
    type: row.type || 'other',
    size: row.size ?? 0,
    mimeType: row.mime_type || null,
    uploadedAt,
    bucket: row.bucket,
    path: row.path,
  };
}

export function isSafeMediaFilename(filename) {
  if (!filename || typeof filename !== 'string') return false;
  const base = path.basename(filename);
  if (base !== filename || filename.includes('..')) return false;
  return base.length > 0 && base.length <= 200;
}

/**
 * List all rows from public.media_assets (newest first).
 */
export async function listMediaAssets() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, status: 503, error: 'Storage unavailable', source: 'not_configured' };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('media_assets')
      .select(MEDIA_SELECT)
      .order('updated_at', { ascending: false });

    if (error) {
      return { ok: false, status: 500, error: mapInsertError(error) };
    }

    return { ok: true, files: (data || []).map(mapMediaAssetRow) };
  } catch {
    return { ok: false, status: 500, error: 'Failed to list media' };
  }
}

/**
 * Resolve media_assets row by metadata.filename, title, or storage path suffix.
 */
export async function findMediaAssetByFilename(filename) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, status: 503, error: 'Storage unavailable', source: 'not_configured' };
  }

  try {
    const supabase = createSupabaseAdmin();

    const { data: byMeta } = await supabase
      .from('media_assets')
      .select(MEDIA_SELECT)
      .eq('metadata->>filename', filename)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (byMeta?.[0]) return { ok: true, row: byMeta[0] };

    const { data: byTitle } = await supabase
      .from('media_assets')
      .select(MEDIA_SELECT)
      .eq('title', filename)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (byTitle?.[0]) return { ok: true, row: byTitle[0] };

    const escaped = filename.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
    const { data: byPath } = await supabase
      .from('media_assets')
      .select(MEDIA_SELECT)
      .like('path', `%-${escaped}`)
      .order('updated_at', { ascending: false })
      .limit(10);

    const pathMatch = (byPath || []).find(
      (row) => row.path.endsWith(`-${filename}`) || basenameFromPath(row.path) === filename
    );
    if (pathMatch) return { ok: true, row: pathMatch };

    return { ok: false, status: 404, error: 'Media not found' };
  } catch {
    return { ok: false, status: 500, error: 'Failed to resolve media asset' };
  }
}

/**
 * Delete Storage object and media_assets row (hard delete, not trash).
 */
export async function deleteMediaAssetByFilename(filename) {
  const found = await findMediaAssetByFilename(filename);
  if (!found.ok) return found;

  const { row } = found;
  const storageDeleted = await deleteStorageObject(row.bucket, row.path);
  if (!storageDeleted) {
    return { ok: false, status: 500, error: 'Failed to delete storage object' };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('media_assets').delete().eq('id', row.id);

    if (error) {
      return { ok: false, status: 500, error: mapInsertError(error) };
    }

    return { ok: true, deleted: true, id: row.id };
  } catch {
    return { ok: false, status: 500, error: 'Failed to delete media asset' };
  }
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
