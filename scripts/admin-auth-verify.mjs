/**
 * Admin auth API verification — Round 5.3
 * Usage:
 *   ADMIN_TEST_PASSWORD=your-password node scripts/admin-auth-verify.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  adminFetch,
  API_BASE,
  getAdminCredentials,
  loginAdmin,
  requireAdminTestPassword,
} from "./lib/admin-session.mjs";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

const SITE_CONTENT_PATH = path.join(process.cwd(), "server/data/site-content.json");

async function readSiteContent() {
  const raw = await readFile(SITE_CONTENT_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeSiteContent(content) {
  await writeFile(SITE_CONTENT_PATH, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

async function main() {
  try {
    requireAdminTestPassword();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const { username } = getAdminCredentials();

  // 1. Unauthenticated /me
  try {
    const { res, body } = await adminFetch("/api/admin/me");
    if (res.status === 401 && body?.authenticated === false) {
      pass("未登录 GET /api/admin/me", "401");
    } else {
      fail("未登录 GET /api/admin/me", `status ${res.status}`);
    }
  } catch (e) {
    fail("未登录 GET /api/admin/me", e.message);
  }

  // 2. Unauthenticated PATCH
  try {
    const { res } = await adminFetch("/api/content/section/seo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { title: "test" } }),
    });
    if (res.status === 401) pass("未登录 PATCH content", "401");
    else fail("未登录 PATCH content", `status ${res.status}`);
  } catch (e) {
    fail("未登录 PATCH content", e.message);
  }

  // 3. Wrong credentials
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "__wrong__" }),
    });
    const body = await res.json();
    if (res.status === 401 && body?.message) pass("错误密码登录", "401");
    else fail("错误密码登录", `status ${res.status}`);
  } catch (e) {
    fail("错误密码登录", e.message);
  }

  // 4–5. Login + /me with cookie
  let cookie;
  try {
    const session = await loginAdmin();
    cookie = session.cookie;
    pass("正确密码登录", session.data.user?.username || username);
  } catch (e) {
    fail("正确密码登录", e.message);
    printSummary();
    process.exit(1);
  }

  try {
    const { res, body } = await adminFetch("/api/admin/me", {}, cookie);
    if (res.ok && body?.authenticated && body.user?.username) {
      pass("带 cookie GET /api/admin/me", body.user.username);
    } else {
      fail("带 cookie GET /api/admin/me", `status ${res.status}`);
    }
  } catch (e) {
    fail("带 cookie GET /api/admin/me", e.message);
  }

  // 6. PATCH test field and restore
  const marker = `auth-verify-${Date.now()}`;
  let originalSeo;
  try {
    const content = await readSiteContent();
    originalSeo = JSON.parse(JSON.stringify(content.seo ?? {}));
    const nextSeo = { ...originalSeo, _authVerifyMarker: marker };

    const { res, body } = await adminFetch(
      "/api/content/section/seo",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: nextSeo }),
      },
      cookie
    );

    if (!res.ok) {
      fail("带 cookie PATCH seo", body?.error || `status ${res.status}`);
    } else {
      const after = await readSiteContent();
      if (after.seo?._authVerifyMarker === marker) {
        pass("带 cookie PATCH seo", "field updated");
      } else {
        fail("带 cookie PATCH seo", "field not persisted");
      }
    }
  } catch (e) {
    fail("带 cookie PATCH seo", e.message);
  } finally {
    if (originalSeo) {
      try {
        const content = await readSiteContent();
        content.seo = originalSeo;
        await writeSiteContent(content);
      } catch (restoreErr) {
        console.warn("Restore seo failed:", restoreErr.message);
      }
    }
  }

  // 7. Logout
  try {
    const { res } = await adminFetch("/api/admin/logout", { method: "POST" }, cookie);
    if (res.ok) pass("POST /api/admin/logout", "ok");
    else fail("POST /api/admin/logout", `status ${res.status}`);
  } catch (e) {
    fail("POST /api/admin/logout", e.message);
  }

  try {
    const { res, body } = await adminFetch("/api/admin/me");
    if (res.status === 401 && body?.authenticated === false) {
      pass("logout 后 /api/admin/me", "401");
    } else {
      fail("logout 后 /api/admin/me", `status ${res.status}`);
    }
  } catch (e) {
    fail("logout 后 /api/admin/me", e.message);
  }

  printSummary();
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

function printSummary() {
  console.log("\n── Summary ──");
  const ok = results.filter((r) => r.ok).length;
  console.log(`${ok}/${results.length} passed`);
  console.log(`API: ${API_BASE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
