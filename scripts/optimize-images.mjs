#!/usr/bin/env node
/**
 * YU YAKANG AUDIO — 图片优化脚本
 *
 * 默认 dry-run：输出优化计划，不写入。
 * 执行优化：node scripts/optimize-images.mjs --execute
 *
 * 依赖：sharp（执行前需 npm install sharp，本脚本不在第 0 步自动安装）
 *
 * 规则：
 * - JPG/PNG → WebP
 * - display: max 1920px, quality 82
 * - thumb: max 640px, quality 78
 * - 不修改原始图片
 * - 读取 public/ 内 copy-assets 生成的副本
 */

import { access, mkdir, writeFile, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");

const EXECUTE = process.argv.includes("--execute");

const DISPLAY = { maxWidth: 1920, quality: 82, suffix: "" };
const THUMB = { maxWidth: 640, quality: 78, suffix: "-thumb" };

const SCAN_DIRS = [
  path.join(PUBLIC_ROOT, "cases"),
  path.join(PUBLIC_ROOT, "certificates"),
  path.join(PUBLIC_ROOT, "images"),
];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);

/** 跳过二维码等需保持原格式的文件 */
const SKIP_BASENAMES = new Set(["wechat-qr"]);

async function fileExists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectImages(dir, acc = []) {
  if (!(await fileExists(dir))) return acc;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await collectImages(full, acc);
    else if (IMAGE_EXT.has(path.extname(e.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    return null;
  }
}

function webpPath(srcPath, suffix) {
  const dir = path.dirname(srcPath);
  const base = path.basename(srcPath, path.extname(srcPath));
  return path.join(dir, `${base}${suffix}.webp`);
}

async function optimizeOne(sharp, srcPath, preset) {
  const dest = webpPath(srcPath, preset.suffix);
  if (await fileExists(dest)) return { srcPath, dest, action: "skip-exists" };

  if (!EXECUTE) return { srcPath, dest, action: "would-optimize", preset: preset.maxWidth };

  await sharp(srcPath)
    .resize({ width: preset.maxWidth, withoutEnlargement: true })
    .webp({ quality: preset.quality })
    .toFile(dest);

  const [srcStat, destStat] = await Promise.all([stat(srcPath), stat(dest)]);
  return {
    srcPath,
    dest,
    action: "optimized",
    savedBytes: srcStat.size - destStat.size,
  };
}

async function main() {
  console.log("═".repeat(60));
  console.log("YU YAKANG AUDIO — optimize-images");
  console.log(`模式: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}`);
  console.log("═".repeat(60));

  const sharp = EXECUTE ? await loadSharp() : null;
  if (EXECUTE && !sharp) {
    console.error("✗ sharp 未安装。请先运行: npm install sharp");
    process.exit(1);
  }

  const sources = [];
  for (const dir of SCAN_DIRS) {
    const imgs = await collectImages(dir);
    sources.push(...imgs);
  }

  if (sources.length === 0) {
    console.log("○ public/ 内暂无 JPG/PNG 副本。");
    console.log("  请先运行: node scripts/copy-assets-from-source.mjs --execute");
  }

  const manifest = {
    mode: EXECUTE ? "execute" : "dry-run",
    generatedAt: new Date().toISOString(),
    sharpAvailable: !!sharp,
    items: [],
    summary: { total: 0, optimized: 0, skipped: 0, planned: 0 },
  };

  for (const srcPath of sources) {
    const base = path.basename(srcPath, path.extname(srcPath));
    if (SKIP_BASENAMES.has(base)) {
      console.log(`⊘ SKIP (二维码/原图保留): ${path.relative(PUBLIC_ROOT, srcPath)}`);
      manifest.summary.skipped++;
      manifest.items.push({ src: path.relative(PUBLIC_ROOT, srcPath), action: "skip-qrcode" });
      continue;
    }

    for (const preset of [DISPLAY, THUMB]) {
      manifest.summary.total++;
      const rel = path.relative(PUBLIC_ROOT, srcPath);
      const dest = webpPath(srcPath, preset.suffix);
      const destExists = await fileExists(dest);

      if (destExists) {
        manifest.summary.skipped++;
        manifest.items.push({ src: rel, dest: path.relative(PUBLIC_ROOT, dest), action: "skip-exists" });
        continue;
      }

      if (EXECUTE && sharp) {
        const result = await optimizeOne(sharp, srcPath, preset);
        manifest.items.push({
          src: rel,
          dest: path.relative(PUBLIC_ROOT, result.dest),
          action: result.action,
          savedBytes: result.savedBytes ?? null,
        });
        if (result.action === "optimized") manifest.summary.optimized++;
      } else {
        manifest.summary.planned++;
        manifest.items.push({
          src: rel,
          dest: path.relative(PUBLIC_ROOT, dest),
          action: "would-optimize",
          maxWidth: preset.maxWidth,
        });
        console.log(`○ ${rel} → ${path.basename(dest)} (${preset.maxWidth}px)`);
      }
    }
  }

  const outPath = path.join(PROJECT_ROOT, "scripts", "output", "image-manifest.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n清单: ${outPath}`);
  console.log("汇总:", manifest.summary);

  if (!EXECUTE) {
    console.log("\n先 copy-assets，再: node scripts/optimize-images.mjs --execute");
    console.log("（需先 npm install sharp）");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
