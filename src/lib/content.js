import mockData from "../data/site-content.mock.json";
import { fetchContent } from "./api";

/** @type {typeof mockData | null} */
let cache = null;
/** @type {"api" | "mock" | null} */
let contentSource = null;

export async function getContent() {
  if (cache) return cache;

  try {
    const data = await fetchContent();
    cache = data;
    contentSource = "api";
    return data;
  } catch (err) {
    console.warn("[content] API unavailable, using mock data:", err.message);
    cache = mockData;
    contentSource = "mock";
    return mockData;
  }
}

export function getContentSource() {
  return contentSource;
}

export function clearContentCache() {
  cache = null;
  contentSource = null;
}

export function t(field, lang = "cn") {
  if (field == null) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.cn ?? field.en ?? "";
}

export const CATEGORY_FILTERS = [
  { id: "all", cms: null, label: { cn: "全部", en: "All" } },
  { id: "livehouse", cms: "livehouse-system-tuning", label: { cn: "Livehouse", en: "Livehouse" } },
  { id: "system", cms: "tour-system-engineering", label: { cn: "系统工程", en: "System" } },
  { id: "corporate-event", cms: "event-sound-reinforcement", label: { cn: "活动扩声", en: "Events" } },
  { id: "mixing", cms: "mixing-post-production", label: { cn: "混音后期", en: "Mixing" } },
  { id: "recording", cms: "recording-editing", label: { cn: "录音编辑", en: "Recording" } },
  { id: "acoustic-simulation", cms: "acoustic-simulation", label: { cn: "声学模拟", en: "Acoustic" } },
];

const COVER_MAP = {
  "echo-live-yunfu": "/cases/echo-live-yunfu/gallery/gallery-01.jpg",
  "wild-live-shenzhen": "/cases/wild-live-shenzhen/gallery/gallery-01.png",
  "maca-live-guangning": "/cases/maca-live-guangning/gallery/gallery-01.jpg",
  "shuimuhuaya-jingdezhen-2025": "/cases/shuimuhuaya-jingdezhen-2025/gallery/gallery-01.jpg",
  "acoustic-simulation-tavern": "/cases/acoustic-simulation-tavern/cover.png",
};

/** Resolve image paths: mock uses .webp, assets copied as .jpg/.png */
export function resolveImageUrl(url, slug) {
  if (slug && COVER_MAP[slug] && url?.includes("gallery-01")) return COVER_MAP[slug];
  if (!url) return null;
  if (url.includes("wild-live-shenzhen") && url.includes("gallery-01")) {
    return "/cases/wild-live-shenzhen/gallery/gallery-01.png";
  }
  if (url.includes("acoustic-simulation-tavern")) {
    return "/cases/acoustic-simulation-tavern/cover.png";
  }
  if (url.endsWith(".webp")) return url.replace(/\.webp$/i, ".jpg");
  return url;
}

export function getCaseCover(caseItem) {
  if (caseItem.coverUrl) return resolveImageUrl(caseItem.coverUrl, caseItem.slug);
  if (caseItem.images?.length) return resolveImageUrl(caseItem.images[0], caseItem.slug);
  if (COVER_MAP[caseItem.slug]) return COVER_MAP[caseItem.slug];
  return null;
}

export function getCaseImages(caseItem) {
  if (!caseItem.images?.length) {
    const cover = getCaseCover(caseItem);
    return cover ? [cover] : [];
  }
  return caseItem.images.map((img) => resolveImageUrl(img, caseItem.slug));
}

export function getCases(content, { featured, categoryId, visible = true } = {}) {
  let list = [...(content.cases ?? [])];
  if (visible) list = list.filter((c) => c.visible !== false);
  if (featured) list = list.filter((c) => c.featured);
  if (categoryId && categoryId !== "all") {
    const filter = CATEGORY_FILTERS.find((f) => f.id === categoryId);
    if (filter?.cms) list = list.filter((c) => c.category === filter.cms);
  }
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getCaseBySlug(content, slug) {
  return content.cases?.find((c) => c.slug === slug) ?? null;
}

export function getCategoryLabel(categoryCms, lang) {
  const f = CATEGORY_FILTERS.find((x) => x.cms === categoryCms);
  return f ? t(f.label, lang) : categoryCms;
}

export function getDouyinUrl(socialLinks) {
  return socialLinks?.douyinUrl || socialLinks?.douyinUrlDraft || "";
}

export function isDouyinSelfLink(url) {
  return url?.includes("/user/self") ?? false;
}

export function getWechatQr(content) {
  return content.socialLinks?.wechatQrImage || content.siteSettings?.wechatQrUrl || "/images/wechat-qr.jpg";
}

export function getHeroVideo(content, isMobile) {
  const hero = content.hero;
  const primary = isMobile ? hero.mobileVideoUrl : hero.desktopVideoUrl;
  return primary || "/hero/source-clips/hero-source-echo-live.mp4";
}

export function getVisibleServices(content) {
  return (content.services ?? [])
    .filter((s) => s.visible !== false)
    .sort((a, b) => a.order - b.order);
}

export function getVisibleCertificates(content) {
  return (content.certificates ?? [])
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      ...c,
      imageUrl: resolveImageUrl(c.imageUrl)?.replace(".webp", ".jpg") || c.imageUrl?.replace(".webp", ".jpg"),
    }));
}

export function getNavLabel(content, key, lang) {
  return t(content.i18n?.nav?.[key], lang);
}

const UI_TEXT = {
  loading: { cn: "加载中…", en: "Loading…" },
  emptyDefault: { cn: "暂无内容", en: "Nothing here yet" },
  emptyCases: {
    cn: "暂无对应案例，建议查看全部项目",
    en: "No matching cases. Try viewing all projects.",
  },
  errorDefault: { cn: "加载失败，请稍后重试", en: "Failed to load. Please try again." },
  noMedia: { cn: "暂无媒体", en: "No Media" },
  notConfigured: { cn: "暂未配置", en: "Not configured" },
  douyinDraftHint: {
    cn: "当前抖音链接可能不是公开主页链接，后续建议替换为公开分享链接。",
    en: "This Douyin link may not be a public profile URL. Consider replacing it with a shared profile link later.",
  },
};

export function getUiText(key, lang = "cn") {
  const field = UI_TEXT[key];
  if (!field) return key;
  return t(field, lang);
}

export function getCategoryCounts(content) {
  const all = getCases(content);
  const counts = { all: all.length };
  for (const f of CATEGORY_FILTERS) {
    if (f.id === "all") continue;
    counts[f.id] = all.filter((c) => c.category === f.cms).length;
  }
  return counts;
}
