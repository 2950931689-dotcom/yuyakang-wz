import { getStrapiConfig, isStrapiEnabled } from "./strapiConfig.js";

export class StrapiClientError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "StrapiClientError";
    this.status = status;
    this.data = data;
  }
}

export { isStrapiEnabled, isStrapiWriteEnabled } from "./strapiConfig.js";

function buildUrl(path, params) {
  const { baseUrl } = getStrapiConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue;
      url.searchParams.append(key, String(value));
    }
  }

  return url;
}

async function strapiRequest(method, path, { params, body } = {}) {
  if (!isStrapiEnabled()) {
    throw new StrapiClientError("Strapi is not enabled (STRAPI_ENABLED !== true)");
  }

  const { token, timeoutMs } = getStrapiConfig();
  const url = buildUrl(path, params);
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!res.ok) {
      const message =
        data?.error?.message ||
        data?.error?.name ||
        (typeof data?.error === "string" ? data.error : null) ||
        `Strapi ${method} ${url.pathname} failed (${res.status})`;
      throw new StrapiClientError(message, { status: res.status, data });
    }

    return data;
  } catch (err) {
    if (err instanceof StrapiClientError) throw err;
    if (err?.name === "AbortError") {
      throw new StrapiClientError(`Strapi request timed out after ${timeoutMs}ms`);
    }
    throw new StrapiClientError(err?.message || "Strapi request failed");
  } finally {
    clearTimeout(timer);
  }
}

export function strapiGet(path, params) {
  return strapiRequest("GET", path, { params });
}

export function strapiPost(path, body) {
  return strapiRequest("POST", path, { body });
}

export function strapiPut(path, body) {
  return strapiRequest("PUT", path, { body });
}

export function strapiDelete(path) {
  return strapiRequest("DELETE", path);
}

/** Fetch all CommonTools entries from Strapi (sorted). */
export async function fetchStrapiCommonToolsRaw() {
  const response = await strapiGet("/api/common-tools", {
    "sort[0]": "sortOrder:asc",
    "pagination[pageSize]": "100",
  });
  return Array.isArray(response?.data) ? response.data : [];
}
