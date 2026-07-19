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

/* —— Round 7.5: About full profile (frontend copy; no API schema change) —— */

/** About page lead — longer than homepage HOME_PROFILE_INTRO. */
export const ABOUT_FULL_INTRO = {
  paragraphs: {
    cn: [
      "余雅康，dBsource 音响系统工程师，中国录音师协会会员，录音技术专业背景，持有初级录音师、华汇 DiGiCo 高级技术培训与 VOS 音响系统工程师认证。工作内容覆盖现场扩声、系统测量调试、FOH / Monitor / OB 调音、录音、音频编辑与后期混音。",
      "我理解声音从制作到现场扩声的完整流程：从前期编写、录音制式选择、麦克风摆位、前级与音频接口连接，到后期修唱、编辑、混音处理，再到现场系统搭建、处理器调试、监听分配与前场扩声控制。",
    ],
    en: [
      "Yu Yakang is a dBsource sound system engineer and a member of the China Recording Engineers Association, with a recording technology background. He holds Junior Recording Engineer, Huahui DiGiCo Advanced Technical Training, and VOS Sound System Engineer certifications. His work covers live reinforcement, system measurement and tuning, FOH / Monitor / OB mixing, recording, audio editing and post-production mixing.",
      "He works across the full path from production to live sound: arrangement and capture choices, microphone placement, preamps and interfaces, editing and mixing, through to system setup, processor tuning, monitor allocation and FOH control.",
    ],
  },
};

export const ABOUT_IDENTITY_TAGS = {
  cn: [
    "dBsource 音响系统工程师",
    "中国录音师协会会员",
    "录音技术专业背景",
    "现场调音 / 后期混音 / 音响系统工程",
  ],
  en: [
    "dBsource Sound System Engineer",
    "China Recording Engineers Association",
    "Recording Technology Background",
    "Live Sound / Mixing / System Engineering",
  ],
};

export const ABOUT_CREDENTIAL_TAGS = {
  cn: [
    "初级录音师证书",
    "华汇 DiGiCo 高级技术培训证书",
    "VOS 认证音响系统工程师",
    "中国录音师协会会员",
  ],
  en: [
    "Junior Recording Engineer",
    "Huahui DiGiCo Advanced Technical Training",
    "VOS Certified Sound System Engineer",
    "China Recording Engineers Association",
  ],
};

/**
 * Capability modules 03–07 for About page.
 * Each: short lead + tag chips (website copy, not a job CV dump).
 */
