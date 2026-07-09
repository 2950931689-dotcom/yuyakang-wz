/**
 * One-off CMS linkage verification (Round 4.4).
 * PATCH → Playwright verify → restore for each scenario.
 * Requires admin auth (Round 5.3): set ADMIN_TEST_PASSWORD in env.
 */
import { chromium } from "playwright";
import { loginAdmin, adminFetch } from "./lib/admin-session.mjs";

const API = "http://localhost:3001/api/content";
const WEB =
  process.env.CMS_VERIFY_BASE_URL ||
  process.env.SMOKE_BASE_URL ||
  "http://localhost:5173";
const CASE_SLUG = "echo-live-yunfu";

let adminCookie;

async function initAuth() {
  adminCookie = (await loginAdmin()).cookie;
}

const MARKER = {
  headline: { cn: "CMS联动测试标题 Alpha", en: "CMS Link Test Headline Alpha" },
  tagline: {
    cn: "CMS联动测试标语：先判断系统，再处理声音。",
    en: "CMS link test tagline: system first, sound second.",
  },
  workflowTitle: { cn: "CMS流程测试步骤", en: "CMS Workflow Test Step" },
  wechatId: "cms-link-test-wechat-id",
  signalFlow: [
    {
      id: "cms-test",
      label: "CMS-FLOW-TEST",
      labelCn: "CMS信号链测试",
      desc: {
        cn: "这是 CMS signalFlow 联动测试节点。",
        en: "CMS signalFlow linkage test node.",
      },
    },
    {
      id: "console",
      label: "CONSOLE",
      labelCn: "调音台",
      desc: { cn: "测试保留节点。", en: "Test node retained." },
    },
  ],
};

async function getContent() {
  const res = await fetch(API);
  if (!res.ok) throw new Error(`GET content failed: ${res.status}`);
  return res.json();
}

async function patchSection(key, data) {
  const { res, body } = await adminFetch(
    `/api/content/section/${key}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    },
    adminCookie
  );
  if (!res.ok || body.ok === false) {
    throw new Error(`PATCH ${key} failed: ${JSON.stringify(body)}`);
  }
  return body;
}

async function launchBrowser() {
  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      return await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
    } catch {
      /* try next */
    }
  }
  throw new Error("Could not launch browser");
}

async function pageText(url, check) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    return await check(page);
  } finally {
    await browser.close();
  }
}

const results = [];

function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function test1HeroHeadline(backup) {
  const hero = structuredClone(backup.hero);
  hero.headline = { ...hero.headline, ...MARKER.headline };
  await patchSection("hero", hero);

  const ok = await pageText(`${WEB}/`, async (page) => {
    const text = await page.locator(".hero-boot__title").innerText();
    return text.includes("CMS联动测试标题");
  });

  log("1. Hero headline → 首页", ok, ok ? "标题已显示" : "未找到测试标题");
  await patchSection("hero", backup.hero);
}

async function test2ProfileTagline(backup) {
  const profile = structuredClone(backup.profile);
  profile.tagline = { ...MARKER.tagline };
  await patchSection("profile", profile);

  const ok = await pageText(`${WEB}/about`, async (page) => {
    const text = await page.locator(".engineer-identity__tagline").innerText();
    return text.includes("CMS联动测试标语");
  });

  log("2. Profile tagline → About", ok, ok ? "标语已显示" : "未找到测试标语");
  const restored = structuredClone(backup.profile);
  delete restored.tagline;
  await patchSection("profile", restored);
}

async function test3Workflow(backup) {
  const siteSettings = structuredClone(backup.siteSettings);
  const steps = [...(siteSettings.processSteps ?? [])];
  if (!steps.length) throw new Error("No processSteps in CMS");
  steps[0] = {
    ...steps[0],
    title: { ...steps[0].title, ...MARKER.workflowTitle },
  };
  siteSettings.processSteps = steps;
  await patchSection("siteSettings", siteSettings);

  const ok = await pageText(`${WEB}/`, async (page) => {
    const text = await page.locator(".workflow-cue__title").first().innerText();
    return text.includes("CMS流程测试步骤");
  });

  log("3. site-modules Workflow → 首页", ok, ok ? "流程标题已更新" : "未找到测试流程标题");
  await patchSection("siteSettings", backup.siteSettings);
}

async function test4WechatId(backup) {
  const socialLinks = structuredClone(backup.socialLinks);
  socialLinks.wechatId = MARKER.wechatId;
  await patchSection("socialLinks", socialLinks);

  const ok = await pageText(`${WEB}/contact`, async (page) => {
    const patch = page.locator(".contact-patch").filter({ hasText: "WECHAT" });
    const copyBtn = patch.locator("button").filter({ hasText: /复制|Copy/i }).first();
    const disabled = await copyBtn.isDisabled();
    const value = await patch.locator(".contact-patch__value").innerText().catch(() => "");
    return !disabled && value.includes(MARKER.wechatId);
  });

  log(
    "4. social wechatId → Contact 复制按钮",
    ok,
    ok ? "复制按钮已启用且显示微信号" : "按钮未启用或未显示测试微信号"
  );

  const restored = structuredClone(backup.socialLinks);
  delete restored.wechatId;
  await patchSection("socialLinks", restored);
}

async function test5SignalFlow(backup) {
  const cases = structuredClone(backup.cases);
  const idx = cases.findIndex((c) => c.slug === CASE_SLUG);
  if (idx < 0) throw new Error(`Case ${CASE_SLUG} not found`);

  cases[idx] = { ...cases[idx], signalFlow: MARKER.signalFlow };
  await patchSection("cases", cases);

  const ok = await pageText(`${WEB}/cases/${CASE_SLUG}`, async (page) => {
    const text = await page.locator(".signal-flow__node-code").first().innerText();
    return text.includes("CMS-FLOW-TEST");
  });

  log("5. case signalFlow → 案例详情信号链", ok, ok ? "自定义节点已显示" : "未找到 CMS-FLOW-TEST");

  const restoredCases = structuredClone(backup.cases);
  delete restoredCases[idx].signalFlow;
  await patchSection("cases", restoredCases);
}

async function main() {
  console.log("── CMS Linkage Verification ──\n");
  console.log(`BASE_URL: ${WEB}\n`);
  try {
    await initAuth();
  } catch (err) {
    console.error("Auth required:", err.message);
    process.exit(1);
  }

  const backup = await getContent();

  try {
    await test1HeroHeadline(backup);
    await test2ProfileTagline(backup);
    await test3Workflow(backup);
    await test4WechatId(backup);
    await test5SignalFlow(backup);
  } catch (err) {
    console.error("\nFatal:", err.message);
    process.exitCode = 1;
  }

  const passed = results.filter((r) => r.ok).length;
  console.log(`\n── Summary: ${passed}/${results.length} passed ──`);

  if (passed !== results.length) process.exitCode = 1;
}

main();
