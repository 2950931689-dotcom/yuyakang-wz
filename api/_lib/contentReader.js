import { createSupabaseAdmin, getSupabaseConfigError } from './supabaseServer.js';
import { isValidSiteContent, loadFallbackContent } from './contentFallback.js';

/**
 * Assemble full site content from site_content rows.
 * content[row.key] = row.data_json
 */
export function assembleContentFromRows(rows) {
  const content = {};
  for (const row of rows) {
    if (!row?.key) continue;
    content[row.key] = row.data_json;
  }
  return content;
}

/**
 * Read all sections from Supabase site_content.
 * @returns {Promise<{ ok: true, content: object, sectionCount: number } | { ok: false, reason: string }>}
 */
export async function readContentFromSupabase() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('site_content')
      .select('key, data_json, updated_at');

    if (error) {
      return { ok: false, reason: 'supabase_error', message: error.message };
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { ok: false, reason: 'supabase_empty' };
    }

    const content = assembleContentFromRows(data);
    if (!isValidSiteContent(content)) {
      return { ok: false, reason: 'supabase_invalid' };
    }

    return {
      ok: true,
      content,
      sectionCount: data.length,
    };
  } catch (err) {
    return {
      ok: false,
      reason: 'supabase_error',
      message: err?.message || 'Supabase query failed',
    };
  }
}

/**
 * Load site content: Supabase first, then local fallback files.
 * @returns {Promise<{
 *   content?: object,
 *   source?: 'supabase' | 'fallback',
 *   sectionCount?: number,
 *   errorSource?: 'not_configured' | 'supabase_error' | 'error'
 * }>}
 */
export async function loadSiteContent() {
  const supabaseResult = await readContentFromSupabase();

  if (supabaseResult.ok) {
    return {
      content: supabaseResult.content,
      source: 'supabase',
      sectionCount: supabaseResult.sectionCount,
    };
  }

  const fallback = loadFallbackContent();
  if (fallback) {
    const sectionCount = Object.keys(fallback.content).length;
    return {
      content: fallback.content,
      source: 'fallback',
      sectionCount,
    };
  }

  const errorSource =
    supabaseResult.reason === 'not_configured' ? 'not_configured' : 'supabase_error';

  return { errorSource };
}
