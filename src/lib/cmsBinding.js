/**
 * Frontend × Admin CMS binding helpers.
 * CMS fields first; centralized fallbacks when missing or empty.
 */

import {
  getVisibleCertificates,
  getVisibleServices,
  getCaseImages,
  t,
} from "./content";
import {
  CREDENTIAL_IDENTITIES,
  ENGINEERING_TAGS,
  HERO_LEAD,
  HOME_WORKFLOW_STEPS,
  SOUND_ISSUES as HOME_SOUND_ISSUES_FALLBACK,
} from "./homeContent";
import {
  SIGNAL_IDENTITY_NODES,
  CONTROL_SURFACE_CHANNELS,
  ENGINEER_IDENTITY_TAGLINE,
  ENGINEER_PARAMS,
} from "./aboutContent";
import {
  SOUND_ISSUES as BOOKING_SOUND_ISSUES_FALLBACK,
  ASSIST_CONTENT,
} from "./bookingContent";
import { MATERIAL_CHECKLIST as CONTACT_MATERIAL_FALLBACK } from "./contactContent";
import { SIGNAL_FLOW_NODES } from "./caseSignalFlow";
import { getContactChannels as readContactChannels } from "./contactContent";

const DEFAULT_IDENTITY = {
  nameCn: "余雅康",
  nameEn: "YU YAKANG",
  roleCn: "现场调音师 · 系统工程师 · 混音师",
  roleEn: "Live Sound Engineer · System Tuning · Mixing",
};

function isMeaningful(value) {
  if (value == null) return false;
  const s = String(value).trim();
  return s.length > 0 && !s.includes("[TODO]") && !s.includes("待补充");
}

function normalizeBilingual(item, lang) {
  if (item == null) return "";
  if (typeof item === "string") return item;
  return item[lang] ?? item.cn ?? item.en ?? "";
}

/** Profile name, role, status for Hero / About. */
export function getProfileIdentity(content, lang = "cn") {
  const profile = content?.profile ?? {};
  const nameCn =
    profile.nameCn ||
    normalizeBilingual(profile.name, "cn") ||
    DEFAULT_IDENTITY.nameCn;
  const nameEnRaw =
    profile.nameEn ||
    normalizeBilingual(profile.name, "en") ||
    DEFAULT_IDENTITY.nameEn;
  const nameEn = nameEnRaw.toUpperCase();
  const role =
    normalizeBilingual(profile.role, lang) ||
    normalizeBilingual(profile.title, lang) ||
    (lang === "cn" ? DEFAULT_IDENTITY.roleCn : DEFAULT_IDENTITY.roleEn);
  const title = normalizeBilingual(profile.title, lang);
  const subtitle = normalizeBilingual(profile.subtitle, lang);
  const tagline =
    normalizeBilingual(profile.tagline, lang) ||
    ENGINEER_IDENTITY_TAGLINE[lang];
  const location = profile.location
    ? normalizeBilingual(profile.location, lang)
    : lang === "cn"
      ? "中国 / 广东"
      : "CHINA / GUANGDONG";
  const status =
    normalizeBilingual(profile.status, lang) ||
    ENGINEER_PARAMS.status[lang] ||
    ENGINEER_PARAMS.status.en;

  return {
    nameCn,
    nameEn,
    role,
    title,
    subtitle,
    tagline,
    location,
    status,
    field: profile.field || ENGINEER_PARAMS.field,
    engineerId: profile.engineerId || ENGINEER_PARAMS.id,
  };
}

/** Hero lead + CTA labels from CMS hero / siteSettings. */
export function getHeroCopy(content, lang = "cn") {
  const hero = content?.hero ?? {};
  const settings = content?.siteSettings ?? {};
  const lead =
    normalizeBilingual(hero.subheadline, lang) ||
    normalizeBilingual(settings.tagline, lang) ||
    HERO_LEAD[lang];
  const secondary = hero.secondaryButton ?? {};
  const primary = hero.primaryButton ?? {};

  return {
    lead,
    secondaryLabel:
      normalizeBilingual(secondary, lang) ||
      (lang === "cn" ? "查看代表案例" : "Featured Projects"),
    secondaryUrl: secondary.url || "/cases",
    primaryLabel:
      normalizeBilingual(primary, lang) ||
      (lang === "cn" ? "观看代表视频" : "Watch Reel"),
    bookingLabel: lang === "cn" ? "预约项目评估" : "Book Assessment",
    bookingUrl: "/booking",
  };
}

