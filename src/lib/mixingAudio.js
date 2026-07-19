import { randomUUID } from "./id.js";

export const MIXING_AUDIO_CATEGORIES = new Set([
  "mixing-post-production",
  "recording-editing",
]);

export function isMixingAudioCase(caseItem) {
  return MIXING_AUDIO_CATEGORIES.has(caseItem?.category);
}

export function createEmptyMixingTrack(order = 1, prefix = "track") {
  return {
    id: `${prefix}-${randomUUID().slice(0, 8)}`,
    name: "",
    description: "",
    audioUrl: "",
    duration: "",
    order,
    enabled: true,
  };
}

export function createDefaultMixingAudioModules() {
  return {
    enabled: false,
    vocalTune: {
      title: { cn: "贴唱", en: "Vocal Tune" },
      description: {
        cn: "展示贴唱混音、修唱、人声处理与整体声音完成度相关音频。",
        en: "Vocal-focused mixes, tuning and polish examples.",
      },
      tracks: [],
    },
    multitrack: {
      title: { cn: "分轨", en: "Multitrack" },
      description: {
        cn: "展示分轨混音、乐器层次、空间关系与整体动态控制相关音频。",
        en: "Multitrack mixes — balance, space and dynamics.",
      },
      tracks: [],
    },
  };
}

function normalizeTrack(track, index, prefix) {
  if (!track || typeof track !== "object") return null;
  const audioUrl = String(track.audioUrl || "").trim();
  return {
    id: track.id || `${prefix}-${index + 1}`,
    name: typeof track.name === "string" ? track.name : "",
    description: typeof track.description === "string" ? track.description : "",
    audioUrl,
    duration: track.duration ?? "",
    order: track.order ?? index + 1,
    enabled: track.enabled !== false,
  };
}

function normalizeGroup(group, fallbackTitle, prefix) {
  const base = createDefaultMixingAudioModules()[prefix === "vocal" ? "vocalTune" : "multitrack"];
  const source = group && typeof group === "object" ? group : {};
  const tracks = Array.isArray(source.tracks)
    ? source.tracks
        .map((t, i) => normalizeTrack(t, i, prefix))
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return {
    title: source.title ?? fallbackTitle ?? base.title,
    description: source.description ?? base.description,
    tracks,
  };
}

/** Normalize for admin save / runtime safety. */
export function normalizeMixingAudioModules(modules) {
  const defaults = createDefaultMixingAudioModules();
  if (!modules || typeof modules !== "object") return defaults;
  return {
    enabled: modules.enabled === true,
    vocalTune: normalizeGroup(modules.vocalTune, defaults.vocalTune.title, "vocal"),
    multitrack: normalizeGroup(modules.multitrack, defaults.multitrack.title, "multi"),
  };
}

function visibleTracks(group) {
  return (group?.tracks ?? []).filter(
    (t) => t && t.enabled !== false && String(t.audioUrl || "").trim()
  );
}

/**
 * Resolve modules for public case detail (strict).
 * Requires mixing category + enabled + at least one playable track.
 */
export function getVisibleMixingAudioModules(caseItem) {
  if (!isMixingAudioCase(caseItem)) return null;
  const modules = normalizeMixingAudioModules(caseItem.mixingAudioModules);
  if (!modules.enabled) return null;

  const vocalTracks = visibleTracks(modules.vocalTune);
  const multiTracks = visibleTracks(modules.multitrack);
  if (!vocalTracks.length && !multiTracks.length) return null;

  return {
    ...modules,
    vocalTune: { ...modules.vocalTune, tracks: vocalTracks },
    multitrack: { ...modules.multitrack, tracks: multiTracks },
  };
}

/**
 * Mixing case detail layout: always return 贴唱 + 分轨 shells.
 * Tracks are filtered to playable ones; empty groups still render.
 * If modules.enabled is false, still return shells (empty) so the page
 * structure stays「贴唱 / 分轨」without falling back to media rack.
 */
export function getMixingDetailModules(caseItem) {
  if (!isMixingAudioCase(caseItem)) return null;
  const modules = normalizeMixingAudioModules(caseItem.mixingAudioModules);
  const showTracks = modules.enabled === true;
  return {
    ...modules,
    vocalTune: {
      ...modules.vocalTune,
      tracks: showTracks ? visibleTracks(modules.vocalTune) : [],
    },
    multitrack: {
      ...modules.multitrack,
      tracks: showTracks ? visibleTracks(modules.multitrack) : [],
    },
  };
}
