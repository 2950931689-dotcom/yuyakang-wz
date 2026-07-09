import {
  fetchStrapiCommonToolsRaw,
  strapiPost,
  strapiPut,
} from "./strapiClient.js";
import { normalizeCommonTool, normalizeCommonTools } from "./strapiAdapter.js";

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

function normalizeIncomingTool(tool, index) {
  return {
    id: String(tool?.id ?? "").trim(),
    title: String(tool?.title ?? "").trim(),
    description: String(tool?.description ?? "").trim(),
    url: String(tool?.url ?? "").trim(),
    category: String(tool?.category ?? "").trim(),
    enabled: tool?.enabled !== false,
    sortOrder: Number.isFinite(Number(tool?.sortOrder)) ? Number(tool.sortOrder) : index + 1,
    openInNewTab: tool?.openInNewTab !== false,
    isFeatured: !!tool?.isFeatured,
  };
}

function findExistingEntry(existingEntries, tool) {
  const toolId = tool.id;
  if (!toolId) return null;

  return (
    existingEntries.find((entry) => {
      const raw = unwrapEntry(entry);
      if (!raw) return false;
      return (
        raw.documentId === toolId ||
        raw.legacyId === toolId ||
        String(raw.id) === toolId
      );
    }) ?? null
  );
}

function toStrapiPayload(tool) {
  return {
    title: tool.title,
    description: tool.description,
    url: tool.url,
    category: tool.category,
    enabled: tool.enabled,
    sortOrder: tool.sortOrder,
    openInNewTab: tool.openInNewTab,
    isFeatured: tool.isFeatured,
    legacyId: tool.id || null,
  };
}

/**
 * Sync admin CommonTools array → Strapi.
 * Delete in admin = enabled:false in Strapi (MVP soft-delete).
 */
export async function syncCommonToolsToStrapi(incomingTools) {
  if (!Array.isArray(incomingTools)) {
    throw new Error("tools must be an array");
  }

  const normalizedIncoming = incomingTools.map(normalizeIncomingTool);
  const existingRaw = await fetchStrapiCommonToolsRaw();
  const processedDocumentIds = new Set();

  for (let i = 0; i < normalizedIncoming.length; i += 1) {
    const tool = { ...normalizedIncoming[i], sortOrder: i + 1 };
    const existing = findExistingEntry(existingRaw, tool);
    const payload = { data: toStrapiPayload(tool) };

    if (existing?.documentId) {
      await strapiPut(`/api/common-tools/${existing.documentId}`, payload);
      processedDocumentIds.add(String(existing.documentId));
    } else {
      const created = await strapiPost("/api/common-tools", payload);
      const createdId = created?.data?.documentId || unwrapEntry(created?.data)?.documentId;
      if (createdId) processedDocumentIds.add(String(createdId));
    }
  }

  for (const entry of existingRaw) {
    const raw = unwrapEntry(entry);
    if (!raw?.documentId) continue;
    if (processedDocumentIds.has(String(raw.documentId))) continue;

    await strapiPut(`/api/common-tools/${raw.documentId}`, {
      data: {
        ...toStrapiPayload(normalizeCommonTool(raw)),
        enabled: false,
      },
    });
  }

  const latest = await fetchStrapiCommonToolsRaw();
  return {
    tools: normalizeCommonTools(latest),
    strategy: "create-update-soft-disable",
  };
}

export function validateCommonToolsPayload(tools) {
  if (!Array.isArray(tools)) {
    return { ok: false, error: "tools must be an array" };
  }

  for (let i = 0; i < tools.length; i += 1) {
    const tool = tools[i];
    if (!String(tool?.title ?? "").trim()) {
      return { ok: false, error: `第 ${i + 1} 项缺少工具名称` };
    }
    if (!String(tool?.url ?? "").trim()) {
      return { ok: false, error: `第 ${i + 1} 项缺少链接地址` };
    }
  }

  return { ok: true };
}
