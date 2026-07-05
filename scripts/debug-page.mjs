import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle", timeout: 20000 });
await page.waitForTimeout(3000);
console.log("BODY TEXT:", (await page.locator("body").innerText()).slice(0, 500));
console.log("HTML snippet:", (await page.content()).slice(0, 800));
await browser.close();
