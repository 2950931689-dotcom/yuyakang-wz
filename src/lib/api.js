function resolveApiBase() {
  // Production (Vercel): same-origin /api/* — ignore VITE_API_URL at build time
  if (import.meta.env.PROD) {
    return "";
  }

  const envBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return envBase;
}

const API_URL = resolveApiBase();

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class AuthRequiredError extends ApiError {
  constructor(message = "登录已过期，请重新登录", data = null) {
    super(message, 401, data);
    this.name = "AuthRequiredError";
  }
}

async function parseResponse(res, { admin = false } = {}) {
  let data = null;
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";

  if (res.ok && contentType.includes("text/html")) {
    throw new ApiError("Unexpected HTML response from API", res.status);
  }

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    if (admin && res.status === 401) {
      throw new AuthRequiredError(data?.message || data?.error || "登录已过期，请重新登录", data);
    }
    throw new ApiError(
      data?.error || data?.message || `Request failed (${res.status})`,
      res.status,
      data
    );
  }

  return data;
}

const REQUEST_TIMEOUT_MS = 10_000;
const UPLOAD_SIGN_TIMEOUT_MS = 30_000;
const UPLOAD_COMPLETE_TIMEOUT_MS = 30_000;
/** Large video uploads — storage PUT bypasses Vercel body limit. */
const UPLOAD_STORAGE_TIMEOUT_MS = 30 * 60 * 1000;

async function uploadToSignedStorage(signedUrl, file) {
  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_STORAGE_TIMEOUT_MS);

  try {
    const res = await fetch(signedUrl, {
      method: "PUT",
      body: form,
      headers: { "x-upsert": "false" },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new ApiError("Storage upload failed", res.status);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError("Storage upload timed out", 408);
    }
    throw new ApiError("Storage upload failed", 502);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request(path, options = {}, { admin = false, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const headers = { ...(options.headers ?? {}) };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = API_URL ? `${API_URL}${path}` : path;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: admin ? "include" : "same-origin",
      signal: options.signal ?? controller.signal,
    });

    return parseResponse(res, { admin });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function resolveUploadUrl(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) {
    return API_URL ? `${API_URL}${url}` : url;
  }
  return url;
}

export async function checkHealth() {
  return request("/api/health");
}

export async function fetchContent() {
  return request("/api/content");
}

export const getContent = fetchContent;

export async function adminLogin(username, password) {
  return request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  }, { admin: true });
}

export async function adminMe() {
  return request("/api/admin/me", {}, { admin: true });
}

export async function adminLogout() {
  return request("/api/admin/logout", { method: "POST" }, { admin: true });
}

export async function saveContent(content) {
  return request("/api/content", {
    method: "PUT",
    body: JSON.stringify(content),
  }, { admin: true });
}

export async function saveContentSection(sectionKey, data) {
  return request(`/api/content/section/${sectionKey}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  }, { admin: true });
}

export async function saveCommonTools(tools) {
  return request("/api/admin/common-tools", {
    method: "PATCH",
    body: JSON.stringify({ tools }),
  }, { admin: true });
}

export async function fetchBookings(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.serviceType) qs.set("serviceType", params.serviceType);
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return request(`/api/bookings${query ? `?${query}` : ""}`, {}, { admin: true });
}

export const getBookings = fetchBookings;

export async function createBooking(payload) {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBooking(id, patch) {
  return request(`/api/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  }, { admin: true });
}

export async function uploadFile(file) {
  if (!file) {
    throw new ApiError("No file selected", 400);
  }

  const mimeType = file.type || "application/octet-stream";

  const sign = await request(
    "/api/upload/sign",
    {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        mimeType,
        size: file.size,
        context: "cms",
      }),
    },
    { admin: true, timeoutMs: UPLOAD_SIGN_TIMEOUT_MS }
  );

  if (!sign?.ok || !sign.bucket || !sign.path || !sign.token) {
    throw new ApiError(sign?.error || "Failed to get upload signature", 500, sign);
  }

  const signedUrl = sign.signedUrl;
  if (!signedUrl) {
    throw new ApiError("Failed to get upload signature", 500, sign);
  }

  await uploadToSignedStorage(signedUrl, file);

  return request(
    "/api/upload/complete",
    {
      method: "POST",
      body: JSON.stringify({
        bucket: sign.bucket,
        path: sign.path,
        filename: file.name,
        mimeType,
        size: file.size,
        type: sign.file?.type,
      }),
    },
    { admin: true, timeoutMs: UPLOAD_COMPLETE_TIMEOUT_MS }
  );
}

export async function getMedia() {
  return request("/api/media", {}, { admin: true });
}

export async function trashMedia(filename) {
  return request(`/api/media/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  }, { admin: true });
}

export { API_URL };
