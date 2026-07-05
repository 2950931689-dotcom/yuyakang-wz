/**
 * Smoke + usability checks — run while `npm run dev` is active
 * Usage: node scripts/smoke-test.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:5173";
const API = process.env.SMOKE_API_URL || "http://localhost:3001";
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function checkApi(path, label) {
  try {
    const r = await fetch(`${API}${path}`);
    if (r.ok) pass(label, `status ${r.status}`);
    else fail(label, `status ${r.status}`);
  } catch (e) {
    fail(label, e.message);
  }
}

async function checkPage(page, path, label, selector) {
  try {
    const res = await page.goto(`${BASE}${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    if (!res?.ok()) {
      fail(label, `HTTP ${res?.status()}`);
      return;
    }
    if (selector) await page.waitForSelector(selector, { timeout: 8000 });
    pass(label, path);
  } catch (e) {
    fail(label, e.message);
  }
}

async function main() {
  await checkApi("/api/health", "API /api/health");
  await checkApi("/api/content", "API /api/content");

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    try {
      browser = await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      try {
        browser = await chromium.launch({ headless: true });
      } catch {
        console.log("Playwright browser unavailable — API checks only");
        printSummary();
        process.exit(results.every((r) => r.ok) ? 0 : 1);
      }
    }
  }

  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await checkPage(page, "/", "首页 /", "#hero");
  try {
    const heroStatus = await page.locator(".hero__carousel-status-code").textContent();
    if (heroStatus?.includes("PROJECT")) pass("Hero 状态提示", heroStatus.trim());
    else pass("Hero 区域", "无轮播 slide 时跳过状态");
  } catch (e) {
    fail("Hero 状态提示", e.message);
  }

  await checkPage(page, "/cases", "案例列表 /cases", ".case-card");
  await checkPage(page, "/about", "关于 /about", ".page-title, h1");
  await checkPage(page, "/services", "服务 /services", ".page-title, h1");
  await checkPage(page, "/contact", "联系 /contact", ".page-title, h1");

  try {
    await page.goto(`${BASE}/cases`, { waitUntil: "domcontentloaded" });
    await page.locator(".case-card").first().click();
    await page.waitForURL(/\/cases\/[^/]+$/, { timeout: 8000 });
    await page.waitForSelector(".case-file__title, h1", { timeout: 5000 });
    pass("案例详情 /cases/:slug", page.url());
  } catch (e) {
    fail("案例详情", e.message);
  }

  try {
    await page.goto(`${BASE}/booking`, { waitUntil: "domcontentloaded" });
    await page.locator(".service-pick").first().click();
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.locator(".form-group input").first().fill("南昌");
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.locator("textarea").first().fill("可用性测试预约");
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.locator('.form-group input[type="text"], .form-group input:not([type])').first().fill("测试");
    await page.click('button:has-text("提交"), button:has-text("Submit")');
    await page.waitForSelector(".booking-success", { timeout: 8000 });
    pass("Booking 流程", "成功页");
  } catch (e) {
    fail("Booking 流程", e.message);
  }

  await checkPage(page, "/admin", "后台 /admin", ".admin-layout, .admin-dashboard");
  await checkPage(page, "/admin/hero", "后台 Hero", ".admin-layout");
  await checkPage(page, "/admin/location", "后台 Location", ".admin-layout");
  await checkPage(page, "/admin/media", "后台 Media", ".admin-layout");

  await checkPage(page, "/admin/profile", "后台 Profile", ".admin-layout");
  await checkPage(page, "/admin/cases", "后台 Cases", ".admin-layout");
  await checkPage(page, "/admin/seo", "后台 SEO", ".admin-layout");
  await checkPage(page, "/admin/tutorial", "后台 Tutorial", ".admin-layout");

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.click(".header__menu-btn");
    await page.waitForSelector(".mobile-nav.open", { timeout: 3000 });
    pass("手机端菜单", "390px");
    await page.locator(".mobile-nav__head .header__menu-btn").click();
  } catch (e) {
    fail("手机端菜单", e.message);
  }

  const redErrors = errors.filter(
    (e) => !e.includes("favicon") && !e.includes("404")
  );
  if (redErrors.length === 0) pass("Console 无红色报错", "checked");
  else fail("Console 红色报错", redErrors.slice(0, 2).join("; "));

  await browser.close();
  printSummary();
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

function printSummary() {
  console.log("\n── Summary ──");
  const ok = results.filter((r) => r.ok).length;
  console.log(`${ok}/${results.length} passed`);
  console.log(`Base: ${BASE} · API: ${API}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
