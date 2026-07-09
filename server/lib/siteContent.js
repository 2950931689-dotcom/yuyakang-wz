import { readJson } from "./jsonStore.js";
import { isStrapiEnabled } from "./strapiConfig.js";
import { fetchStrapiCommonToolsRaw } from "./strapiClient.js";
import { buildContentWithStrapiCommonTools } from "./strapiAdapter.js";

/** Read JSON CMS and optionally merge Strapi CommonTools (Round 6.1). */
export async function readSiteContent(siteContentPath) {
  const content = await readJson(siteContentPath);

  if (!isStrapiEnabled()) {
    return content;
  }

  try {
    const strapiTools = await fetchStrapiCommonToolsRaw();
    return buildContentWithStrapiCommonTools(content, strapiTools);
  } catch (err) {
    console.warn("[strapi] CommonTools read failed, fallback to JSON CMS:", err.message);
    return content;
  }
}
