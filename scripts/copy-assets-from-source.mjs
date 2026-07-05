#!/usr/bin/env node
/**
 * YU YAKANG AUDIO — 素材复制脚本
 *
 * 默认 dry-run：只输出将要复制的文件清单，不写入磁盘。
 * 执行复制：node scripts/copy-assets-from-source.mjs --execute
 *
 * 安全规则：
 * - 不修改、不移动、不删除原始资料目录任何文件
 * - 不覆盖已存在的目标文件（跳过或追加序号）
 * - 所有写入仅限 yuyakang-audio-site/public/
 */

import { copyFile, mkdir, access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const SOURCE_ROOT = path.resolve(PROJECT_ROOT, "..", "..");

const EXECUTE = process.argv.includes("--execute");

/** @type {Array<{ source: string; dest: string; category: string; slug?: string; note?: string }>} */
const ASSET_MAP = [
  // ── Hero 源片段（混剪前） ──
  {
    category: "hero-source",
    slug: "echo-live",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "云浮市 ECHO.回声 Live  （系统工程+调音）", "视频", "38184121b138e71b5d2392736a4a9c42.mp4"),
    dest: path.join(PUBLIC_ROOT, "hero", "source-clips", "hero-source-echo-live.mp4"),
  },
  {
    category: "hero-source",
    slug: "wild-live",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "深圳南山 Wild Live  （系统工程+调音）", "视频", "aed582b70754e99c4dd68f955ba16d1e.mp4"),
    dest: path.join(PUBLIC_ROOT, "hero", "source-clips", "hero-source-wild-live.mp4"),
  },
  {
    category: "hero-source",
    slug: "maca-live",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "肇庆广宁 Maca音乐客厅 Live  （系统工程+调音）", "视频", "317d78ff46102b3226f501f24a8c4058.mp4"),
    dest: path.join(PUBLIC_ROOT, "hero", "source-clips", "hero-source-maca-live.mp4"),
  },
  {
    category: "hero-source",
    slug: "shuimuhuaya-jdz",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "水木年华25周年全国巡回演唱会 景德镇站 （系统工程）", "视频", "1e93754acb3e26666bfb025b956ad4bb.mp4"),
    dest: path.join(PUBLIC_ROOT, "hero", "source-clips", "hero-source-shuimuhuaya-jdz.mp4"),
  },
  {
    category: "hero-source",
    slug: "ncnu-graduation",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "南昌师范学院毕业晚会 （调音）", "视频", "8c252cc94c12a51a3a2e1710203fffbc.mp4"),
    dest: path.join(PUBLIC_ROOT, "hero", "source-clips", "hero-source-ncnu-graduation.mp4"),
  },
  {
    category: "hero-source",
    slug: "mix-recording",
    source: path.join(SOURCE_ROOT, "后期混音案例", "实录视频", "4dccca618d72cf1dd8440c032a464eb8.mp4"),
    dest: path.join(PUBLIC_ROOT, "hero", "source-clips", "hero-source-mix-recording.mp4"),
    note: "后期混音实录第 1 段；如需换另一段请改 ASSET_MAP",
  },

  // ── 案例：ECHO ──
  {
    category: "case-video",
    slug: "echo-live-yunfu",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "云浮市 ECHO.回声 Live  （系统工程+调音）", "视频", "38184121b138e71b5d2392736a4a9c42.mp4"),
    dest: path.join(PUBLIC_ROOT, "cases", "echo-live-yunfu", "video.mp4"),
  },
  ...[
    "微信图片_20260702204120_248_140.jpg",
    "微信图片_20260702204121_249_140.jpg",
    "微信图片_20260702204122_250_140.jpg",
    "微信图片_20260702204122_251_140.jpg",
  ].map((filename, i) => ({
    category: "case-gallery",
    slug: "echo-live-yunfu",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "云浮市 ECHO.回声 Live  （系统工程+调音）", "图片", filename),
    dest: path.join(PUBLIC_ROOT, "cases", "echo-live-yunfu", "gallery", `gallery-${String(i + 1).padStart(2, "0")}.jpg`),
  })),

  // ── 案例：Wild Live ──
  {
    category: "case-video",
    slug: "wild-live-shenzhen",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "深圳南山 Wild Live  （系统工程+调音）", "视频", "aed582b70754e99c4dd68f955ba16d1e.mp4"),
    dest: path.join(PUBLIC_ROOT, "cases", "wild-live-shenzhen", "video.mp4"),
  },
  {
    category: "case-gallery",
    slug: "wild-live-shenzhen",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "深圳南山 Wild Live  （系统工程+调音）", "图片", "3592b3dc25d650662625012f9c0c4f19.png"),
    dest: path.join(PUBLIC_ROOT, "cases", "wild-live-shenzhen", "gallery", "gallery-01.png"),
  },
  {
    category: "case-gallery",
    slug: "wild-live-shenzhen",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "深圳南山 Wild Live  （系统工程+调音）", "图片", "微信图片_20260702210356_281_140.jpg"),
    dest: path.join(PUBLIC_ROOT, "cases", "wild-live-shenzhen", "gallery", "gallery-02.jpg"),
  },
  {
    category: "case-gallery",
    slug: "wild-live-shenzhen",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "深圳南山 Wild Live  （系统工程+调音）", "图片", "微信图片_20260702210420_282_140.jpg"),
    dest: path.join(PUBLIC_ROOT, "cases", "wild-live-shenzhen", "gallery", "gallery-03.jpg"),
  },

  // ── 案例：Maca ──
  {
    category: "case-video",
    slug: "maca-live-guangning",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "肇庆广宁 Maca音乐客厅 Live  （系统工程+调音）", "视频", "317d78ff46102b3226f501f24a8c4058.mp4"),
    dest: path.join(PUBLIC_ROOT, "cases", "maca-live-guangning", "video.mp4"),
  },
  ...[
    "微信图片_20260702203828_242_140.jpg",
    "微信图片_20260702203830_243_140.jpg",
    "微信图片_20260702203831_244_140.jpg",
    "微信图片_20260702203832_245_140.jpg",
    "微信图片_20260702203832_246_140.jpg",
  ].map((filename, i) => ({
    category: "case-gallery",
    slug: "maca-live-guangning",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "肇庆广宁 Maca音乐客厅 Live  （系统工程+调音）", "图片", filename),
    dest: path.join(PUBLIC_ROOT, "cases", "maca-live-guangning", "gallery", `gallery-${String(i + 1).padStart(2, "0")}.jpg`),
  })),

  // ── 案例：水木年华 ──
  {
    category: "case-video",
    slug: "shuimuhuaya-jingdezhen-2025",
    source: path.join(SOURCE_ROOT, "系统工程，调音案例", "水木年华25周年全国巡回演唱会 景德镇站 （系统工程）", "视频", "1e93754acb3e26666bfb025b956ad4bb.mp4"),
    dest: path.join(PUBLIC_ROOT, "cases", "shuimuhuaya-jingdezhen-2025", "video.mp4"),
  },
  ...[
    "253", "254", "255", "256", "257", "258", "259", "260", "261", "262", "265",
  ].map((id, i) => {
    const filenames = {
      253: "微信图片_20260702204808_253_140.jpg",
      254: "微信图片_20260702204809_254_140.jpg",
      255: "微信图片_20260702204810_255_140.jpg",
      256: "微信图片_20260702204811_256_140.jpg",
      257: "微信图片_20260702204812_257_140.jpg",
      258: "微信图片_20260702204813_258_140.jpg",
      259: "微信图片_20260702204814_259_140.jpg",
      260: "微信图片_20260702204815_260_140.jpg",
      261: "微信图片_20260702204816_261_140.jpg",
      262: "微信图片_20260702204908_262_140.jpg",
      265: "微信图片_20260702205143_265_140.jpg",
    };
    return {
      category: "case-gallery",
      slug: "shuimuhuaya-jingdezhen-2025",
      source: path.join(SOURCE_ROOT, "系统工程，调音案例", "水木年华25周年全国巡回演唱会 景德镇站 （系统工程）", "图片", filenames[id]),
      dest: path.join(PUBLIC_ROOT, "cases", "shuimuhuaya-jingdezhen-2025", "gallery", `gallery-${String(i + 1).padStart(2, "0")}.jpg`),
    };
  }),

  // ── 案例：鼓楼混音 ──
  {
    category: "case-audio",
    slug: "mix-gulou-v7",
    source: path.join(SOURCE_ROOT, "后期混音案例", "多轨混音", "鼓楼 v7.mp3"),
    dest: path.join(PUBLIC_ROOT, "audio", "mix-gulou-v7.mp3"),
    note: "MP3 可直接复制；optimize/prepare-audio 可跳过",
  },

  // ── 案例：声学模拟·酒馆 ──
  {
    category: "case-cover",
    slug: "acoustic-simulation-tavern",
    source: path.join(SOURCE_ROOT, "声学模拟制作案例", "酒馆.png"),
    dest: path.join(PUBLIC_ROOT, "cases", "acoustic-simulation-tavern", "cover.png"),
  },

  // ── 证书 ──
  {
    category: "certificate",
    source: path.join(SOURCE_ROOT, "相关证书", "微信图片_20260702220305_290_140.jpg"),
    dest: path.join(PUBLIC_ROOT, "certificates", "cert-01.jpg"),
  },
  {
    category: "certificate",
    source: path.join(SOURCE_ROOT, "相关证书", "微信图片_20260702220306_291_140.jpg"),
    dest: path.join(PUBLIC_ROOT, "certificates", "cert-02.jpg"),
  },
  {
    category: "certificate",
    source: path.join(SOURCE_ROOT, "相关证书", "微信图片_20260702220713_292_140.jpg"),
    dest: path.join(PUBLIC_ROOT, "certificates", "cert-03.jpg"),
  },

  // ── 工作照 ──
  ...[
    "微信图片_20260702205352_266_140.jpg",
    "微信图片_20260702205353_267_140.jpg",
    "微信图片_20260702205353_268_140.jpg",
    "微信图片_20260702205354_269_140.jpg",
    "微信图片_20260702205355_270_140.jpg",
    "微信图片_20260702205356_271_140.jpg",
  ].map((filename, i) => ({
    category: "about-work",
    source: path.join(SOURCE_ROOT, "零散的工作照", filename),
    dest: path.join(PUBLIC_ROOT, "images", "about", `work-${String(i + 1).padStart(2, "0")}.jpg`),
  })),
];

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveDestPath(destPath) {
  if (!(await fileExists(destPath))) return destPath;
  const dir = path.dirname(destPath);
  const ext = path.extname(destPath);
  const base = path.basename(destPath, ext);
  let n = 1;
  while (await fileExists(path.join(dir, `${base}-${n}${ext}`))) n++;
  return path.join(dir, `${base}-${n}${ext}`);
}

