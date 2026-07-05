/**
 * Quick smoke test — run while `npm run dev` is active
 * Usage: node scripts/smoke-test.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:5173";
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    try {
      browser = await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      try {
        browser = await chromium.launch({ headless: true });
      } catch (e) {
        console.log("Playwright browser not installed, running HTTP-only checks…");
        await httpOnlyChecks();
        printSummary();
        process.exit(0);
      }
    }
  }

  const page = await browser.newPage();

  // 1 & 2: dev + homepage
  try {
    const res = await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 15000 });
    if (res?.ok()) pass("1. npm run dev / 首页 HTTP", `status ${res.status()}`);
    else fail("1. npm run dev / 首页 HTTP", `status ${res?.status()}`);

    await page.waitForSelector("#hero", { timeout: 8000 });
    const heroTitle = await page.locator(".hero__title").textContent();
    pass("2. 首页打开", heroTitle?.trim().slice(0, 30) || "Hero visible");
  } catch (e) {
    fail("1-2. 首页", e.message);
  }

  // 3: mobile menu
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.click('button[aria-label="Open menu"]');
    await page.waitForSelector(".mobile-nav.open", { timeout: 3000 });
    const linkCount = await page.locator(".mobile-nav__links a").count();
    if (linkCount >= 6) pass("3. 手机端菜单", `${linkCount} nav links`);
    else fail("3. 手机端菜单", `only ${linkCount} links`);
    await page.click('button[aria-label="Close"]');
  } catch (e) {
    fail("3. 手机端菜单", e.message);
  }

  // 4: cases list
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/cases`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".case-card", { timeout: 8000 });
    const count = await page.locator(".case-card").count();
    if (count === 6) pass("4. 案例列表 6 个", `${count} cards`);
    else fail("4. 案例列表 6 个", `found ${count}`);
  } catch (e) {
    fail("4. 案例列表", e.message);
  }

  // 5: case detail
  try {
    await page.locator(".case-card").first().click();
    await page.waitForURL(/\/cases\/[^/]+$/, { timeout: 5000 });
    const h1 = await page.locator("h1.page-title").textContent();
    pass("5. 案例详情可进入", h1?.trim().slice(0, 40) || page.url());
  } catch (e) {
    fail("5. 案例详情", e.message);
  }

  // 6: booking flow
  try {
    await page.goto(`${BASE}/booking`, { waitUntil: "domcontentloaded" });
    await page.selectOption("select", { index: 1 });
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.fill('input[type="date"], input', { timeout: 2000 }).catch(() => {});
    const cityInput = page.locator(".form-group input").first();
    await cityInput.fill("南昌");
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.locator("textarea").fill("测试预约需求描述");
    await page.click('button:has-text("下一步"), button:has-text("Next")');
    await page.locator('.form-group input[type="text"], .form-group input:not([type])').first().fill("测试用户");
    await page.click('button:has-text("提交"), button:has-text("Submit")');
    await page.waitForSelector(".booking-success", { timeout: 5000 });
    const qr = await page.locator(".wechat-qr img").isVisible();
    pass("6. Booking 流程", qr ? "成功页 + 微信二维码" : "成功页已显示");
  } catch (e) {
    fail("6. Booking 流程", e.message);
  }

  await browser.close();
  printSummary();
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}

async function httpOnlyChecks() {
  try {
    const r = await fetch(BASE);
    if (r.ok) pass("1. dev server HTTP", `status ${r.status}`);
    else fail("1. dev server HTTP", `status ${r.status}`);
  } catch (e) {
    fail("1. dev server", e.message);
  }

  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const mock = JSON.parse(readFileSync(join(root, "src/data/site-content.mock.json"), "utf8"));
  const featured = mock.cases.filter((c) => c.featured && c.visible !== false);
  if (featured.length === 6) pass("4. 案例数据 6 个", "from mock JSON");
  else fail("4. 案例数据", `featured=${featured.length}`);
}

function printSummary() {
  console.log("\n── Summary ──");
  const ok = results.filter((r) => r.ok).length;
  console.log(`${ok}/${results.length} passed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
