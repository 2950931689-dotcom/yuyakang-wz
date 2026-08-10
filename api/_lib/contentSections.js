/** Section keys present in Supabase site_content (16 rows). */
export const ALLOWED_SECTION_KEYS = new Set([
  'meta',
  'siteSettings',
  'profile',
  'hero',
  'certificates',
  'services',
  'cases',
  'seo',
  'socialLinks',
  'featuredVideos',
  'tutorialSection',
  'i18n',
  'location',
  'serviceArea',
  'display',
  'homeSections',
]);

/** Top-level array sections — incoming payload replaces the entire array. */
export const ARRAY_SECTION_KEYS = new Set([
  'cases',
  'services',
  'certificates',
  'featuredVideos',
]);

export function isAllowedSectionKey(sectionKey) {
  return ALLOWED_SECTION_KEYS.has(sectionKey);
}

/**
 * Validate PATCH body — must match Express: { data: sectionData }.
 */
export function validateSectionPatchBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' };
  }

  if (body.data === undefined) {
    return { ok: false, error: 'Invalid request body' };
  }

  return { ok: true, data: body.data };
}

function deepMergeObjects(base, patch) {
  if (Array.isArray(patch)) return patch;
  if (patch === null || typeof patch !== 'object') return patch;
  if (base === null || typeof base !== 'object' || Array.isArray(base)) return patch;

  const result = { ...base };
  for (const key of Object.keys(patch)) {
    result[key] = deepMergeObjects(base[key], patch[key]);
  }
  return result;
}

/**
 * Merge incoming section data with current Supabase row.
 * - Array sections: full replace (matches useSectionEditor / useArraySectionEditor).
 * - Object sections: deep merge to avoid profile/siteSettings/socialLinks clobbering.
 */
export function mergeSectionData(sectionKey, current, incoming) {
  if (ARRAY_SECTION_KEYS.has(sectionKey)) {
    return incoming;
  }

  if (Array.isArray(incoming)) {
    return incoming;
  }

  if (incoming === null || typeof incoming !== 'object') {
    return incoming;
  }

  if (current === null || typeof current !== 'object' || Array.isArray(current)) {
    return incoming;
  }

  return deepMergeObjects(current, incoming);
}