async function formatSize(filePath) {
  try {
    const s = await stat(filePath);
    return `${(s.size / 1024 / 1024).toFixed(2)} MB`;
  } catch {
    return "N/A";
  }
}

async function main() {
  console.log("═".repeat(60));
  console.log("YU YAKANG AUDIO — copy-assets-from-source");
  console.log(`模式: ${EXECUTE ? "EXECUTE（将写入文件）" : "DRY-RUN（仅预览）"}`);
  console.log(`源目录: ${SOURCE_ROOT}`);
  console.log(`目标目录: ${PUBLIC_ROOT}`);
  console.log("═".repeat(60));

  const report = {
    mode: EXECUTE ? "execute" : "dry-run",
    generatedAt: new Date().toISOString(),
    items: [],
    summary: { total: 0, ready: 0, skipMissing: 0, skipExists: 0, copied: 0, errors: 0 },
  };

  for (const item of ASSET_MAP) {
    report.summary.total++;
    const sourceExists = await fileExists(item.source);
    const destExists = await fileExists(item.dest);
    const size = sourceExists ? await formatSize(item.source) : "N/A";

    const entry = {
      category: item.category,
      slug: item.slug ?? null,
      source: item.source,
      dest: item.dest,
      sourceExists,
      destExists,
      size,
      note: item.note ?? null,
      action: "pending",
    };

    if (!sourceExists) {
      entry.action = "skip-missing-source";
      report.summary.skipMissing++;
      console.log(`⚠ SKIP (源不存在): ${path.basename(item.source)}`);
      report.items.push(entry);
      continue;
    }

    if (destExists) {
      entry.action = "skip-dest-exists";
      entry.resolvedDest = item.dest;
      report.summary.skipExists++;
      console.log(`⏭ SKIP (目标已存在): ${path.relative(PUBLIC_ROOT, item.dest)}`);
      report.items.push(entry);
      continue;
    }

    entry.action = EXECUTE ? "copy" : "would-copy";
    entry.resolvedDest = item.dest;
    report.summary.ready++;

    if (EXECUTE) {
      try {
        const finalDest = await resolveDestPath(item.dest);
        await mkdir(path.dirname(finalDest), { recursive: true });
        await copyFile(item.source, finalDest);
        entry.resolvedDest = finalDest;
        entry.action = "copied";
        report.summary.copied++;
        console.log(`✓ COPIED: → ${path.relative(PUBLIC_ROOT, finalDest)}`);
      } catch (err) {
        entry.action = "error";
        entry.error = err.message;
        report.summary.errors++;
        console.log(`✗ ERROR: ${err.message}`);
      }
    } else {
      console.log(`→ WOULD COPY [${item.category}] ${size}`);
      console.log(`    ${item.source}`);
      console.log(`    → ${item.dest}`);
    }

    report.items.push(entry);
  }

  const manifestPath = path.join(PROJECT_ROOT, "scripts", "output", "asset-copy-manifest.json");
  if (EXECUTE) {
    await mkdir(path.dirname(manifestPath), { recursive: true });
    const { writeFile } = await import("node:fs/promises");
    await writeFile(manifestPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\n清单已写入: ${manifestPath}`);
  }

  console.log("\n" + "─".repeat(60));
  console.log("汇总:", report.summary);
  if (!EXECUTE) {
    console.log("\n确认无误后执行: node scripts/copy-assets-from-source.mjs --execute");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
