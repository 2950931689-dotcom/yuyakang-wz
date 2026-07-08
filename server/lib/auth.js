import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_SESSION_COOKIE = "yy_admin_session";

function getConfig() {
  return {
    sessionSecret: process.env.ADMIN_SESSION_SECRET || "dev-change-me-in-production",
    sessionMaxAge: Number(process.env.ADMIN_SESSION_MAX_AGE) || 86_400_000,
    adminUsername: process.env.ADMIN_USERNAME || "admin",
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  };
}

export function isAuthConfigured() {
  const { adminUsername, adminPasswordHash } = getConfig();
  return Boolean(adminUsername && adminPasswordHash);
}

export function getAdminUsername() {
  return getConfig().adminUsername;
}

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, saltB64, hashB64] = parts;
  let expected;
  let actual;
  try {
    expected = Buffer.from(hashB64, "base64");
    actual = scryptSync(password, Buffer.from(saltB64, "base64"), 64);
  } catch {
    return false;
  }

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function verifyAdminCredentials(username, password) {
  if (!isAuthConfigured()) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;

  const { adminUsername, adminPasswordHash } = getConfig();
  const userBuf = Buffer.from(username);
  const expectedUserBuf = Buffer.from(adminUsername);
  if (userBuf.length !== expectedUserBuf.length) return false;
  if (!timingSafeEqual(userBuf, expectedUserBuf)) return false;

  return verifyPassword(password, adminPasswordHash);
}

export function createSessionToken(username) {
  const { sessionMaxAge, sessionSecret } = getConfig();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + sessionMaxAge;
  const payload = JSON.stringify({ username, issuedAt, expiresAt });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", sessionSecret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payloadB64 = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const { sessionSecret } = getConfig();

  const expectedSignature = createHmac("sha256", sessionSecret)
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload?.username || typeof payload.expiresAt !== "number") return null;
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};

  return header.split(";").reduce((acc, part) => {
    const trimmed = part.trim();
    if (!trimmed) return acc;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return acc;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function getSessionFromRequest(req) {
  const cookies = parseCookies(req);
  const token = cookies[ADMIN_SESSION_COOKIE];
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const { sessionMaxAge } = getConfig();
  return {
    maxAgeSeconds: Math.floor(sessionMaxAge / 1000),
    secure: isProd,
  };
}

export function buildSessionSetCookie(token) {
  const { maxAgeSeconds, secure } = getSessionCookieOptions();
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildSessionClearCookie() {
  const { secure } = getSessionCookieOptions();
  const parts = [
    `${ADMIN_SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
