/** Booking intake console fallback copy — no CMS / API schema changes. */

export const INTAKE_STEPS = [
  { id: "service", code: "01", label: "SERVICE", titleCn: "项目类型识别", titleEn: "Service Type" },
  { id: "system", code: "02", label: "SYSTEM", titleCn: "场地与系统信息", titleEn: "Venue & System" },
  { id: "check", code: "03", label: "CHECK", titleCn: "声音问题诊断", titleEn: "Sound Check" },
  { id: "delivery", code: "04", label: "DELIVERY", titleCn: "时间与交付需求", titleEn: "Time & Delivery" },
  { id: "contact", code: "05", label: "CONTACT", titleCn: "联系方式与确认", titleEn: "Contact & Send" },
];

export const SERVICE_TAGS = {
  "livehouse-sound": { cn: "FOH / Vocal / Band / Monitor", en: "FOH / Vocal / Band / Monitor" },
  "system-engineering": { cn: "Main PA / Sub / Delay / Coverage", en: "Main PA / Sub / Delay / Coverage" },
  "mixing-post": { cn: "Vocal / Dynamic / Space / Delivery", en: "Vocal / Dynamic / Space / Delivery" },
  "recording-editing": { cn: "Recording / Editing / Noise / Format", en: "Recording / Editing / Noise / Format" },
};

export const VENUE_TYPES = [
  { id: "livehouse", cn: "Livehouse", en: "Livehouse" },
  { id: "outdoor", cn: "户外演出", en: "Outdoor Event" },
  { id: "indoor", cn: "室内活动", en: "Indoor Event" },
  { id: "bar", cn: "酒吧 / 音乐空间", en: "Bar / Music Venue" },
  { id: "studio", cn: "录音棚 / 工作室", en: "Studio" },
  { id: "other", cn: "其他", en: "Other" },
];

export const PATCH_POINTS = [
  { key: "hasMainPa", label: { cn: "主扩", en: "Main PA" } },
  { key: "hasSub", label: { cn: "超低", en: "Sub" } },
  { key: "hasMonitor", label: { cn: "返听", en: "Monitor" } },
  { key: "hasConsole", label: { cn: "调音台", en: "Console" } },
  { key: "hasProcessor", label: { cn: "处理器", en: "Processor" } },
];

export const SOUND_ISSUES = [
  { id: "vocal-clarity", cn: "人声听不清", en: "Vocals unclear" },
  { id: "low-mud", cn: "低频浑浊 / 轰头", en: "Muddy / boomy low end" },
  { id: "coverage", cn: "覆盖不均匀", en: "Uneven coverage" },
  { id: "feedback", cn: "啸叫频繁", en: "Frequent feedback" },
  { id: "monitor", cn: "返听不稳定", en: "Unstable monitors" },
  { id: "delay-phase", cn: "延时 / 相位问题", en: "Delay / phase issues" },
  { id: "dynamics", cn: "动态失控", en: "Dynamics out of control" },
  { id: "routing", cn: "设备连接复杂", en: "Complex routing" },
  { id: "mix-blend", cn: "混音不够贴合", en: "Mix not cohesive" },
  { id: "review", cn: "需要系统复盘", en: "Needs system review" },
];

export const ISSUE_HINTS = {
  "low-mud": {
    cn: "建议提供：场地尺寸、超低摆位、音箱型号、现场视频。",
    en: "Suggested: room dimensions, sub placement, speaker models, site video.",
  },
  "vocal-clarity": {
    cn: "建议提供：人声通道设置、主扩覆盖、现场录音或视频。",
    en: "Suggested: vocal chain, PA coverage, reference audio or video.",
  },
  feedback: {
    cn: "建议提供：返听型号、摆位、增益结构、问题发生时段。",
    en: "Suggested: monitor models, placement, gain structure, when it occurs.",
  },
};

export const DELIVERY_OPTIONS = [
  { key: "needsAssessment", label: { cn: "前期设备评估", en: "Pre-assessment" } },
  { key: "needsTuning", label: { cn: "现场调试", en: "On-site tuning" } },
  { key: "needsLiveMix", label: { cn: "现场调音", en: "Live mixing" } },
  { key: "needsMixing", label: { cn: "混音后期", en: "Post mixing" } },
  { key: "needsReview", label: { cn: "项目复盘建议", en: "Project review" } },
];

export const URGENCY_OPTIONS = [
  { id: "normal", cn: "正常沟通", en: "Normal" },
  { id: "week", cn: "一周内", en: "Within 1 week" },
  { id: "three-days", cn: "三天内", en: "Within 3 days" },
  { id: "urgent", cn: "尽快", en: "ASAP" },
];

