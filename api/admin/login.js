import {
  buildAuthDiagnostics,
  buildSessionSetCookie,
  createSessionToken,
  getAdminUsername,
  isAuthConfigured,
  verifyAdminCredentials,
} from '../_lib/adminAuth.js';
import { readJsonRequestBody } from '../_lib/requestBody.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthConfigured()) {
    return res.status(503).json({
      ok: false,
      message: '后台认证未配置，请设置 ADMIN_USERNAME 与 ADMIN_PASSWORD_HASH',
    });
  }

  let body;
  try {
    body = await readJsonRequestBody(req);
  } catch {
    return res.status(400).json({ ok: false, message: 'Invalid request body' });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, message: 'Invalid request body' });
  }

  const username = body.username;
  const password = body.password;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ ok: false, message: 'Invalid request body' });
  }

  if (!verifyAdminCredentials(username, password)) {
    const diagnostics = buildAuthDiagnostics(body);
    res.setHeader('X-Auth-Diag-Body', diagnostics.bodyHasUsername && diagnostics.bodyHasPassword ? 'ok' : 'missing-fields');
    res.setHeader('X-Auth-Diag-Hash-Format', diagnostics.passwordHashPrefixIsScrypt ? 'scrypt' : 'invalid');
    return res.status(401).json({
      ok: false,
      message: '账号或密码错误',
    });
  }

  const token = createSessionToken(getAdminUsername());
  res.setHeader('Set-Cookie', buildSessionSetCookie(token));
  return res.status(200).json({
    ok: true,
    authenticated: true,
    user: { username: getAdminUsername() },
  });
}
