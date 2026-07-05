/** About page fallback copy — no CMS schema changes. */

export const SIGNAL_IDENTITY_NODES = [
  {
    id: "recording",
    label: "RECORDING",
    labelCn: "录音技术背景",
    desc: {
      cn: "录音技术专业背景，理解声音采集、素材质量与后期处理基础。",
      en: "Recording technology foundation — capture, source quality and post-production basics.",
    },
  },
  {
    id: "live",
    label: "LIVE SOUND",
    labelCn: "现场调音",
    desc: {
      cn: "面向 Livehouse、演出现场与活动扩声，处理人声、乐器、返听与现场动态。",
      en: "Livehouse, concerts and events — vocals, instruments, monitors and dynamics.",
    },
  },
  {
    id: "system",
    label: "SYSTEM TUNING",
    labelCn: "系统调试",
    desc: {
      cn: "关注覆盖、相位、延时、低频、增益结构与系统稳定性。",
      en: "Coverage, phase, delay, low-end coupling, gain structure and stability.",
    },
  },
  {
    id: "mixing",
    label: "MIXING",
    labelCn: "混音后期",
    desc: {
      cn: "处理人声贴合、空间感、动态控制与作品完成度。",
      en: "Vocal blend, space, dynamics and mix completion.",
    },
  },
  {
    id: "delivery",
    label: "DELIVERY",
    labelCn: "项目交付",
    desc: {
      cn: "整理项目记录、复盘现场问题，并提供后续优化建议。",
      en: "Project documentation, on-site review and follow-up optimization.",
    },
  },
];

export const CONTROL_SURFACE_CHANNELS = [
  {
    id: "foh",
    label: "FOH",
    level: 88,
    desc: {
      cn: "主扩调音、人声清晰度、现场动态控制。",
      en: "Front-of-house mixing, vocal clarity and live dynamics.",
    },
  },
  {
    id: "monitor",
    label: "MONITOR",
    level: 82,
    desc: {
      cn: "返听稳定性、舞台反馈、乐手监听需求。",
      en: "Monitor stability, stage feedback and artist listening needs.",
    },
  },
  {
    id: "system",
    label: "SYSTEM",
    level: 92,
    desc: {
      cn: "覆盖、相位、延时、低频与系统调试。",
      en: "Coverage, phase, delay, low-end and system tuning.",
    },
  },
  {
    id: "mixing",
    label: "MIXING",
    level: 84,
    desc: {
      cn: "人声贴合、层次、空间感与作品完成度。",
      en: "Vocal blend, depth, space and mix completion.",
    },
  },
  {
    id: "recording",
    label: "RECORDING",
    level: 78,
    desc: {
      cn: "素材质量、录音基础、音频编辑与整理。",
      en: "Source quality, recording basics, editing and organization.",
    },
  },
  {
    id: "delivery",
    label: "DELIVERY",
    level: 90,
    desc: {
      cn: "项目沟通、执行、复盘和交付。",
      en: "Communication, execution, review and delivery.",
    },
  },
];

export const EXPERIENCE_TIMELINE_CUES = [
  {
    id: "cue-1",
    timecode: "00:00",
    title: { cn: "录音技术专业背景", en: "Recording Technology Foundation" },
    desc: {
      cn: "建立声音采集、音频编辑、信号处理与作品制作的基础认知。",
      en: "Built foundation in capture, editing, signal flow and production.",
    },
  },
  {
    id: "cue-2",
    timecode: "00:15",
    title: { cn: "现场扩声实践", en: "Live Sound Practice" },
    desc: {
      cn: "进入真实演出环境，处理人声、乐器、返听和现场动态。",
      en: "Real show environments — vocals, instruments, monitors and dynamics.",
    },
  },
  {
    id: "cue-3",
    timecode: "00:34",
    title: { cn: "Livehouse 调音项目", en: "Livehouse Projects" },
    desc: {
      cn: "参与 Livehouse、音乐现场和活动项目，积累不同场地的声音处理经验。",
      en: "Livehouse, music venues and events across different room contexts.",
    },
  },
  {
    id: "cue-4",
    timecode: "00:58",
    title: { cn: "系统工程与设备调试", en: "System Engineering & Tuning" },
    desc: {
      cn: "关注音箱覆盖、相位、延时、低频耦合与系统稳定性。",
      en: "Speaker coverage, phase, delay, low-end coupling and stability.",
    },
  },
  {
    id: "cue-5",
    timecode: "01:21",
    title: { cn: "混音后期与项目交付", en: "Mixing & Project Delivery" },
    desc: {
      cn: "完成后期混音、素材整理、项目复盘与交付。",
      en: "Post-production mixing, asset organization, review and delivery.",
    },
  },
];

