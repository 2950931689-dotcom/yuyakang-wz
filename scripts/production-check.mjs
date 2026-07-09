/**
 * Production deployment readiness check (Round 6.4).
 * Read-only: no auth, no writes, no token required.
 *
 * Usage:
 *   PROD_SITE_URL=https://www.yuyakang.top PROD_API_URL=https://api.yuyakang.top node scripts/production-check.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SITE = (process.env.PROD_SITE_URL || "https://www.yuyakang.top").replace(/\/$/, "");
const API = (process.env.PROD_API_URL || "https://api.yuyakang.top").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.PROD_CHECK_TIMEOUT_MS) || 25_000;

const PAGES = ["/", "/about", "/cases", "/cases/echo-live-yunfu", "/booking", "/contact", "/admin/login"];
const ASSETS = [
  "/hero/desktop/hero-reel.mp4",
  "/hero/mobile/hero-reel-mobile.mp4",
  "/hero/desktop/hero-poster.webp",
  "/certificates/cert-01.webp",
  "/cases/echo-live-yunfu/gallery/gallery-01.webp",
  "/images/wechat-qr.jpg",
];

function pass(label, detail = "") {
  console.log(`✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function warn(label, detail = "") {
  console.warn(`⚠ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function probe(url, { method = "GET", accept = "text/html" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: method === "HEAD" ? {} : { Accept: accept },
    });
    const contentType = res.headers.get("content-type") || "";
    let snippet = "";
    if (method === "GET" && contentType.includes("json")) {
      snippet = (await res.text()).slice(0, 200);
    } else if (method === "GET" && contentType.includes("html")) {
      snippet = (await res.text()).slice(0, 120).replace(/\s+/g, " ");
    }
    return { ok: res.ok, status: res.status, contentType, snippet };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

function checkLocalPublicAssets() {
  const root = path.resolve(import.meta.dirname, "..");
  const missing = [];
  for (const asset of ASSETS) {
    const file = path.join(root, "public", asset.replace(/^\//, ""));
    if (!fs.existsSync(file)) missing.push(asset);
  }
  return missing;
}

function extractPathsFromJson(file) {
  const text = fs.readFileSync(file, "utf8");
  const paths = new Set();
  for (const m of text.matchAll(/"(\/(?:hero|cases|certificates|images|about|audio|uploads)[^"]+)"/g)) {
    paths.add(m[1]);
  }
  return [...paths];
}

async function main() {
  console.log("── Production Deployment Check ──\n");
  console.log(`PROD_SITE_URL=${SITE}`);
  console.log(`PROD_API_URL=${API}\n`);

  let failed = 0;
  let warnings = 0;

  const localMissing = checkLocalPublicAssets();
  if (localMissing.length) {
    warn("本地 public 缺失关键素材", localMissing.join(", "));
    warnings += 1;
  } else {
    pass("本地 public 关键素材存在", `${ASSETS.length} 项`);
  }

  const contentJson = path.resolve(import.meta.dirname, "../server/data/site-content.json");
  if (fs.existsSync(contentJson)) {
    const refs = extractPathsFromJson(contentJson);
    const missingRefs = refs.filter((p) => !fs.existsSync(path.join(path.resolve(import.meta.dirname, ".."), "public", p.replace(/^\//, ""))));
    if (missingRefs.length) {
      warn("site-content.json 引用但本地 public 缺失", `${missingRefs.length} 项`);
      missingRefs.slice(0, 8).forEach((p) => console.warn(`    ${p}`));
      warnings += 1;
    } else {
      pass("site-content.json 素材路径与本地 public 一致", `${refs.length} 项`);
    }
  }

  console.log("\n── API ──");
  for (const path of ["/api/health", "/api/content"]) {
    const url = `${API}${path}`;
    const result = await probe(url, { accept: "application/json" });
    if (result.ok) {
      pass(`${path}`, `HTTP ${result.status}`);
      if (path === "/api/health") {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timer);
          const health = await res.json();
          if (health?.strapi?.enabled) {
            warn("生产 health 显示 strapi.enabled=true", "确认 Strapi 生产已部署");
            warnings += 1;
          } else if (health?.strapi) {
            pass("生产 Strapi 默认关闭或未启用", `enabled=${health.strapi.enabled}`);
          }
        } catch {
          /* ignore */
        }
      }
    } else {
      fail(`${path}`, result.error || `HTTP ${result.status}`);
      failed += 1;
    }
  }

  console.log("\n── Site pages ──");
  for (const route of PAGES) {
    const url = `${SITE}${route}`;
    const result = await probe(url);
    if (result.ok) {
      pass(route, `HTTP ${result.status}`);
    } else {
      fail(route, result.error || `HTTP ${result.status}`);
      failed += 1;
    }
  }

  console.log("\n── Static assets (Vercel) ──");
  for (const asset of ASSETS) {
    const url = `${SITE}${asset}`;
    const result = await probe(url, { method: "HEAD" });
    if (result.ok) {
      pass(asset, `HTTP ${result.status} ${result.contentType || ""}`.trim());
    } else {
      fail(asset, result.error || `HTTP ${result.status}`);
      failed += 1;
    }
  }

  console.log("\n── Environment notes ──");
  console.log("  Vercel 应设置: VITE_API_URL=https://api.yuyakang.top");
  console.log("  Render 生产建议: STRAPI_ENABLED=false, STRAPI_WRITE_ENABLED=false");
  console.log("  不要把 STRAPI_API_TOKEN / ADMIN_* 放到 Vercel 前台");

  console.log(
    failed
      ? `\n── Summary: ${failed} failed, ${warnings} warnings ──`
      : warnings
        ? `\n── Summary: passed with ${warnings} warning(s) ──`
        : "\n── Summary: all checks passed ──"
  );
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
