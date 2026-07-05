const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

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
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
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

export { API_URL };
