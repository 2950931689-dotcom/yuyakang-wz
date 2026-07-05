import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:5173";

function launchBrowser() {
  return chromium.launch({ headless: true, channel: "msedge" }).catch(() =>
    chromium.launch({ headless: true, channel: "chrome" }).catch(() =>
      chromium.launch({ headless: true })
    )
  );
}

async function readHero(page) {
  const code = (await page.locator(".hero__carousel-status-code").textContent())?.trim();
  const title = (await page.locator(".hero__carousel-status-title").textContent())?.trim();
  const fill = page.locator(".hero__carousel-progress-fill");
  const transform = await fill.evaluate((el) => getComputedStyle(el).transform);
  let scale = 0;
  if (transform && transform !== "none") {
    const m = transform.match(/matrix\(([^)]+)\)/);
    if (m) scale = parseFloat(m[1].split(",")[0]) || 0;
  }
  const videoCount = await page.locator(".hero__carousel-video").count();
  const wipeCount = await page.locator(".hero-video-wipe, [class*='crossfade']").count();
  const videoPaused = await page
    .locator(".hero__carousel-video")
    .first()
    .evaluate((v) => (v ? v.paused : null))
    .catch(() => null);
  return { code, title, scale, videoCount, wipeCount, videoPaused };
}

const browser = await launchBrowser();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
await page.waitForSelector(".hero__carousel-status-code", { timeout: 10000 });

const start = await readHero(page);
await page.waitForTimeout(2000);
const mid = await readHero(page);

let switched = false;
let final = start;
for (let i = 0; i < 36; i++) {
  await page.waitForTimeout(500);
  final = await readHero(page);
  if (final.code !== start.code) {
    switched = true;
    break;
  }
}

const checks = {
  projectStartsAt01: start.code?.includes("01 / 04") ?? false,
  projectSwitchesTo02: switched && final.code?.includes("02 / 04"),
  progressIncreased: mid.scale > start.scale,
  titleChangedOnSwitch: switched && final.title !== start.title,
  singleVideo: final.videoCount === 1,
  noWipeOrCrossfade: final.wipeCount === 0,
  noConsoleErrors: errors.length === 0,
  start,
  mid,
  final,
  switched,
  errors,
};

console.log(JSON.stringify(checks, null, 2));
await browser.close();
process.exit(
  checks.projectStartsAt01 &&
    checks.projectSwitchesTo02 &&
    checks.progressIncreased &&
    checks.singleVideo &&
    checks.noWipeOrCrossfade
    ? 0
    : 1
);
