#!/usr/bin/env node
/**
 * YU YAKANG AUDIO — 音频转码脚本
 *
 * 默认 dry-run：检测 ffmpeg，输出转码计划，不写入。
 * 执行转码：node scripts/prepare-audio.mjs --execute
 *
 * 规则：
 * - WAV → MP3 192kbps
 * - 已有 MP3 且 < 15MB → 建议直接复制（由 copy-assets 处理）
 * - 不修改原始 WAV
 * - 输出到 public/audio/
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_AUDIO = path.join(PROJECT_ROOT, "public", "audio");
const SOURCE_ROOT = path.resolve(PROJECT_ROOT, "..", "..");

const EXECUTE = process.argv.includes("--execute");
const BITRATE = "192k";

/** @type {Array<{ source: string; dest: string; slug: string; reason: string }>} */
const AUDIO_JOBS = [
  {
    slug: "mix-gulou-v7",
    source: path.join(SOURCE_ROOT, "后期混音案例", "多轨混音", "鼓楼 v7.mp3"),
    dest: path.join(PUBLIC_AUDIO, "mix-gulou-v7.mp3"),
    reason: "MP3 已就绪，copy-assets 直接复制即可",
  },
  {
    slug: "mix-perfect-world",
    source: path.join(SOURCE_ROOT, "后期混音案例", "多轨混音", "水木年华 《完美世界》FindMix.wav"),
    dest: path.join(PUBLIC_AUDIO, "mix-perfect-world.mp3"),
    reason: "WAV 51MB → 需转 MP3",
  },
  {
    slug: "mix-sanguolian",
    source: path.join(SOURCE_ROOT, "后期混音案例", "贴唱", "三国恋 FindMIX.wav"),
    dest: path.join(PUBLIC_AUDIO, "mix-sanguolian.mp3"),
    reason: "WAV 41MB → 需转 MP3",
  },
  {
    slug: "mix-feige",
    source: path.join(SOURCE_ROOT, "后期混音案例", "贴唱", "飞鸽 FindMIX.wav"),
    dest: path.join(PUBLIC_AUDIO, "mix-feige.mp3"),
    reason: "WAV 40MB → 需转 MP3",
  },
  {
    slug: "mix-nameless",
    source: path.join(SOURCE_ROOT, "后期混音案例", "贴唱", "无名的人 FindMix.mp3"),
    dest: path.join(PUBLIC_AUDIO, "mix-nameless.mp3"),
    reason: "MP3 可选复制（非首批案例）",
  },
  {
    slug: "mix-yingxingzhe",
    source: path.join(SOURCE_ROOT, "后期混音案例", "贴唱", "影行者FindMIX.mp3"),
    dest: path.join(PUBLIC_AUDIO, "mix-yingxingzhe.mp3"),
    reason: "MP3 可选复制（非首批案例）",
  },
];

async function fileExists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function checkFfmpeg() {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.on("close", (code) => resolve({ ok: code === 0, version: out.split("\n")[0] ?? "" }));
    proc.on("error", () => resolve({ ok: false, version: "" }));
  });
}

function transcodeWavToMp3(source, dest) {
  return new Promise((resolve, reject) => {
    const args = ["-y", "-i", source, "-codec:a", "libmp3lame", "-b:a", BITRATE, dest];
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(stderr.slice(-500)))));
    proc.on("error", reject);
  });
}

async function copyMp3(source, dest) {
  const { copyFile } = await import("node:fs/promises");
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(source, dest);
}

async function main() {
  console.log("═".repeat(60));
  console.log("YU YAKANG AUDIO — prepare-audio");
  console.log(`模式: ${EXECUTE ? "EXECUTE" : "DRY-RUN"}`);
  console.log("═".repeat(60));

  const ffmpeg = await checkFfmpeg();
  console.log(ffmpeg.ok ? `✓ ffmpeg: ${ffmpeg.version}` : "✗ ffmpeg 未安装或不在 PATH");

  const manifest = {
    mode: EXECUTE ? "execute" : "dry-run",
    generatedAt: new Date().toISOString(),
    ffmpegAvailable: ffmpeg.ok,
    bitrate: BITRATE,
    tracks: [],
  };

  for (const job of AUDIO_JOBS) {
    const ext = path.extname(job.source).toLowerCase();
    const sourceExists = await fileExists(job.source);
    const destExists = await fileExists(job.dest);

    const track = {
      slug: job.slug,
      source: job.source,
      dest: job.dest,
      sourceExists,
      destExists,
      reason: job.reason,
      action: "skip",
    };

    if (!sourceExists) {
      track.action = "skip-missing-source";
      console.log(`⚠ ${job.slug}: 源文件不存在`);
    } else if (destExists) {
      track.action = "skip-dest-exists";
      console.log(`⏭ ${job.slug}: 目标已存在`);
    } else if (ext === ".mp3") {
      track.action = EXECUTE ? "copy" : "would-copy";
      console.log(`${EXECUTE ? "→" : "○"} ${job.slug}: 复制 MP3`);
      if (EXECUTE) {
        await copyMp3(job.source, job.dest);
        track.action = "copied";
      }
    } else if (ext === ".wav") {
      if (!ffmpeg.ok) {
        track.action = "skip-no-ffmpeg";
        console.log(`✗ ${job.slug}: 需要 ffmpeg 转码 WAV`);
      } else {
        track.action = EXECUTE ? "transcode" : "would-transcode";
        console.log(`${EXECUTE ? "→" : "○"} ${job.slug}: WAV → MP3 @ ${BITRATE}`);
        if (EXECUTE) {
          await mkdir(path.dirname(job.dest), { recursive: true });
          await transcodeWavToMp3(job.source, job.dest);
          track.action = "transcoded";
        }
      }
    }

    manifest.tracks.push(track);
  }

  const outPath = path.join(PROJECT_ROOT, "scripts", "output", "audio-manifest.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  if (EXECUTE || !EXECUTE) {
    await writeFile(outPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`\n音频清单: ${outPath}`);
  }

  if (!ffmpeg.ok) {
    console.log("\n安装 ffmpeg 后重试。Windows: winget install ffmpeg");
  }
  if (!EXECUTE) {
    console.log("\n确认后执行: node scripts/prepare-audio.mjs --execute");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
