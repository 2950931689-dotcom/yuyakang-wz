/**
 * Strapi CommonTools sync verification (Round 6.1).
 * Requires Strapi local + env flags. Token from STRAPI_API_TOKEN only.
 */
import { loadScriptEnv } from "./lib/load-script-env.mjs";
import { loginAdmin, adminFetch, API_BASE } from "./lib/admin-session.mjs";

loadScriptEnv();

const STRAPI_BASE = (process.env.STRAPI_BASE_URL || "http://localhost:1337").replace(/\/$/, "");
const TEST_TITLE = "Strapi Sync Test Tool";
const TEST_URL = "https://example.com/strapi-sync-test";

function isEnabled() {
  return process.env.STRAPI_ENABLED === "true";
}

function isWriteEnabled() {
  return isEnabled() && process.env.STRAPI_WRITE_ENABLED === "true";
}

function pass(label, detail = "") {
  console.log(`✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function getContentTools() {
  const res = await fetch(`${API_BASE}/api/content`);
  if (!res.ok) throw new Error(`GET /api/content failed (${res.status})`);
  const content = await res.json();
  return content?.siteSettings?.commonTools ?? [];
}

function hasTestTool(tools) {
  return tools.some((t) => t.title === TEST_TITLE && t.url === TEST_URL);
}

async function main() {
  console.log("── Strapi CommonTools Verification ──\n");

  console.log(`STRAPI_ENABLED=${process.env.STRAPI_ENABLED ?? "(unset)"}`);
  console.log(`STRAPI_WRITE_ENABLED=${process.env.STRAPI_WRITE_ENABLED ?? "(unset)"}`);
  console.log(`STRAPI_BASE_URL=${STRAPI_BASE}`);
  console.log(`STRAPI_API_TOKEN=${process.env.STRAPI_API_TOKEN ? "[set]" : "[missing]"}\n`);

  if (!isEnabled()) {
    console.log("Strapi 未启用 — 跳过 Strapi 专项验证（JSON CMS 模式正常）。");
    process.exit(0);
  }

  let failed = 0;

  try {
    const healthRes = await fetch(`${API_BASE}/api/health`);
    const health = await healthRes.json();
    if (health?.strapi?.enabled) {
      pass("Express health 报告 Strapi enabled");
    } else {
      fail("Express health 未报告 Strapi enabled");
      failed += 1;
    }
  } catch (err) {
    fail("Express health 不可达", err.message);
    failed += 1;
  }

  try {
    const strapiRes = await fetch(`${STRAPI_BASE}/api/common-tools`);
    if (strapiRes.ok) {
      pass("Strapi /api/common-tools 可访问");
    } else {
      fail("Strapi /api/common-tools", String(strapiRes.status));
      failed += 1;
    }
  } catch (err) {
    fail("Strapi 不可达", err.message);
    failed += 1;
  }

  try {
    await getContentTools();
    pass("GET /api/content 返回 commonTools");
  } catch (err) {
    fail("GET /api/content", err.message);
    failed += 1;
  }

  if (!isWriteEnabled()) {
    console.log("\nSTRAPI_WRITE_ENABLED=false — 跳过写入/sync 测试。");
    console.log(failed ? `\n── Summary: ${failed} failed ──` : "\n── Summary: read checks passed ──");
    process.exit(failed ? 1 : 0);
  }

  if (!process.env.STRAPI_API_TOKEN) {
    fail("写入测试需要 STRAPI_API_TOKEN");
    process.exit(1);
  }

  let adminCookie;
  try {
    adminCookie = (await loginAdmin()).cookie;
    pass("Admin 登录成功");
  } catch (err) {
    fail("Admin 登录", err.message);
    process.exit(1);
  }

  let baselineTools = [];
  try {
    baselineTools = await getContentTools();
    pass("读取 baseline commonTools", `${baselineTools.length} 项`);
  } catch (err) {
    fail("读取 baseline", err.message);
    process.exit(1);
  }

  const testTool = {
    id: `test-${Date.now()}`,
    title: TEST_TITLE,
    description: "Round 6.1 sync verification",
    url: TEST_URL,
    category: "测试",
    enabled: true,
    sortOrder: baselineTools.length + 1,
    openInNewTab: true,
    isFeatured: false,
  };

  const writePayload = [...baselineTools, testTool];

  try {
    const { res, body } = await adminFetch(
      "/api/admin/common-tools",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: writePayload }),
      },
      adminCookie
    );
    if (!res.ok || body.ok === false) {
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    pass("PATCH /api/admin/common-tools 写入 Strapi");
  } catch (err) {
    fail("写入 Strapi", err.message);
    process.exit(1);
  }

  try {
    const tools = await getContentTools();
    if (hasTestTool(tools)) {
      pass("GET /api/content 包含测试工具");
    } else {
      fail("GET /api/content 未找到测试工具");
      failed += 1;
    }
  } catch (err) {
    fail("读取写入结果", err.message);
    failed += 1;
  }

  try {
    const restored = baselineTools.filter((t) => t.title !== TEST_TITLE);
    const { res, body } = await adminFetch(
      "/api/admin/common-tools",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: restored }),
      },
      adminCookie
    );
    if (!res.ok || body.ok === false) {
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    pass("恢复 baseline（软删除测试项）");
  } catch (err) {
    fail("恢复 baseline", err.message);
    failed += 1;
  }

  try {
    const tools = await getContentTools();
    if (!hasTestTool(tools)) {
      pass("测试工具已从 /api/content 移除");
    } else {
      fail("测试工具仍存在于 /api/content");
      failed += 1;
    }
  } catch (err) {
    fail("验证清理结果", err.message);
    failed += 1;
  }

  try {
    const { res } = await adminFetch(
      "/api/admin/common-tools",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: [] }),
      },
      null
    );
    if (res.status === 401) {
      pass("未登录写入返回 401");
    } else {
      fail("未登录写入应返回 401", `got ${res.status}`);
      failed += 1;
    }
  } catch (err) {
    fail("未登录写入测试", err.message);
    failed += 1;
  }

  console.log(failed ? `\n── Summary: ${failed} failed ──` : "\n── Summary: all passed ──");
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