/** Home credentials list + engineering tags. */
export function getHomeCredentials(content, lang = "cn") {
  const items = [];
  const seen = new Set();

  const push = (label) => {
    const trimmed = String(label || "").trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    items.push(trimmed);
  };

  for (const cert of getVisibleCertificates(content)) {
    push(t(cert.title, lang));
  }

  for (const cred of content?.profile?.credentials ?? []) {
    push(normalizeBilingual(cred, lang));
  }

  if (Array.isArray(content?.profile?.tags)) {
    for (const tag of content.profile.tags) {
      push(typeof tag === "string" ? tag : normalizeBilingual(tag, lang));
    }
  }

  const services = getVisibleServices(content);
  if (items.length < 4 && services.length) {
    for (const svc of services.slice(0, 2)) {
      push(t(svc.title, lang));
    }
  }

  const tags = Array.isArray(content?.profile?.engineeringTags)
    ? content.profile.engineeringTags.map((tag) =>
        typeof tag === "string" ? tag : normalizeBilingual(tag, lang)
      )
    : ENGINEERING_TAGS;

  if (items.length === 0) {
    return {
      items: [...CREDENTIAL_IDENTITIES[lang]],
      tags,
      fromCms: false,
    };
  }

  return { items, tags, fromCms: true };
}

/** Home workflow steps — siteSettings.processSteps first. */
export function getHomeWorkflow(content) {
  const steps = content?.siteSettings?.processSteps;
  if (Array.isArray(steps) && steps.length) {
    return [...steps]
      .filter((s) => s?.title && (s.title.cn || s.title.en || typeof s.title === "string"))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s, i) => ({
        order: s.order ?? i + 1,
        title: s.title,
        description: s.description ?? s.desc ?? { cn: "", en: "" },
      }));
  }
  return HOME_WORKFLOW_STEPS;
}

/** Home sound-check cards. */
export function getHomeSoundIssues(content) {
  const issues = content?.siteSettings?.soundIssues;
  if (Array.isArray(issues) && issues.length) {
    return issues.map((issue, i) => ({
      order: issue.order ?? i + 1,
      title:
        issue.title ??
        (issue.cn || issue.en
          ? { cn: issue.cn ?? issue.en, en: issue.en ?? issue.cn }
          : { cn: "", en: "" }),
      description:
        issue.description ??
        issue.desc ??
        { cn: issue.descriptionCn ?? "", en: issue.descriptionEn ?? "" },
    }));
  }
  return HOME_SOUND_ISSUES_FALLBACK;
}

/** Booking intake sound issue options. */
export function getBookingSoundIssues(content) {
  const issues =
    content?.siteSettings?.bookingIssues ??
    content?.siteSettings?.booking?.issueOptions;
  if (Array.isArray(issues) && issues.length) {
    return issues.map((issue) => ({
      id: issue.id || `issue-${issue.cn || issue.en}`,
      cn: issue.cn ?? normalizeBilingual(issue.label, "cn") ?? issue.id,
      en: issue.en ?? normalizeBilingual(issue.label, "en") ?? issue.id,
      recommended: issue.recommended === true,
    }));
  }
  return BOOKING_SOUND_ISSUES_FALLBACK;
}

/** Engineer assist panel copy per step. */
export function getBookingGuide(content, stepIndex = 0, lang = "cn") {
  const guide = content?.siteSettings?.bookingGuide;
  const step = guide?.steps?.[stepIndex] ?? guide?.[String(stepIndex)];
  const fallback = ASSIST_CONTENT[stepIndex] ?? ASSIST_CONTENT[0];

  if (step) {
    return {
      task: {
        cn: step.task?.cn ?? step.taskCn ?? fallback.task.cn,
        en: step.task?.en ?? step.taskEn ?? fallback.task.en,
      },
      checklist: {
        cn: step.checklist?.cn ?? step.checklistCn ?? fallback.checklist.cn,
        en: step.checklist?.en ?? step.checklistEn ?? fallback.checklist.en,
      },
    };
  }

  return fallback;
}

export function getContactChannels(content) {
  return readContactChannels(content);
}

/** Contact material checklist items. */
export function getContactChecklist(content, lang = "cn") {
  const list =
    content?.siteSettings?.contactChecklist ??
    content?.siteSettings?.modules?.contactChecklist;
  if (Array.isArray(list) && list.length) {
    return list.map((item) =>
      typeof item === "string"
        ? { cn: item, en: item }
        : { cn: item.cn ?? item.en ?? "", en: item.en ?? item.cn ?? "" }
    );
  }
  return CONTACT_MATERIAL_FALLBACK;
}

