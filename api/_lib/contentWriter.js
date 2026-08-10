import { createSupabaseAdmin, getSupabaseConfigError } from './supabaseServer.js';
import {
  isAllowedSectionKey,
  mergeSectionData,
  validateSectionPatchBody,
} from './contentSections.js';

/**
 * Read a single section row from Supabase.
 */
export async function readSectionFromSupabase(sectionKey) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_content')
      .select('key, data_json, updated_at')
      .eq('key', sectionKey)
      .maybeSingle();

    if (error) {
      return { ok: false, reason: 'supabase_error', message: error.message };
    }

    return {
      ok: true,
      data: data?.data_json ?? null,
      updatedAt: data?.updated_at ?? null,
    };
  } catch (err) {
    return {
      ok: false,
      reason: 'supabase_error',
      message: err?.message || 'Supabase read failed',
    };
  }
}

async function touchMetaUpdatedAt(supabase) {
  const { data: metaRow } = await supabase
    .from('site_content')
    .select('data_json')
    .eq('key', 'meta')
    .maybeSingle();

  const currentMeta =
    metaRow?.data_json && typeof metaRow.data_json === 'object' && !Array.isArray(metaRow.data_json)
      ? metaRow.data_json
      : {};

  const updatedAt = new Date().toISOString();
  await supabase.from('site_content').upsert(
    {
      key: 'meta',
      data_json: { ...currentMeta, updatedAt },
      description: 'Updated by admin API',
      updated_at: updatedAt,
    },
    { onConflict: 'key' }
  );

  return updatedAt;
}

/**
 * Write one content section to Supabase (upsert site_content row).
 */
export async function writeContentSection(sectionKey, body) {
  if (!isAllowedSectionKey(sectionKey)) {
    return { ok: false, status: 400, error: 'Invalid content section' };
  }

  const validation = validateSectionPatchBody(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return {
      ok: false,
      status: 503,
      error: 'Content write unavailable',
      source: 'not_configured',
    };
  }

  try {
    const supabase = createSupabaseAdmin();
    const currentResult = await readSectionFromSupabase(sectionKey);
    if (!currentResult.ok) {
      return {
        ok: false,
        status: 503,
        error: 'Content write unavailable',
        source: currentResult.reason === 'not_configured' ? 'not_configured' : 'supabase_error',
      };
    }

    const merged = mergeSectionData(sectionKey, currentResult.data, validation.data);
    const updatedAt = new Date().toISOString();

    const { error } = await supabase.from('site_content').upsert(
      {
        key: sectionKey,
        data_json: merged,
        description: 'Updated by admin API',
        updated_at: updatedAt,
      },
      { onConflict: 'key' }
    );

    if (error) {
      return {
        ok: false,
        status: 503,
        error: 'Content write unavailable',
        source: 'supabase_error',
      };
    }

    await touchMetaUpdatedAt(supabase);

    return {
      ok: true,
      sectionKey,
      data: merged,
      updatedAt,
    };
  } catch {
    return {
      ok: false,
      status: 503,
      error: 'Content write unavailable',
      source: 'supabase_error',
    };
  }
}