export const ASSIST_CONTENT = {
  0: {
    task: { cn: "识别项目类型，确认调音 / 系统 / 混音方向。", en: "Identify project type — live sound, system or mixing." },
    checklist: {
      cn: ["项目类型", "场地类型", "大致时间"],
      en: ["Project type", "Venue type", "Rough timeline"],
    },
  },
  1: {
    task: { cn: "确认场地与系统基础信息。", en: "Confirm venue and system basics." },
    checklist: {
      cn: ["设备清单", "场地照片", "音箱品牌 / 数量", "调音台型号"],
      en: ["Gear list", "Venue photos", "Speaker brand / qty", "Console model"],
    },
  },
  2: {
    task: { cn: "标记当前声音问题。", en: "Mark current sound issues." },
    checklist: {
      cn: ["现场视频", "问题出现时间", "具体位置", "之前调试记录"],
      en: ["Site video", "When issues occur", "Location", "Prior tuning notes"],
    },
  },
  3: {
    task: { cn: "确认项目时间与交付范围。", en: "Confirm timeline and delivery scope." },
    checklist: {
      cn: ["项目日期", "彩排时间", "演出流程", "预算范围"],
      en: ["Project date", "Rehearsal", "Show flow", "Budget range"],
    },
  },
  4: {
    task: { cn: "确认提交信息。", en: "Confirm submission details." },
    checklist: {
      cn: ["微信", "电话", "补充说明", "参考案例"],
      en: ["WeChat", "Phone", "Extra notes", "Reference cases"],
    },
  },
};

export function buildVenueSize(form, lang) {
  const parts = [];
  if (form.venueName?.trim()) parts.push(form.venueName.trim());
  if (form.venueType) {
    const vt = VENUE_TYPES.find((v) => v.id === form.venueType);
    if (vt) parts.push(lang === "cn" ? vt.cn : vt.en);
  }
  if (form.audienceSize?.trim()) {
    parts.push(lang === "cn" ? `约 ${form.audienceSize} 人` : `~${form.audienceSize} people`);
  }
  const patches = PATCH_POINTS.filter((p) => form[p.key])
    .map((p) => (lang === "cn" ? p.label.cn : p.label.en))
    .join(", ");
  if (patches) parts.push(lang === "cn" ? `系统: ${patches}` : `System: ${patches}`);
  if (form.gearBrands?.trim()) parts.push(form.gearBrands.trim());
  if (form.equipmentNotes?.trim()) parts.push(form.equipmentNotes.trim());
  return parts.join(" · ") || form.venueScale || "";
}

export function buildCompositeMessage(form, lang) {
  const lines = [];
  const issueLabels = SOUND_ISSUES.filter((i) => form.soundIssues?.includes(i.id)).map((i) =>
    lang === "cn" ? i.cn : i.en
  );
  if (issueLabels.length) {
    lines.push(lang === "cn" ? `【声音问题】${issueLabels.join("、")}` : `[Issues] ${issueLabels.join(", ")}`);
  }
  if (form.processNotes?.trim()) {
    lines.push(lang === "cn" ? `【问题补充】${form.processNotes.trim()}` : `[Issue notes] ${form.processNotes.trim()}`);
  }
  const delivery = DELIVERY_OPTIONS.filter((o) => form[o.key])
    .map((o) => (lang === "cn" ? o.label.cn : o.label.en));
  if (delivery.length) {
    lines.push(lang === "cn" ? `【交付需求】${delivery.join("、")}` : `[Delivery] ${delivery.join(", ")}`);
  }
  if (form.contactTime?.trim()) {
    lines.push(lang === "cn" ? `【期望沟通】${form.contactTime.trim()}` : `[Contact time] ${form.contactTime.trim()}`);
  }
  if (form.urgency && form.urgency !== "normal") {
    const u = URGENCY_OPTIONS.find((o) => o.id === form.urgency);
    if (u) lines.push(lang === "cn" ? `【紧急程度】${u.cn}` : `[Urgency] ${u.en}`);
  }
  if (form.preferWechat) {
    lines.push(lang === "cn" ? "【沟通偏好】优先微信" : "[Preference] WeChat preferred");
  }
  if (form.viewCasesFirst) {
    lines.push(lang === "cn" ? "【参考】希望先看代表案例" : "[Reference] Would like to view cases first");
  }
  if (form.description?.trim()) {
    lines.push(lang === "cn" ? `【项目说明】${form.description.trim()}` : `[Project notes] ${form.description.trim()}`);
  }
  return lines.join("\n") || form.description || form.processNotes || "";
}