/** About signal identity nodes. */
export function getSignalIdentityNodes(content, lang = "cn") {
  const nodes =
    content?.profile?.signalNodes ??
    content?.profile?.capabilities ??
    content?.profile?.skills;
  if (Array.isArray(nodes) && nodes.length) {
    return nodes.map((node, i) => ({
      id: node.id || `node-${i}`,
      label: node.label || node.code || `NODE ${i + 1}`,
      labelCn: node.labelCn ?? normalizeBilingual(node.title, "cn") ?? node.label,
      desc: node.desc ?? node.description ?? {
        cn: normalizeBilingual(node.summary, "cn"),
        en: normalizeBilingual(node.summary, "en"),
      },
    }));
  }

  const services = getVisibleServices(content);
  if (services.length >= 3) {
    return services.slice(0, 5).map((svc, i) => ({
      id: svc.slug || svc.id || `svc-${i}`,
      label: (svc.slug || "SERVICE").replace(/-/g, " ").toUpperCase().slice(0, 16),
      labelCn: t(svc.title, "cn"),
      desc: {
        cn: t(svc.summary, "cn") || t(svc.description, "cn"),
        en: t(svc.summary, "en") || t(svc.description, "en"),
      },
    }));
  }

  return SIGNAL_IDENTITY_NODES;
}

/** About control surface channels. */
export function getControlSurfaceChannels(content, lang = "cn") {
  const channels =
    content?.profile?.controlChannels ?? content?.profile?.controlSurface;
  if (Array.isArray(channels) && channels.length) {
    return channels.map((ch, i) => ({
      id: ch.id || `ch-${i}`,
      label: ch.label || ch.code || `CH ${i + 1}`,
      level: typeof ch.level === "number" ? ch.level : 80,
      desc: ch.desc ?? ch.description ?? {
        cn: normalizeBilingual(ch.summary, "cn"),
        en: normalizeBilingual(ch.summary, "en"),
      },
    }));
  }

  const services = getVisibleServices(content);
  if (services.length >= 3) {
    return services.slice(0, 6).map((svc, i) => ({
      id: svc.slug || svc.id || `svc-${i}`,
      label: (svc.slug || "SVC").split("-")[0].toUpperCase().slice(0, 12),
      level: 70 + (i % 4) * 6,
      desc: {
        cn: t(svc.summary, "cn") || t(svc.title, "cn"),
        en: t(svc.summary, "en") || t(svc.title, "en"),
      },
    }));
  }

  return CONTROL_SURFACE_CHANNELS;
}

/** Case signal flow nodes — case.signalFlow or generic fallback. */
export function getCaseSignalFlow(caseItem) {
  const flow = caseItem?.signalFlow;
  if (Array.isArray(flow) && flow.length) {
    return flow.map((node, i) => ({
      id: node.id || `flow-${i}`,
      label: node.label || node.code || `NODE ${i + 1}`,
      labelCn: node.labelCn ?? node.label ?? "",
      desc: node.desc ?? node.description ?? { cn: "", en: "" },
    }));
  }
  if (flow?.nodes?.length) {
    return getCaseSignalFlow({ signalFlow: flow.nodes });
  }
  return SIGNAL_FLOW_NODES;
}

/** Consolidated media items for case media rack. */
export function getMediaRackItems(caseItem, lang = "cn") {
  const items = [];
  const images = getCaseImages(caseItem);
  images.forEach((src, i) => {
    items.push({ type: "image", src, label: lang === "cn" ? `图片 ${i + 1}` : `Image ${i + 1}` });
  });

  const videos = [];
  if (caseItem?.videoUrl) videos.push(caseItem.videoUrl);
  if (Array.isArray(caseItem?.videos)) {
    for (const v of caseItem.videos) {
      const url = typeof v === "string" ? v : v?.url || v?.src;
      if (url) videos.push(url);
    }
  }
  if (caseItem?.externalVideoUrl) videos.push(caseItem.externalVideoUrl);
  videos.forEach((src, i) => {
    items.push({ type: "video", src, label: lang === "cn" ? `视频 ${i + 1}` : `Video ${i + 1}` });
  });

  if (caseItem?.audioUrl) {
    items.push({
      type: "audio",
      src: caseItem.audioUrl,
      label: lang === "cn" ? "音频样本" : "Audio sample",
    });
  }

  if (Array.isArray(caseItem?.gallery)) {
    caseItem.gallery.forEach((entry, i) => {
      const src = typeof entry === "string" ? entry : entry?.url || entry?.src;
      if (src) {
        items.push({
          type: entry?.type || "image",
          src,
          label: normalizeBilingual(entry?.title, lang) || (lang === "cn" ? `媒体 ${i + 1}` : `Media ${i + 1}`),
        });
      }
    });
  }

  return items;
}

/** Whether CMS experience entries are usable. */
export function hasCmsExperience(profile, lang, tFn = t) {
  return (profile?.experience ?? []).some((item) =>
    isMeaningful(tFn(item.value, lang))
  );
}

/** Contact page common tool links from siteSettings.commonTools. */
export function getCommonTools(content) {
  const raw = content?.siteSettings?.commonTools;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && item.enabled !== false)
    .filter((item) => isMeaningful(item.title) && isMeaningful(item.url))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}
