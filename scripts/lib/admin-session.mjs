/**
 * Shared admin session helper for verification scripts.
 */
import { loadScriptEnv } from "./load-script-env.mjs";

loadScriptEnv();

const API_BASE = (process.env.SMOKE_API_URL || "http://localhost:3001").replace(/\/$/, "");

function extractSessionCookie(res) {
  const lines =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie")].filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("yy_admin_session=")) {
      return line.split(";")[0];
    }
  }
  return null;
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_TEST_USERNAME || process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_TEST_PASSWORD;
  return { username, password };
}

export function requireAdminTestPassword() {
  const { password } = getAdminCredentials();
  if (!password) {
    throw new Error(
      "Set ADMIN_TEST_PASSWORD (and ensure server has ADMIN_PASSWORD_HASH configured). " +
        "Example: ADMIN_TEST_PASSWORD=your-password node scripts/admin-auth-verify.mjs"
    );
  }
  return password;
}

export async function loginAdmin() {
  const { username, password } = getAdminCredentials();
  requireAdminTestPassword();

  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Login failed (${res.status})`);
  }

  const cookie = extractSessionCookie(res);
  if (!cookie) {
    throw new Error("Login succeeded but session cookie missing");
  }

  return { cookie, data };
}

export async function adminFetch(path, options = {}, cookie) {
  const headers = { ...(options.headers ?? {}) };
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  return { res, body };
}

export { API_BASE };
