/** Homepage-only copy and fallbacks — does not alter CMS JSON schema. */

export const HERO_LEAD = {
  cn: "面向 Livehouse、演出现场、系统调试与混音后期的声音解决方案。",
  en: "Live sound, system tuning and mixing solutions for livehouse, events and audio projects.",
};

export const CREDENTIALS_SUBTITLE = {
  cn: "以录音技术、系统工程和现场调音经验为基础，服务 Livehouse、演出现场与声音项目交付。",
  en: "Built on recording engineering, system design and live sound experience for venues and audio projects.",
};

export const ENGINEERING_TAGS = [
  "CERTIFIED",
  "SYSTEM ENGINEER",
  "LIVE SOUND",
  "MIXING",
  "VOS",
  "DIGICO",
  "RECORDING",
];

export const CREDENTIAL_IDENTITIES = {
  cn: [
    "中国录音师协会会员",
    "dBsource 音响系统工程师",
    "VOS 认证音响系统工程师",
    "DiGiCo 高级技术培训",
    "录音技术专业背景",
    "现场扩声 / 系统调试 / 混音后期",
  ],
  en: [
    "Recording Engineers Association of China",
    "dBsource System Engineer",
    "VOS Certified System Engineer",
    "DiGiCo Advanced Training",
    "Recording Technology Background",
    "Live Sound / System Tuning / Mixing",
  ],
};

const SERVICE_PROBLEM_FALLBACKS = {
  "livehouse-sound": {
    cn: ["人声不清", "低频浑浊", "返听混乱", "现场动态失控"],
    en: ["Unclear vocals", "Muddy low end", "Monitor chaos", "Uncontrolled dynamics"],
  },
  "system-engineering": {
    cn: ["覆盖不均", "相位抵消", "延时不准", "低频耦合问题"],
    en: ["Uneven coverage", "Phase cancellation", "Delay misalignment", "LF coupling issues"],
  },
  "mixing-post": {
    cn: ["人声贴合度", "动态控制", "空间感", "作品完成度"],
    en: ["Vocal blend", "Dynamic control", "Spatial depth", "Mix polish"],
  },
  "recording-editing": {
    cn: ["录音素材整理", "修唱修节奏", "噪声处理", "交付格式整理"],
    en: ["Session organization", "Pitch & timing edits", "Noise reduction", "Delivery prep"],
  },
};

const SLUG_ALIASES = {
  livehouse: "livehouse-sound",
  system: "system-engineering",
  mixing: "mixing-post",
  recording: "recording-editing",
};

export function getServiceProblems(service, lang = "cn") {
  if (service?.problems) {
    if (Array.isArray(service.problems)) return service.problems;
    if (service.problems[lang]) return service.problems[lang];
    if (service.problems.cn) return service.problems.cn;
  }

  const slug = service?.slug || "";
  const direct = SERVICE_PROBLEM_FALLBACKS[slug];
  if (direct) return direct[lang] || direct.cn;

  const aliasKey = Object.keys(SLUG_ALIASES).find((key) => slug.includes(key));
  if (aliasKey) {
    const mapped = SERVICE_PROBLEM_FALLBACKS[SLUG_ALIASES[aliasKey]];
    if (mapped) return mapped[lang] || mapped.cn;
  }

  const title = (service?.title?.cn || service?.title || "").toLowerCase();
  if (title.includes("livehouse") || title.includes("现场")) {
    return SERVICE_PROBLEM_FALLBACKS["livehouse-sound"][lang];
  }
  if (title.includes("系统") || title.includes("system")) {
    return SERVICE_PROBLEM_FALLBACKS["system-engineering"][lang];
  }
  if (title.includes("混音") || title.includes("mix")) {
    return SERVICE_PROBLEM_FALLBACKS["mixing-post"][lang];
  }
  if (title.includes("录音") || title.includes("record")) {
    return SERVICE_PROBLEM_FALLBACKS["recording-editing"][lang];
  }

  return lang === "cn"
    ? ["现场声音问题", "系统覆盖", "混音交付"]
    : ["Live sound issues", "System coverage", "Mix delivery"];
}

export const HOME_WORKFLOW_STEPS = [
  {
    order: 1,
    title: { cn: "需求沟通", en: "Briefing" },
    description: {
      cn: "了解场地、演出类型、设备条件、预算与时间。",
      en: "Understand venue, show format, gear, budget and timeline.",
    },
  },
  {
    order: 2,
    title: { cn: "系统评估", en: "System Assessment" },
    description: {
      cn: "分析覆盖、声压、低频、延时、返听与信号链路。",
      en: "Analyze coverage, SPL, low end, delay, monitors and signal path.",
    },
  },
  {
    order: 3,
    title: { cn: "现场调试", en: "On-Site Tuning" },
    description: {
      cn: "完成增益、EQ、延时、相位、压限与系统校准。",
      en: "Gain staging, EQ, delay, phase, limiting and system calibration.",
    },
  },
  {
    order: 4,
    title: { cn: "交付复盘", en: "Delivery & Review" },
    description: {
      cn: "提供项目记录、问题总结与后续优化建议。",
      en: "Project notes, issue summary and follow-up recommendations.",
    },
  },
];

export const SOUND_ISSUES = [
  {
    order: 1,
    title: { cn: "人声听不清", en: "Vocals Not Clear" },
    description: {
      cn: "可能与频段遮蔽、话筒增益、系统覆盖和现场反射有关。",
      en: "Often linked to masking, mic gain, coverage gaps and room reflections.",
    },
  },
  {
    order: 2,
    title: { cn: "低频轰头", en: "Overwhelming Low End" },
    description: {
      cn: "可能与房间驻波、超低摆位、相位耦合和 EQ 策略有关。",
      en: "Room modes, sub placement, phase coupling and EQ strategy may contribute.",
    },
  },
  {
    order: 3,
    title: { cn: "返听不稳定", en: "Unstable Monitors" },
    description: {
      cn: "可能与舞台声压、返听覆盖、话筒指向和监听混音有关。",
      en: "Stage SPL, monitor coverage, mic direction and monitor mix are common factors.",
    },
  },
  {
    order: 4,
    title: { cn: "覆盖不均匀", en: "Uneven Coverage" },
    description: {
      cn: "可能与音箱角度、高度、延时补声和系统设计有关。",
      en: "Speaker aim, height, delay fills and system design often play a role.",
    },
  },
  {
    order: 5,
    title: { cn: "啸叫频繁", en: "Frequent Feedback" },
    description: {
      cn: "可能与话筒位置、增益结构、监听系统和房间反射有关。",
      en: "Mic placement, gain structure, monitoring and reflections are typical causes.",
    },
  },
  {
    order: 6,
    title: { cn: "系统延时不准", en: "Delay Misalignment" },
    description: {
      cn: "可能与主扩、补声、超低和监听之间的时间关系有关。",
      en: "Timing between mains, fills, subs and monitors may be out of sync.",
    },
  },
];

export function getCaseKeywordTags(caseItem, lang = "cn") {
  const keywords = caseItem?.seo?.keywords;
  if (keywords) {
    if (Array.isArray(keywords)) return keywords.slice(0, 4);
    if (keywords[lang]?.length) return keywords[lang].slice(0, 4);
    if (keywords.cn?.length) return keywords.cn.slice(0, 4);
  }
  if (Array.isArray(caseItem?.tags)) {
    return caseItem.tags.slice(0, 4);
  }
  return [];
}
