const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(res) {
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
    throw new ApiError(
      data?.error || data?.message || `Request failed (${res.status})`,
      res.status,
      data
    );
  }

  return data;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(res);
}

export function resolveUploadUrl(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

export async function checkHealth() {
  return request("/api/health");
}

export async function fetchContent() {
  return request("/api/content");
}

export const getContent = fetchContent;

export async function saveContent(content) {
  return request("/api/content", {
    method: "PUT",
    body: JSON.stringify(content),
  });
}

export async function saveContentSection(sectionKey, data) {
  return request(`/api/content/section/${sectionKey}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
}

export async function fetchBookings(params = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.serviceType) qs.set("serviceType", params.serviceType);
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return request(`/api/bookings${query ? `?${query}` : ""}`);
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
  });
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: form,
  });

  return parseResponse(res);
}

export async function getMedia() {
  return request("/api/media");
}

export async function trashMedia(filename) {
  return request(`/api/media/${encodeURIComponent(filename)}`, {
    method: "DELETE",
  });
}

export { API_URL };