export const ABOUT_CAPABILITY_MODULES = [
  {
    id: "recording-mixing",
    sectionIndex: 3,
    eyebrow: "RECORDING / MIXING",
    title: { cn: "录音 / 混音能力", en: "Recording & Mixing" },
    lead: {
      cn: "具备乐理与和声基础，熟悉常见录音制式与人声、器乐拾音方式；可完成 DAW 内编辑、修唱与混音处理，并参与过交响乐、合唱录音及现场扩声相关工作。",
      en: "Grounded in music theory and harmony, with practical stereo techniques and vocal/instrument capture. Comfortable editing, tuning and mixing in major DAWs, with experience in orchestral, choir and live-related sessions.",
    },
    tags: {
      cn: [
        "AB / MS / ORTF / Decca Tree",
        "Cubase / Pro Tools / Studio One",
        "Melodyne",
        "Waves / FabFilter / Slate Digital",
        "Ozone / Valhalla / iZotope RX",
        "人声 / 器乐录音",
        "修唱 / 修节奏",
        "齿音 / 口水音 / 噪声处理",
        "音频前后级与接口连接",
      ],
      en: [
        "AB / MS / ORTF / Decca Tree",
        "Cubase / Pro Tools / Studio One",
        "Melodyne",
        "Waves / FabFilter / Slate Digital",
        "Ozone / Valhalla / iZotope RX",
        "Vocal / instrument recording",
        "Pitch & timing edit",
        "De-ess / mouth noise / denoise",
        "Preamps & audio interfaces",
      ],
    },
  },
  {
    id: "system-engineering",
    sectionIndex: 4,
    eyebrow: "SYSTEM ENGINEERING",
    title: { cn: "音响工程 / 系统调试能力", en: "System Engineering & Tuning" },
    lead: {
      cn: "使用专业测量与声学仿真工具校正频响、相位与延时，优化线阵列与超低阵列覆盖；调试处理器增益、EQ、延时与压限，并排查维护音频设备问题。",
      en: "Uses measurement and acoustic simulation tools to correct response, phase and delay, and to refine line-array and sub coverage. Tunes processors for gain, EQ, delay and limiting, and troubleshoots audio systems.",
    },
    tags: {
      cn: [
        "Smaart",
        "VOS4 / VOS Pro",
        "EASE Focus",
        "频响校正",
        "相位耦合",
        "延时对齐",
        "线阵列 / 超低阵列模拟",
        "处理器调试",
        "EQ / 延时 / 限幅 / 增益",
      ],
      en: [
        "Smaart",
        "VOS4 / VOS Pro",
        "EASE Focus",
        "Frequency response",
        "Phase coupling",
        "Delay alignment",
        "Line array / sub simulation",
        "Processor tuning",
        "EQ / delay / limiting / gain",
      ],
    },
  },
  {
    id: "live-sound",
    sectionIndex: 5,
    eyebrow: "LIVE SOUND",
    title: { cn: "现场调音能力", en: "Live Sound" },
    lead: {
      cn: "重视增益架构与数字台路由、母线规划；可搭建 FOH、Monitor、OB 等场景，并在现场合理安排麦克风与录音制式以支持分轨录音。",
      en: "Focuses on gain structure, digital console routing and bus planning. Builds FOH, Monitor and OB setups, and places microphones for clean multitrack capture when needed.",
    },
    tags: {
      cn: [
        "FOH",
        "Monitor",
        "OB",
        "数字调音台路由",
        "母线规划",
        "动态 / 滤波 / 空间效果器",
        "现场分轨录音",
        "PA / Monitor 场景搭建",
        "传声器增益与信噪比",
      ],
      en: [
        "FOH",
        "Monitor",
        "OB",
        "Digital console routing",
        "Bus planning",
        "Dynamics / EQ / time-based FX",
        "On-site multitrack",
        "PA / monitor system setup",
        "Mic gain & SNR",
      ],
    },
  },
  {
    id: "software-tools",
    sectionIndex: 6,
    eyebrow: "SOFTWARE & TOOLS",
    title: { cn: "常用软件与工具", en: "Software & Tools" },
    lead: {
      cn: "日常工作覆盖 DAW、混音插件、修音工具、声学测量与仿真软件，用于录音混音与现场系统调试。",
      en: "Day-to-day tools include DAWs, mix plugins, editing utilities, and acoustic measurement / simulation software for both studio and live system work.",
    },
    tags: {
      cn: [
        "DAW：Cubase / Pro Tools / Studio One",
        "插件：Waves / FabFilter / Slate / Ozone / Valhalla / RX",
        "修音：Melodyne",
        "测量：Smaart / VOS4 / VOS Pro",
        "仿真：EASE Focus",
      ],
      en: [
        "DAW: Cubase / Pro Tools / Studio One",
        "Plugins: Waves / FabFilter / Slate / Ozone / Valhalla / RX",
        "Editing: Melodyne",
        "Measurement: Smaart / VOS4 / VOS Pro",
        "Simulation: EASE Focus",
      ],
    },
  },
  {
    id: "consoles",
    sectionIndex: 7,
    eyebrow: "CONSOLE EXPERIENCE",
    title: { cn: "调音台与系统经验", en: "Console & System Experience" },
    lead: {
      cn: "熟悉多品牌数字调音台的现场配置与操作，覆盖巡演级与中小型场地常见型号。",
      en: "Hands-on experience across major digital console families used in touring and mid-size venues.",
    },
    tags: {
      cn: [
        "DiGiCo SD / Quantum",
        "Yamaha TF / CL / QL / PM / DM / MG",
        "Behringer X32 / WING",
        "Midas M32 / Pro / HD",
        "PreSonus StudioLive 24 / 32S",
        "Allen & Heath Qu / SQ / dLive / Avantis",
        "Soundcraft Vi / Si",
      ],
      en: [
        "DiGiCo SD / Quantum",
        "Yamaha TF / CL / QL / PM / DM / MG",
        "Behringer X32 / WING",
        "Midas M32 / Pro / HD",
        "PreSonus StudioLive 24 / 32S",
        "Allen & Heath Qu / SQ / dLive / Avantis",
        "Soundcraft Vi / Si",
      ],
    },
  },
];

/** Resolve About intro paragraphs: prefer profile.bioLong / bio when multi-paragraph, else fallback. */
export function getAboutIntroParagraphs(profile, lang = "cn") {
  const fallback = ABOUT_FULL_INTRO.paragraphs[lang] || ABOUT_FULL_INTRO.paragraphs.cn;
  const raw =
    (typeof profile?.bioLong === "object"
      ? profile.bioLong?.[lang] || profile.bioLong?.cn
      : profile?.bioLong) ||
    (typeof profile?.bio === "object" ? profile.bio?.[lang] || profile.bio?.cn : profile?.bio) ||
    "";
  const text = String(raw || "").trim();
  if (!text) return fallback;
  const parts = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts : fallback;
}
