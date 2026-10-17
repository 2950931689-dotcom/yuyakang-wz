/**
 * Seed / fallback for CMS `homeSections`.
 * Display prefers live CMS; this file is only the safety net.
 */

export const DEFAULT_HOME_SECTIONS = {
  profile: {
    eyebrow: { cn: "ENGINEER PROFILE", en: "ENGINEER PROFILE" },
    title: { cn: "个人介绍", en: "Engineer Profile" },
    subtitle: {
      cn: "现场调音 · 系统工程 · 录音与后期混音",
      en: "Live sound · System engineering · Recording & mixing",
    },
    intro: {
      cn: "余雅康，dBsource 音响系统工程师，中国录音师协会会员，录音技术专业背景，持有初级录音师、华汇 DiGiCo 高级技术培训与 VOS 音响系统工程师认证。工作覆盖现场扩声、FOH / Monitor / OB 调音、系统测量调试、录音与后期混音，能够从音乐制作、录音到现场扩声系统搭建中理解声音的完整流程。",
      en: "Yu Yakang is a dBsource sound system engineer and a member of the China Recording Engineers Association, with a recording technology background. He holds Junior Recording Engineer, Huahui DiGiCo Advanced Technical Training, and VOS Sound System Engineer certifications. His work covers live reinforcement, FOH / Monitor / OB mixing, system measurement and tuning, recording and post-production mixing — following the full path from music production and tracking through to live sound system delivery.",
    },
    roles: {
      cn: ["dBsource 音响系统工程师", "现场调音师", "后期混音师", "音响系统工程师"],
      en: [
        "dBsource Sound System Engineer",
        "Live Sound Engineer",
        "Mixing Engineer",
        "System Engineer",
      ],
    },
    qualifications: {
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
    },
  },
  liveCases: {
    eyebrow: { cn: "LIVE / SYSTEM", en: "LIVE / SYSTEM" },
    title: { cn: "现场 / 系统类案例", en: "Live & System Works" },
    subtitle: {
      cn: "系统工程与现场调音代表项目。板块内切换小分支查看。",
      en: "System engineering and live mixing — switch branches inside this plate.",
    },
    label: { cn: "现场 / 系统", en: "Live / System" },
    viewAllLabel: { cn: "查看该板块全部案例", en: "View All in This Plate" },
    defaultBranchId: "live-tuning",
    branches: [
      {
        id: "system-engineering",
        label: { cn: "系统工程", en: "System Engineering" },
      },
      {
        id: "live-tuning",
        label: { cn: "现场调音", en: "Live Mixing" },
      },
    ],
  },
  mixingCases: {
    eyebrow: { cn: "MIXING WORKS", en: "MIXING WORKS" },
    title: { cn: "后期 / 混音类案例", en: "Post-Production Mixing" },
    subtitle: {
      cn: "多轨混音与贴唱混音代表作品。板块内切换小分支查看。",
      en: "Multitrack and vocal mixing — switch branches inside this plate.",
    },
    label: { cn: "后期 / 混音", en: "Post / Mixing" },
    viewAllLabel: { cn: "查看该板块全部案例", en: "View All in This Plate" },
    defaultBranchId: "multitrack-mixing",
    branches: [
      {
        id: "multitrack-mixing",
        label: { cn: "多轨混音", en: "Multitrack Mixing" },
      },
      {
        id: "vocal-mixing",
        label: { cn: "贴唱混音", en: "Vocal Mixing" },
      },
    ],
  },
  videoHighlights: {
    eyebrow: { cn: "SOCIAL VIDEO", en: "SOCIAL VIDEO" },
    title: { cn: "抖音 / 视频号", en: "Douyin / WeChat Channel" },
    subtitle: {
      cn: "通过短视频平台查看更多现场调音、系统搭建、声音调试与项目记录。",
      en: "Short-form platforms for live sound, system setup and project notes.",
    },
    wechat: {
      platform: { cn: "视频号", en: "WeChat Channel" },
      title: { cn: "视频号主页", en: "WeChat Channel Home" },
      description: {
        cn: "查看现场调音、系统调试、项目记录与声音相关内容。",
        en: "Live sound, system tuning and project notes on WeChat Channels.",
      },
      cta: { cn: "打开视频号主页", en: "Open WeChat Channel" },
    },
    douyin: {
      platform: { cn: "抖音", en: "Douyin" },
      title: { cn: "抖音主页", en: "Douyin Profile" },
      description: {
        cn: "查看现场调音、系统调试、项目记录与声音相关内容。",
        en: "Live sound, system tuning and project notes on Douyin.",
      },
      cta: { cn: "打开抖音主页", en: "Open Douyin Profile" },
    },
    watchLabel: { cn: "观看", en: "Watch" },
  },
  workflow: {
    eyebrow: { cn: "WORKFLOW", en: "WORKFLOW" },
    title: { cn: "合作流程", en: "Workflow" },
    subtitle: {
      cn: "从沟通需求到现场调试 / 混音制作，再到交付复盘的协作路径。",
      en: "From inquiry through on-site tuning / mixing to delivery and review.",
    },
  },
  soundCheck: {
    eyebrow: { cn: "SOUND CHECK", en: "SOUND CHECK" },
    title: { cn: "现场声音问题诊断", en: "Sound Issue Diagnostics" },
    subtitle: {
      cn: "常见现场问题速览，便于沟通前快速对照可能成因。",
      en: "Common live-sound issues to help frame the conversation before booking.",
    },
  },
  services: {
    eyebrow: { cn: "SERVICES", en: "SERVICES" },
    title: { cn: "声音解决方案", en: "Sound Solutions" },
    subtitle: {
      cn: "按项目类型定位问题，提供可落地的现场与后期支持。",
      en: "Problem-focused support for live sound, systems and post-production.",
    },
  },
  bookingCta: {
    eyebrow: { cn: "BOOKING", en: "BOOKING" },
    title: { cn: "预约合作", en: "Book a Project" },
    description: {
      cn: "如果你有 Livehouse、演出、活动扩声或混音项目，可以先发我场地信息、现有设备表和项目时间，我会根据城市、规模与复杂度进行评估。",
      en: "For livehouse, event, PA or mixing projects, share venue details, gear list and timeline — I'll assess scope by city, scale and complexity.",
    },
    hint: {
      cn: "适合 Livehouse 驻场、演出系统工程、现场扩声、混音后期与录音项目。",
      en: "Livehouse residency, tour systems, live sound, mixing and recording projects.",
    },
    primaryCta: { cn: "提交项目需求", en: "Submit Inquiry" },
    secondaryCta: { cn: "添加微信沟通", en: "WeChat" },
  },
};

export function deepMergeHomeSections(base, override) {
  const src = base && typeof base === "object" ? base : {};
  const over = override && typeof override === "object" ? override : {};
  const keys = new Set([...Object.keys(src), ...Object.keys(over)]);
  const out = {};
  for (const key of keys) {
    const a = src[key];
    const b = over[key];
    if (
      a &&
      b &&
      typeof a === "object" &&
      typeof b === "object" &&
      !Array.isArray(a) &&
      !Array.isArray(b)
    ) {
      out[key] = deepMergeHomeSections(a, b);
    } else if (b !== undefined) {
      out[key] = b;
    } else {
      out[key] = a;
    }
  }
  return out;
}
