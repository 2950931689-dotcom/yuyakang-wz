/** Normalize Strapi CommonTools → site-content.siteSettings.commonTools shape. */

function unwrapEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  if (entry.attributes && typeof entry.attributes === "object") {
    return {
      id: entry.id,
      documentId: entry.documentId,
      ...entry.attributes,
    };
  }
  return entry;
}

export function normalizeCommonTool(entry) {
  const raw = unwrapEntry(entry);
  if (!raw) return null;

  const documentId = raw.documentId ? String(raw.documentId) : null;
  const legacyId = raw.legacyId ? String(raw.legacyId) : null;
  const numericId = raw.id != null ? String(raw.id) : null;

  return {
    id: documentId || legacyId || numericId || "",
    title: String(raw.title ?? "").trim(),
    description: String(raw.description ?? "").trim(),
    url: String(raw.url ?? "").trim(),
    category: String(raw.category ?? "").trim(),
    enabled: raw.enabled !== false,
    sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : 0,
    openInNewTab: raw.openInNewTab !== false,
    isFeatured: !!raw.isFeatured,
  };
}

export function normalizeCommonTools(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map(normalizeCommonTool)
    .filter(Boolean)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((tool, index) => ({
      ...tool,
      sortOrder: index + 1,
    }));
}

export function buildContentWithStrapiCommonTools(jsonContent, strapiEntries) {
  const content =
    jsonContent && typeof jsonContent === "object"
      ? JSON.parse(JSON.stringify(jsonContent))
      : {};

  if (!content.siteSettings || typeof content.siteSettings !== "object") {
    content.siteSettings = {};
  }

  const allTools = normalizeCommonTools(strapiEntries);
  content.siteSettings.commonTools = allTools.filter((tool) => tool.enabled !== false);
  return content;
}
