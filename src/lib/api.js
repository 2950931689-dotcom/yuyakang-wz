function resolveApiBase() {
  const envBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

  if (import.meta.env.DEV) {
    return envBase;
  }

  if (typeof window === "undefined") {
    return envBase || "http://localhost:3001";
  }

  // API 同域（Render api.yuyakang.top）时走相对路径，避免跨域与 cookie 问题
  if (window.location.pathname.startsWith("/admin")) {
    return "";
  }

  if (envBase && window.location.origin === envBase) {
    return "";
  }

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

async function request(path, options = {}, { admin = false } = {}) {
  const headers = { ...(options.headers ?? {}) };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const url = API_URL ? `${API_URL}${path}` : path;
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: admin ? "include" : "same-origin",
  });

  return parseResponse(res, { admin });
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
  const form = new FormData();
  form.append("file", file);

  const url = API_URL ? `${API_URL}/api/upload` : "/api/upload";
  const res = await fetch(url, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  return parseResponse(res, { admin: true });
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