export const TOOL_RACK_FALLBACK = [
  { cn: "中国录音师协会会员", en: "China Recording Engineers Association" },
  { cn: "dBsource 音响系统工程师", en: "dBsource Sound System Engineer" },
  { cn: "VOS 认证音响系统工程师", en: "VOS Certified Sound System Engineer" },
  { cn: "DiGiCo 高级技术培训", en: "DiGiCo Advanced Technical Training" },
  { cn: "录音技术专业背景", en: "Recording Technology Graduate" },
  { cn: "现场扩声 / 系统调试 / 混音后期", en: "Live Sound / System Tuning / Mixing" },
];

export const WORK_PHILOSOPHY = {
  intro: {
    cn: "我更关注声音系统的整体关系，而不是单独调一个参数。一个现场声音问题，往往不是单点问题，而是场地、设备、摆位、相位、增益结构、监听和演出内容共同作用的结果。我的工作方式，是先判断系统，再处理声音；先保证稳定，再追求表现。",
    en: "I focus on how the whole sound system works together — not a single knob. Most live issues come from venue, gear, placement, phase, gain structure, monitoring and the show itself. My approach: understand the system first, then shape the sound; stability before style.",
  },
  principles: [
    {
      id: "system-first",
      label: "SYSTEM FIRST",
      title: { cn: "先判断系统，再处理声音。", en: "Understand the system before shaping the sound." },
    },
    {
      id: "stability",
      label: "STABILITY BEFORE STYLE",
      title: { cn: "先保证稳定，再追求表现。", en: "Stability before expression." },
    },
    {
      id: "problem",
      label: "PROBLEM BEFORE PARAMETER",
      title: { cn: "先确认问题，再调整参数。", en: "Confirm the problem before touching a parameter." },
    },
  ],
};

export const ENGINEER_IDENTITY_TAGLINE = {
  cn: "不是只做声音放大，而是让系统、场地、设备和音乐在现场稳定工作。",
  en: "Not just making things louder — making the system, venue, gear and music work together on site.",
};

export const ENGINEER_PARAMS = {
  id: "YUYAKANG-FOH-001",
  status: { cn: "可预约", en: "AVAILABLE" },
  role: "SYSTEM ENGINEER",
  field: "LIVE SOUND / SYSTEM TUNING / MIXING",
};

/** Build tool rack items from CMS certificates + profile tools, with fallback. */
export function buildToolRackItems({ certificates = [], profile, lang, t }) {
  const items = [];

  for (const cert of certificates) {
    if (cert?.title) {
      items.push({
        id: cert.id || `cert-${items.length}`,
        label: t(cert.title, lang),
        source: "certificate",
      });
    }
  }

  if (profile?.affiliation) {
    const parts = t(profile.affiliation, lang).split(/[·•|/]/).map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (!items.some((i) => i.label === part)) {
        items.push({ id: `aff-${items.length}`, label: part, source: "affiliation" });
      }
    }
  }

  if (profile?.tools?.length) {
    for (const tool of profile.tools) {
      const label = `${t(tool.label, lang)} — ${t(tool.value, lang)}`;
      if (!label.includes("[TODO]") && !label.includes("待补充")) {
        items.push({ id: `tool-${tool.label?.cn}`, label, source: "tool" });
      }
    }
  }

  if (items.length === 0) {
    return TOOL_RACK_FALLBACK.map((item, i) => ({
      id: `fallback-${i}`,
      label: item[lang] || item.cn,
      source: "fallback",
    }));
  }

  return items;
}

/** Merge CMS experience into timeline when labels are meaningful. */
export function buildExperienceCues(profile, lang, t) {
  const cmsItems = (profile?.experience ?? []).filter(
    (item) => {
      const val = t(item.value, lang);
      return val && !val.includes("[TODO]") && !val.includes("待补充");
    }
  );

  if (!cmsItems.length) return EXPERIENCE_TIMELINE_CUES;

  return cmsItems.map((item, i) => ({
    id: `exp-${i}`,
    timecode: `0${i}:${String(i * 12).padStart(2, "0")}`,
    title: item.label,
    desc: item.value,
  }));
}
