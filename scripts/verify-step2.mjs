import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "http://localhost:5173";
const bookingsPath = join(root, "server/data/bookings.json");

const before = JSON.parse(readFileSync(bookingsPath, "utf8"));
const marker = `verify-${Date.now()}`;

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();
const out = {};

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#hero", { timeout: 8000 });
out.homeHero = (await page.locator(".hero__title").textContent())?.trim().slice(0, 30);

await page.goto(`${BASE}/cases`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".case-card", { timeout: 8000 });
out.caseCount = await page.locator(".case-card").count();

await page.goto(`${BASE}/booking`, { waitUntil: "domcontentloaded" });
await page.selectOption("select", { index: 1 });
await page.click('button:has-text("下一步"), button:has-text("Next")');
await page.locator(".form-group input").first().fill("南昌");
await page.click('button:has-text("下一步"), button:has-text("Next")');
await page.locator("textarea").fill(marker);
await page.click('button:has-text("下一步"), button:has-text("Next")');
await page.locator('.form-group input').first().fill("验证用户");
await page.click('button:has-text("提交"), button:has-text("Submit")');
await page.waitForSelector(".booking-success", { timeout: 8000 });
out.bookingSuccess = await page.locator(".booking-success").isVisible();

await page.goto(`${BASE}/admin/bookings`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".admin-table tbody tr", { timeout: 8000 });
const rows = await page.locator(".admin-table tbody tr").allTextContents();
out.adminHasMarker = rows.some((r) => r.includes(marker) || r.includes("验证用户"));

const after = JSON.parse(readFileSync(bookingsPath, "utf8"));
out.bookingsBefore = before.length;
out.bookingsAfter = after.length;
out.newRecord = after.find((b) => b.message === marker) ?? null;

await browser.close();
console.log(JSON.stringify(out, null, 2));
