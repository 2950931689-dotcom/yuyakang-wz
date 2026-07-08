import { getSessionFromRequest, isAuthConfigured } from "./auth.js";

export function requireAdminAuth(req, res, next) {
  if (!isAuthConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Admin auth not configured",
      message: "请配置 ADMIN_USERNAME 与 ADMIN_PASSWORD_HASH",
    });
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({
      ok: false,
      authenticated: false,
      message: "未登录或登录已过期",
    });
  }

  req.adminUser = { username: session.username };
  return next();
}
