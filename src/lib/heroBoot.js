/** Split hero headline into two lines for boot animation (no CMS schema change). */

function normalizeHeadline(text) {
  return text.replace(/\s+/g, " ").trim();
}

const PRESET_SPLITS = [
  {
    match: /现场调音\s*\/\s*系统工程\s*\/\s*混音后期/,
    lines: ["现场调音 / 系统", "工程 / 混音后期"],
  },
  {
    match: /live sound\s*\/\s*system tuning\s*\/\s*mixing/i,
    lines: ["Live Sound / System", "Tuning / Mixing"],
  },
  {
    match: /live sound\s*\/\s*system tuning\s*\/\s*mixing engineer/i,
    lines: ["Live Sound / System", "Tuning / Mixing"],
  },
];

export function splitHeroHeadline(text) {
  if (!text || typeof text !== "string") return [text || ""];

  const normalized = normalizeHeadline(text);

  for (const preset of PRESET_SPLITS) {
    if (preset.match.test(normalized)) {
      return preset.lines;
    }
  }

  const parts = normalized.split(/\s*\/\s*/).filter(Boolean);
  if (parts.length <= 1) return [text];
  if (parts.length === 2) return parts;

  if (parts.length === 3) {
    return [`${parts[0]} / ${parts[1]}`, parts[2]];
  }

  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" / "), parts.slice(mid).join(" / ")];
}
