/** Contact page fallback copy — no CMS schema changes. */

export const ROUTING_PARAMS = {
  status: { cn: "可沟通", en: "AVAILABLE" },
  response: { cn: "微信优先", en: "WECHAT FIRST" },
  intake: { cn: "开放接入", en: "OPEN" },
};

export const ROUTING_INTRO = {
  cn: "把项目需求接入正确的沟通通道。",
  en: "Connect your live sound, system tuning or mixing project.",
};

export const ROUTING_DESC = {
  cn: "如果你有 Livehouse、演出扩声、系统调试、混音后期或录音项目，可以先通过微信发送场地信息、设备表、项目时间与现场视频，我会根据城市、规模和复杂度进行初步评估。",
  en: "For livehouse, events, system tuning, mixing or recording — send venue info, gear list, timeline and site video via WeChat. I'll assess by city, scale and complexity.",
};

export const PATCH_CHANNELS = [
  {
    id: "wechat",
    code: "01",
    label: "WECHAT",
    status: "SIGNAL READY",
    desc: {
      cn: "适合发送场地照片、设备清单、演出时间、现场视频和参考案例。",
      en: "Best for venue photos, gear lists, show dates, site video and references.",
    },
  },
  {
    id: "phone",
    code: "02",
    label: "PHONE",
    status: "CHANNEL OPEN",
    desc: {
      cn: "适合快速确认项目时间、预算范围、现场复杂度与沟通优先级。",
      en: "Best for quick confirmation of timeline, budget, complexity and priority.",
    },
  },
  {
    id: "email",
    code: "03",
    label: "EMAIL",
    status: "INPUT ACTIVE",
    desc: {
      cn: "适合发送正式资料、项目文档、音频文件、合同或报价信息。",
      en: "Best for formal docs, project files, audio, contracts or quotes.",
    },
  },
  {
    id: "booking",
    code: "04",
    label: "BOOKING",
    status: "SIGNAL READY",
    desc: {
      cn: "适合提交完整项目需求，进入项目评估流程。",
      en: "Best for full project intake and evaluation workflow.",
    },
  },
];

export const CONTACT_TIMELINE = [
  {
    id: "cue-1",
    timecode: "00:00",
    title: { cn: "选择沟通通道", en: "Choose a channel" },
    desc: {
      cn: "微信、电话、邮箱或预约表单。",
      en: "WeChat, phone, email or booking form.",
    },
  },
  {
    id: "cue-2",
    timecode: "00:12",
    title: { cn: "发送项目资料", en: "Send project materials" },
    desc: {
      cn: "场地、设备、时间、现场视频和当前问题。",
      en: "Venue, gear, timeline, site video and current issues.",
    },
  },
  {
    id: "cue-3",
    timecode: "00:28",
    title: { cn: "初步项目判断", en: "Initial assessment" },
    desc: {
      cn: "根据城市、规模、系统复杂度和交付需求进行评估。",
      en: "Review by city, scale, system complexity and delivery scope.",
    },
  },
  {
    id: "cue-4",
    timecode: "00:45",
    title: { cn: "确认合作方式", en: "Confirm engagement" },
    desc: {
      cn: "确认现场支持、系统调试、调音、混音或复盘服务。",
      en: "Confirm on-site support, tuning, mixing or review services.",
    },
  },
];

export const MATERIAL_CHECKLIST = [
  { cn: "场地名称 / 城市 / 场地类型", en: "Venue name / city / type" },
  { cn: "演出类型 / 预计人数 / 项目时间", en: "Event type / audience / timeline" },
  { cn: "设备清单 / 音箱品牌 / 数量", en: "Gear list / speaker brands / qty" },
  { cn: "调音台 / 处理器 / 功放信息", en: "Console / processor / amp info" },
  { cn: "现场照片 / 视频 / 参考声音", en: "Photos / video / reference audio" },
  { cn: "当前声音问题 / 预算范围 / 沟通时间", en: "Sound issues / budget / contact time" },
];

export const WECHAT_MESSAGE_TEMPLATE = {
  cn: [
    "01 项目城市 / 场地名称",
    "02 项目类型 / 演出时间",
    "03 现有设备 / 音箱品牌",
    "04 当前声音问题",
    "05 预算范围 / 沟通时间",
  ],
  en: [
    "01 City / venue name",
    "02 Project type / show date",
    "03 Current gear / speaker brands",
    "04 Current sound issues",
    "05 Budget / contact time",
  ],
};

export function getContactChannels(content) {
  const social = content?.socialLinks ?? {};
  const settings = content?.siteSettings ?? {};
  return {
    phone: (social.phone || settings.contactPhone || "").trim(),
    email: (social.email || settings.contactEmail || "").trim(),
    wechatId: (social.wechatId || social.wechat || "").trim(),
  };
}

export function isWechatQrConfigured(content) {
  const social = content?.socialLinks ?? {};
  const settings = content?.siteSettings ?? {};
  return !!(social.wechatQrImage?.trim() || settings.wechatQrUrl?.trim());
}

export function getRoutingLocation(content, lang, t) {
  const profile = content?.profile;
  const social = content?.socialLinks;
  const loc =
    profile?.location ||
    social?.location ||
    { cn: "中国 / 广东", en: "CHINA / GUANGDONG" };
  return (t(loc, lang) || loc.cn || loc.en || "").toUpperCase();
}
