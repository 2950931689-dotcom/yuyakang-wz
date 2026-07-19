/** Homepage-only copy and fallbacks — does not alter CMS JSON schema. */

export const HERO_LEAD = {
  cn: "面向 Livehouse、演出现场、系统调试与混音后期的声音解决方案。",
  en: "Live sound, system tuning and mixing solutions for livehouse, events and audio projects.",
};

export const CREDENTIALS_SUBTITLE = {
  cn: "以录音技术、系统工程和现场调音经验为基础，服务 Livehouse、演出现场与声音项目交付。",
  en: "Built on recording engineering, system design and live sound experience for venues and audio projects.",
};

/** Homepage 01 — short engineer profile (full bio stays on About). */
export const HOME_PROFILE_SUBTITLE = {
  cn: "现场调音 · 系统工程 · 录音与后期混音",
  en: "Live sound · System engineering · Recording & mixing",
};

export const HOME_PROFILE_INTRO = {
  cn: "余雅康，dBsource 音响系统工程师，中国录音师协会会员，录音技术专业背景，持有初级录音师、华汇 DiGiCo 高级技术培训与 VOS 音响系统工程师认证。工作覆盖现场扩声、FOH / Monitor / OB 调音、系统测量调试、录音与后期混音，能够从音乐制作、录音到现场扩声系统搭建中理解声音的完整流程。",
  en: "Yu Yakang is a dBsource sound system engineer and a member of the China Recording Engineers Association, with a recording technology background. He holds Junior Recording Engineer, Huahui DiGiCo Advanced Technical Training, and VOS Sound System Engineer certifications. His work covers live reinforcement, FOH / Monitor / OB mixing, system measurement and tuning, recording and post-production mixing — following the full path from music production and tracking through to live sound system delivery.",
};

export const HOME_PROFILE_ROLES = {
  cn: ["dBsource 音响系统工程师", "现场调音师", "后期混音师", "音响系统工程师"],
  en: [
    "dBsource Sound System Engineer",
    "Live Sound Engineer",
    "Mixing Engineer",
    "System Engineer",
  ],
};

export const HOME_PROFILE_QUALIFICATIONS = {
  cn: [
    "中国录音师协会会员",
    "录音技术专业",
    "初级录音师证书",
    "华汇 DiGiCo 高级技术培训",
    "VOS 认证音响系统工程师",
  ],
  en: [
    "China Recording Engineers Association",
    "Recording Technology Background",
    "Junior Recording Engineer",
    "Huahui DiGiCo Advanced Training",
    "VOS Certified Sound System Engineer",
  ],
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
    title: { cn: "沟通需求", en: "Discuss Needs" },
    description: {
      cn: "了解项目类型、时间安排、场地或混音目标，确认合作范围。",
      en: "Clarify project type, schedule, venue or mix goals, and scope of work.",
    },
  },
  {
    order: 2,
    title: { cn: "判断现场 / 素材情况", en: "Assess Site / Materials" },
    description: {
      cn: "评估现场条件、设备清单，或混音素材与参考方向。",
      en: "Review venue conditions and gear, or mix stems and references.",
    },
  },
  {
    order: 3,
    title: { cn: "制定声音方案", en: "Define Sound Plan" },
    description: {
      cn: "明确系统调试、现场调音或后期混音的执行重点与交付标准。",
      en: "Define priorities for system tuning, live mixing or post-production, and deliverables.",
    },
  },
  {
    order: 4,
    title: { cn: "执行调试 / 混音制作", en: "Tune / Mix" },
    description: {
      cn: "现场系统调试、演出混音，或录音后期编辑与混音制作。",
      en: "On-site system tuning and live mixing, or editing and mix production.",
    },
  },
  {
    order: 5,
    title: { cn: "交付与复盘", en: "Deliver & Review" },
    description: {
      cn: "交付成果，整理问题记录，并给出后续优化建议。",
      en: "Deliver results, document issues, and share follow-up suggestions.",
    },
  },
];

export const SOUND_ISSUES = [
  {
    order: 1,
    title: { cn: "人声不清", en: "Unclear Vocals" },
    description: {
      cn: "可能与频段遮蔽、话筒增益、主扩覆盖或房间反射有关。",
      en: "Often linked to masking, mic gain, PA coverage or room reflections.",
    },
  },
  {
    order: 2,
    title: { cn: "现场啸叫", en: "Feedback" },
    description: {
      cn: "可能与话筒位置、监听摆位、增益结构或房间反射有关。",
      en: "Mic placement, monitor aim, gain structure or reflections may contribute.",
    },
  },
  {
    order: 3,
    title: { cn: "低频发轰", en: "Boomy Low End" },
    description: {
      cn: "可能与房间驻波、超低摆位、相位耦合或 EQ 策略有关。",
      en: "Room modes, sub placement, phase coupling or EQ strategy are common factors.",
    },
  },
  {
    order: 4,
    title: { cn: "声音刺耳", en: "Harsh Sound" },
    description: {
      cn: "可能与高频过量、失真、压缩过猛或音箱指向有关。",
      en: "Excess highs, distortion, over-compression or speaker aim may be involved.",
    },
  },
  {
    order: 5,
    title: { cn: "覆盖不均匀", en: "Uneven Coverage" },
    description: {
      cn: "可能与音箱角度、高度、延时补声或系统设计有关。",
      en: "Speaker aim, height, delay fills or system design often play a role.",
    },
  },
  {
    order: 6,
    title: { cn: "舞台监听混乱", en: "Monitor Chaos" },
    description: {
      cn: "可能与返听混音、舞台声压、话筒串扰或监听路由有关。",
      en: "Monitor mix, stage SPL, mic bleed or monitor routing may be unclear.",
    },
  },
  {
    order: 7,
    title: { cn: "设备连接复杂", en: "Complex Routing" },
    description: {
      cn: "可能与信号链路规划、接口标准、多设备并联或标记不清有关。",
      en: "Signal-path planning, connectors, multi-device patching or unclear labeling.",
    },
  },
  {
    order: 8,
    title: { cn: "增益结构不稳定", en: "Unstable Gain Structure" },
    description: {
      cn: "可能与前级电平、台面推子、处理器压限或系统校准有关。",
      en: "Preamps, console faders, processor limiting or system calibration may drift.",
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
