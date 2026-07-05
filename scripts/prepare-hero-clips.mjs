/**
 * Prepare compressed hero slide clips from case videos (dry-run by default).
 *
 * Usage:
 *   node scripts/prepare-hero-clips.mjs           # dry-run
 *   node scripts/prepare-hero-clips.mjs --execute  # run ffmpeg
 *
 * Requires ffmpeg in PATH when executing.
 */
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const execute = process.argv.includes("--execute");
const contentPath = join(root, "server/data/site-content.example.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));
const slides = content.hero?.slides ?? [];
const outDir = join(root, "public/hero/slides");
const mobileOutDir = join(root, "public/hero/slides/mobile");

const jobs = slides.map((slide, i) => {
  const input = join(root, "public", slide.video.replace(/^\//, ""));
  const base = slide.caseSlug || `slide-${i + 1}`;
  const desktopOut = join(outDir, `${base}.mp4`);
  const mobileOut = join(mobileOutDir, `${base}.mp4`);
  const start = slide.startTime ?? 0;
  const duration = slide.duration ?? content.hero.slideDuration ?? 5;

  return { input, desktopOut, mobileOut, start, duration, slide };
});

console.log(`prepare-hero-clips — ${execute ? "EXECUTE" : "DRY-RUN"}`);
console.log(`Output: public/hero/slides/`);

for (const job of jobs) {
  const inputExists = existsSync(job.input);
  console.log("\n---");
  console.log("case:", job.slide.caseSlug);
  console.log("input:", job.input, inputExists ? "OK" : "MISSING");
  console.log("start:", job.start, "duration:", job.duration);

  const desktopCmd =
    `ffmpeg -y -ss ${job.start} -i "${job.input}" -t ${job.duration} -an -c:v libx264 -preset slow -crf 23 -movflags +faststart "${job.desktopOut}"`;
  const mobileCmd =
    `ffmpeg -y -ss ${job.start} -i "${job.input}" -t ${job.duration} -an -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -movflags +faststart "${job.mobileOut}"`;

  console.log("desktop:", desktopCmd);
  console.log("mobile:", mobileCmd);

  if (execute && inputExists) {
    mkdirSync(outDir, { recursive: true });
    mkdirSync(mobileOutDir, { recursive: true });
    execSync(desktopCmd, { stdio: "inherit" });
    execSync(mobileCmd, { stdio: "inherit" });
  }
}

if (!execute) {
  console.log("\nDry-run complete. Pass --execute to generate clips.");
}
