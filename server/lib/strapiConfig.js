/** Strapi connection flags and config (server-only). */

export function isStrapiEnabled() {
  return process.env.STRAPI_ENABLED === "true";
}

export function isStrapiWriteEnabled() {
  return isStrapiEnabled() && process.env.STRAPI_WRITE_ENABLED === "true";
}

export function getStrapiConfig() {
  return {
    baseUrl: (process.env.STRAPI_BASE_URL || "http://localhost:1337").replace(/\/$/, ""),
    token: process.env.STRAPI_API_TOKEN || "",
    timeoutMs: Number(process.env.STRAPI_TIMEOUT_MS) || 5000,
  };
}

export function getStrapiPublicStatus() {
  return {
    enabled: isStrapiEnabled(),
    writeEnabled: isStrapiWriteEnabled(),
    baseUrl: isStrapiEnabled() ? getStrapiConfig().baseUrl : null,
    tokenConfigured: isStrapiEnabled() ? Boolean(getStrapiConfig().token) : false,
  };
}
