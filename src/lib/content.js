import mockData from "../data/site-content.mock.json";
import { fetchContent } from "./api";
import { normalizeContent } from "./contentDefaults";

export { getSiteDisplayName, normalizeContent } from "./contentDefaults";

/** @type {typeof mockData | null} */
let cache = null;
/** @type {"api" | "mock" | null} */
let contentSource = null;

function isValidSiteContent(data) {
  return (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Array.isArray(data.cases) &&
    data.siteSettings &&
    typeof data.siteSettings === "object" &&
    data.siteSettings.siteName &&
    typeof data.siteSettings.siteName === "object"
  );
}

export async function getContent() {
  if (cache) return cache;

  try {
    const data = await fetchContent();
    const normalized = normalizeContent(data);
    if (!isValidSiteContent(normalized)) {
      throw new Error("Invalid or unexpected content payload from API");
    }
    cache = normalized;
    contentSource = "api";
    return normalized;
  } catch (err) {
    console.warn("[content] API unavailable, using mock data:", err.message);
    cache = normalizeContent(mockData);
    contentSource = "mock";
    return cache;
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

/** Flat CMS → display label (card / detail / admin list). */
const CMS_CATEGORY_LABELS = {
  "tour-system-engineering": { cn: "系统工程", en: "System Engineering" },
  "livehouse-system-tuning": { cn: "现场调音", en: "Live Mixing" },
  "event-sound-reinforcement": { cn: "现场调音", en: "Live Mixing" },
  "mixing-post-production": { cn: "多轨混音", en: "Multitrack Mixing" },
  "recording-editing": { cn: "贴唱混音", en: "Vocal Mixing" },
  "acoustic-simulation": { cn: "声学模拟", en: "Acoustic Simulation" },
};

/**
 * Unified two-plate / four-branch taxonomy (home + /cases).
 * Acoustic simulation is only under「全部」, not inside either plate.
 */
export const CASE_PLATES = [
  {
    id: "live",
    label: { cn: "现场 / 系统", en: "Live / System" },
    homeTitle: { cn: "现场 / 系统类案例", en: "Live & System Works" },
    homeEyebrow: { cn: "LIVE / SYSTEM", en: "LIVE / SYSTEM" },
    homeSubtitle: {
      cn: "系统工程与现场调音代表项目。板块内切换小分支查看。",
      en: "System engineering and live mixing — switch branches inside this plate.",
    },
    defaultBranchId: "live-tuning",
    branches: [
      {
        id: "system-engineering",
        label: { cn: "系统工程", en: "System Engineering" },
        cmsCategories: ["tour-system-engineering"],
      },
      {
        id: "live-tuning",
        label: { cn: "现场调音", en: "Live Mixing" },
        cmsCategories: ["livehouse-system-tuning", "event-sound-reinforcement"],
      },
    ],
  },
  {
    id: "mixing",
    label: { cn: "后期 / 混音", en: "Post / Mixing" },
    homeTitle: { cn: "后期 / 混音类案例", en: "Post-Production Mixing" },
    homeEyebrow: { cn: "MIXING WORKS", en: "MIXING WORKS" },
    homeSubtitle: {
      cn: "多轨混音与贴唱混音代表作品。板块内切换小分支查看。",
      en: "Multitrack and vocal mixing — switch branches inside this plate.",
    },
    defaultBranchId: "multitrack-mixing",
    branches: [
      {
        id: "multitrack-mixing",
        label: { cn: "多轨混音", en: "Multitrack Mixing" },
        cmsCategories: ["mixing-post-production"],
      },
      {
        id: "vocal-mixing",
        label: { cn: "贴唱混音", en: "Vocal Mixing" },
        cmsCategories: ["recording-editing"],
      },
    ],
  },
];

/** @deprecated Prefer CASE_PLATES; kept for any legacy imports. */
export const CATEGORY_FILTERS = [
  { id: "all", cms: null, label: { cn: "全部", en: "All" } },
  {
    id: "system-engineering",
    cms: "tour-system-engineering",
    label: { cn: "系统工程", en: "System Engineering" },
  },
  {
    id: "live-tuning",
    cms: "livehouse-system-tuning",
    label: { cn: "现场调音", en: "Live Mixing" },
  },
  {
    id: "multitrack-mixing",
    cms: "mixing-post-production",
    label: { cn: "多轨混音", en: "Multitrack Mixing" },
  },
  {
    id: "vocal-mixing",
    cms: "recording-editing",
    label: { cn: "贴唱混音", en: "Vocal Mixing" },
  },
  {
    id: "acoustic-simulation",
    cms: "acoustic-simulation",
    label: { cn: "声学模拟", en: "Acoustic" },
  },
];

export function getCasePlate(plateId) {
  return CASE_PLATES.find((p) => p.id === plateId) ?? null;
}

export function getCaseBranch(branchId) {
  for (const plate of CASE_PLATES) {
    const branch = plate.branches.find((b) => b.id === branchId);
    if (branch) return { plate, branch };
  }
  return null;
}

export function getPlateCmsCategories(plateId) {
  const plate = getCasePlate(plateId);
  if (!plate) return [];
  return plate.branches.flatMap((b) => b.cmsCategories);
}

export function getBranchCmsCategories(branchId) {
  const found = getCaseBranch(branchId);
  return found?.branch.cmsCategories ?? [];
}

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

function caseSortKey(item) {
  return item.sortOrder ?? item.order ?? 0;
}

const MIN_HERO_DURATION = 3;
const MAX_HERO_DURATION = 15;
const DEFAULT_SLIDE_DURATION = 8;

function extractMediaUrl(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "object") {
    return value.src ?? value.url ?? value.desktop ?? null;
  }
  return null;
}

function clampHeroDuration(raw, fallback = DEFAULT_SLIDE_DURATION) {
  const v = Number(raw ?? fallback);
  if (Number.isNaN(v)) return DEFAULT_SLIDE_DURATION;
  return Math.min(MAX_HERO_DURATION, Math.max(MIN_HERO_DURATION, v));
}

function slideSortKey(item) {
  return item.sortOrder ?? item.order ?? 0;
}

function hasLocalizedText(field) {
  if (field == null) return false;
  if (typeof field === "string") return field.trim().length > 0;
  return Boolean(field.cn?.trim() || field.en?.trim());
}

/** Resolve playable video: videos[0] → videoUrl → heroVideo → coverVideo. */
export function getCaseVideoSource(caseItem) {
  if (!caseItem) return null;

  const firstVideo = caseItem.videos?.[0];
  const firstVideoUrl = firstVideo ? extractMediaUrl(firstVideo) : null;
  const legacyVideo =
    typeof caseItem.videoUrl === "string" && caseItem.videoUrl.trim()
      ? caseItem.videoUrl.trim()
      : caseItem.videoUrl || null;
  const heroVideoUrl = extractMediaUrl(caseItem.heroVideo);
  const coverVideoUrl = extractMediaUrl(caseItem.coverVideo);

  const startTime = caseItem.heroStartTime ?? 0;

  if (firstVideoUrl) {
    return {
      video: firstVideoUrl,
      mobileVideo: extractMediaUrl(firstVideo.mobileSrc) ?? firstVideoUrl,
      poster: extractMediaUrl(firstVideo.poster),
      startTime,
      duration: firstVideo.duration ?? null,
      source: "videos",
    };
  }

  if (legacyVideo) {
    return {
      video: legacyVideo,
      mobileVideo: legacyVideo,
      poster: extractMediaUrl(caseItem.heroPoster),
      startTime,
      duration: caseItem.heroDuration ?? null,
      source: "videoUrl",
    };
  }

  if (heroVideoUrl) {
    const heroObj = typeof caseItem.heroVideo === "object" ? caseItem.heroVideo : null;
    return {
      video: heroVideoUrl,
      mobileVideo:
        extractMediaUrl(heroObj?.mobileSrc) ??
        extractMediaUrl(firstVideo?.mobileSrc) ??
        heroVideoUrl,
      poster: extractMediaUrl(caseItem.heroPoster) ?? extractMediaUrl(firstVideo?.poster),
      startTime,
      duration: caseItem.heroDuration ?? firstVideo?.duration ?? null,
      source: "heroVideo",
    };
  }

  if (coverVideoUrl) {
    return {
      video: coverVideoUrl,
      mobileVideo: coverVideoUrl,
      poster: extractMediaUrl(caseItem.heroPoster),
      startTime,
      duration: caseItem.heroDuration ?? null,
      source: "coverVideo",
    };
  }

  return null;
}

function resolveCaseVideoPoster(caseItem, videoSource, hero) {
  const firstVideo = caseItem?.videos?.[0];
  return (
    videoSource?.poster ??
    extractMediaUrl(firstVideo?.poster) ??
    extractMediaUrl(caseItem?.poster) ??
    caseItem?.coverImage ??
    caseItem?.coverUrl ??
    getCaseCover(caseItem) ??
    hero?.fallbackPoster ??
    hero?.posterUrl ??
    null
  );
}

function resolveSlideDuration(caseItem, videoSource, hero) {
  const firstVideo = caseItem?.videos?.[0];
  return clampHeroDuration(
    firstVideo?.duration ?? caseItem?.heroDuration ?? videoSource?.duration ?? hero.slideDuration,
    hero.slideDuration ?? DEFAULT_SLIDE_DURATION
  );
}

function caseToHeroSlide(caseItem, hero, index) {
  const source = getCaseVideoSource(caseItem);
  if (!source?.video) return null;

  return {
    caseSlug: caseItem.slug ?? "",
    title: caseItem.title ?? { cn: "", en: "" },
    video: source.video,
    mobileVideo: source.mobileVideo || source.video,
    poster: resolveCaseVideoPoster(caseItem, source, hero) || "",
    startTime: source.startTime ?? 0,
    duration: resolveSlideDuration(caseItem, source, hero),
    sortOrder: caseItem.sortOrder ?? caseItem.order ?? index + 1,
    enabled: true,
    source: "case",
  };
}

function buildCaseVideoCarouselSlides(content, hero) {
  return (content.cases ?? [])
    .filter((c) => c.visible !== false && c.showInHero !== false)
    .map((c, index) => caseToHeroSlide(c, hero, index))
    .filter(Boolean)
    .sort((a, b) => slideSortKey(a) - slideSortKey(b));
}

function standardizeManualSlide(slide, hero, content) {
  if (slide?.enabled === false || !slide?.video) return null;
  if (slide.caseSlug && content?.cases) {
    const linked = content.cases.find((x) => x.slug === slide.caseSlug);
    if (linked && linked.showInHero === false) return null;
  }

  return {
    caseSlug: slide.caseSlug ?? "",
    title: slide.title ?? { cn: "", en: "" },
    video: slide.video,
    mobileVideo: slide.mobileVideo ?? "",
    poster: slide.poster ?? "",
    startTime: slide.startTime ?? 0,
    duration: clampHeroDuration(slide.duration ?? hero.slideDuration, hero.slideDuration ?? DEFAULT_SLIDE_DURATION),
    sortOrder: slide.sortOrder ?? slide.order ?? 0,
    enabled: true,
  };
}

function buildManualSlides(content, hero) {
  return (hero.slides ?? [])
    .map((slide) => standardizeManualSlide(slide, hero, content))
    .filter(Boolean)
    .sort((a, b) => slideSortKey(a) - slideSortKey(b));
}

export function getCases(
  content,
  { featured, categoryId, plateId, branchId, visible = true } = {}
) {
  let list = [...(content.cases ?? [])];
  if (visible) list = list.filter((c) => c.visible !== false);
  if (featured) list = list.filter((c) => c.featured || c.isFeatured);

  if (branchId) {
    const cmsSet = new Set(getBranchCmsCategories(branchId));
    if (cmsSet.size) list = list.filter((c) => cmsSet.has(c.category));
  } else if (plateId && plateId !== "all") {
    const cmsSet = new Set(getPlateCmsCategories(plateId));
    if (cmsSet.size) list = list.filter((c) => cmsSet.has(c.category));
  } else if (categoryId && categoryId !== "all") {
    const found = getCaseBranch(categoryId);
    if (found) {
      const cmsSet = new Set(found.branch.cmsCategories);
      list = list.filter((c) => cmsSet.has(c.category));
    } else {
      const filter = CATEGORY_FILTERS.find((f) => f.id === categoryId);
      if (filter?.cms) list = list.filter((c) => c.category === filter.cms);
    }
  }

  return list.sort((a, b) => {
    const diff = caseSortKey(a) - caseSortKey(b);
    if (diff !== 0) return diff;
    return 0;
  });
}

function isHomeFeatured(caseItem) {
  return Boolean(caseItem?.featured || caseItem?.isFeatured);
}

/** Homepage plate cases filtered by branch (featured only). */
export function getHomePlateCases(content, plateId, branchId) {
  const plate = getCasePlate(plateId);
  if (!plate) return [];
  const resolvedBranch =
    branchId && plate.branches.some((b) => b.id === branchId)
      ? branchId
      : plate.defaultBranchId;
  return getCases(content, {
    visible: true,
    branchId: resolvedBranch,
  }).filter(isHomeFeatured);
}

/**
 * Homepage Live block — all live/system featured (no branch filter).
 * @deprecated Prefer getHomePlateCases(content, "live", branchId)
 */
export function getHomeLiveCases(content) {
  return getCases(content, { visible: true, plateId: "live" }).filter(isHomeFeatured);
}

/**
 * Homepage Mixing block — all mixing featured (no branch filter).
 * @deprecated Prefer getHomePlateCases(content, "mixing", branchId)
 */
export function getHomeMixingCases(content) {
  return getCases(content, { visible: true, plateId: "mixing" }).filter(isHomeFeatured);
}

export function getCaseProjectNumber(content, caseItem) {
  const all = getCases(content, { visible: true });
  const idx = all.findIndex((c) => c.slug === caseItem.slug);
  return idx >= 0 ? String(idx + 1).padStart(3, "0") : "000";
}

export function getCaseToolsText(caseItem, lang = "cn") {
  if (caseItem.toolsUsed?.length) {
    return caseItem.toolsUsed.join(" · ");
  }
  return t(caseItem.equipment, lang);
}

export function getHeroSlides(content, hero) {
  const safe = hero ?? getSafeHero(content);

  if (safe.mode === "manualSlides") {
    return buildManualSlides(content, safe);
  }

  if (safe.mode === "caseVideoCarousel") {
    const autoSlides = buildCaseVideoCarouselSlides(content, safe);
    if (autoSlides.length) return autoSlides;
    return buildManualSlides(content, safe);
  }

  return [];
}

/** Admin preview: all cases with hero eligibility and media status. */
export function getHeroCasePreviewList(content, hero) {
  const safe = hero ?? getSafeHero(content);
  const cases = content?.cases ?? [];

  return cases
    .map((caseItem) => {
      const videoSource = getCaseVideoSource(caseItem);
      const hasVideo = Boolean(videoSource?.video);
      const hasPoster = Boolean(videoSource?.poster || getCaseCover(caseItem));
      const visible = caseItem.visible !== false;
      const showInHero = caseItem.showInHero !== false;

      return {
        slug: caseItem.slug ?? "",
        title: caseItem.title ?? { cn: "", en: "" },
        projectNumber: getCaseProjectNumber(content, caseItem),
        visible,
        showInHero,
        hasVideo,
        hasPoster,
        video: videoSource?.video ?? null,
        mobileVideo: videoSource?.mobileVideo ?? null,
        duration: hasVideo ? resolveSlideDuration(caseItem, videoSource, safe) : null,
        inCarousel: visible && showInHero && hasVideo && safe.mode === "caseVideoCarousel",
      };
    })
    .sort((a, b) => {
      const caseA = cases.find((c) => c.slug === a.slug);
      const caseB = cases.find((c) => c.slug === b.slug);
      return caseSortKey(caseA) - caseSortKey(caseB);
    });
}

/** Content completeness issues for admin dashboard. */
export function getContentCompleteness(content) {
  const issues = [];
  if (!content) return issues;

  for (const caseItem of content.cases ?? []) {
    if (caseItem.visible === false) continue;
    const slug = caseItem.slug ?? caseItem.id ?? "unknown";

    if (!caseItem.coverUrl && !caseItem.coverImage && !getCaseCover(caseItem)) {
      issues.push({
        section: "cases",
        slug,
        field: "cover",
        message: "案例缺少封面图",
      });
    }
    if (!hasLocalizedText(caseItem.summary)) {
      issues.push({ section: "cases", slug, field: "summary", message: "案例缺少摘要" });
    }
    if (!hasLocalizedText(caseItem.challenge)) {
      issues.push({ section: "cases", slug, field: "challenge", message: "案例缺少 challenge" });
    }
    if (!hasLocalizedText(caseItem.solution)) {
      issues.push({ section: "cases", slug, field: "solution", message: "案例缺少 solution" });
    }
    if (!hasLocalizedText(caseItem.result)) {
      issues.push({ section: "cases", slug, field: "result", message: "案例缺少 result" });
    }
    if (caseItem.showInHero !== false && !getCaseVideoSource(caseItem)?.video) {
      issues.push({
        section: "cases",
        slug,
        field: "heroVideo",
        message: "案例已开启 Hero 但缺少视频",
      });
    }
  }

  for (const cert of content.certificates ?? []) {
    if (cert.visible === false) continue;
    if (!cert.imageUrl && !cert.image) {
      issues.push({
        section: "certificates",
        id: cert.id,
        field: "image",
        message: "证书缺少图片",
      });
    }
  }

  const seo = content.seo ?? {};
  if (!seo.ogImage) {
    issues.push({ section: "seo", field: "ogImage", message: "SEO 缺少 ogImage" });
  }

  const social = content.socialLinks ?? {};
  if (!social.wechatQrImage && !content.siteSettings?.wechatQrUrl) {
    issues.push({
      section: "socialLinks",
      field: "wechatQrImage",
      message: "社媒缺少微信二维码",
    });
  }

  return issues;
}

export function getCaseBySlug(content, slug) {
  return content.cases?.find((c) => c.slug === slug) ?? null;
}

export function getCategoryLabel(categoryCms, lang) {
  const mapped = CMS_CATEGORY_LABELS[categoryCms];
  if (mapped) return t(mapped, lang);
  const f = CATEGORY_FILTERS.find((x) => x.cms === categoryCms);
  return f ? t(f.label, lang) : categoryCms;
}

export function getDouyinUrl(socialLinks) {
  return socialLinks?.douyinUrl || socialLinks?.douyinUrlDraft || "";
}

/** Formal Douyin homepage only — ignores draft / self links. */
export function getOfficialDouyinUrl(socialLinks) {
  const url = String(socialLinks?.douyinUrl || "").trim();
  if (!url || isDouyinSelfLink(url)) return "";
  return url;
}

export function isDouyinSelfLink(url) {
  return url?.includes("/user/self") ?? false;
}

/**
 * Manual featured video cards for homepage (no scraping).
 * Show when enabled and has jump URL and/or media (cover / preview video).
 */
export function getFeaturedVideos(content) {
  const list = Array.isArray(content?.featuredVideos) ? content.featuredVideos : [];
  return list
    .filter((item) => {
      if (!item || item.enabled === false) return false;
      const hasUrl = Boolean(String(item.url || "").trim());
      const hasImage = Boolean(String(item.coverImage || "").trim());
      const hasVideo = Boolean(String(item.previewVideo || "").trim());
      return hasUrl || hasImage || hasVideo;
    })
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getWechatQr(content) {
  return content.socialLinks?.wechatQrImage || content.siteSettings?.wechatQrUrl || "/images/wechat-qr.jpg";
}

export function getHeroVideo(content, isMobile) {
  const hero = getSafeHero(content);
  const primary = isMobile ? hero.mobileVideoUrl : hero.desktopVideoUrl;
  return primary || "/hero/source-clips/hero-source-echo-live.mp4";
}

const DEFAULT_HERO = {
  mode: "caseVideoCarousel",
  slideDuration: 8,
  slides: [],
  desktopVideoUrl: "",
  mobileVideoUrl: "",
  posterUrl: "",
  mobilePosterUrl: "",
  fallbackPoster: "",
  headline: { cn: "现场调音 / 系统工程 / 混音后期", en: "Live Sound / System Tuning / Mixing" },
  subheadline: { cn: "YU YAKANG AUDIO", en: "YU YAKANG AUDIO" },
  primaryButton: {
    cn: "观看代表视频",
    en: "Watch Video",
    mobileUrl: "#",
    desktopUrl: "#",
  },
  secondaryButton: {
    cn: "查看案例作品",
    en: "View Cases",
    url: "/cases",
  },
};

export function getSafeHero(content) {
  const hero = content?.hero ?? {};
  return {
    ...DEFAULT_HERO,
    ...hero,
    slides: Array.isArray(hero.slides) ? hero.slides : DEFAULT_HERO.slides,
    primaryButton: { ...DEFAULT_HERO.primaryButton, ...(hero.primaryButton ?? {}) },
    secondaryButton: { ...DEFAULT_HERO.secondaryButton, ...(hero.secondaryButton ?? {}) },
    headline: { ...DEFAULT_HERO.headline, ...(hero.headline ?? {}) },
    subheadline: { ...DEFAULT_HERO.subheadline, ...(hero.subheadline ?? {}) },
  };
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

export function getWorkPhotos(content) {
  const fromProfile = content.profile?.workPhotos;
  if (fromProfile?.length) {
    return [...fromProfile].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return [1, 2, 3, 4, 5, 6].map((n, i) => ({
    id: `wp-${n}`,
    order: i + 1,
    imageUrl: `/images/about/work-${String(n).padStart(2, "0")}.jpg`,
    title: { cn: "工作照", en: "On-site photo" },
    description: { cn: "项目现场工作记录", en: "On-site working record" },
  }));
}

const DEFAULT_LOCATION = { cn: "江西南昌", en: "Nanchang, Jiangxi" };

const DEFAULT_SERVICE_AREA = {
  cn: "常驻江西南昌，可承接 Livehouse、演出系统工程、会议年会、混音后期等项目。",
  en: "Based in Nanchang, available for livehouse, system tuning, corporate events and mixing projects.",
};

const DEFAULT_LOCATION_DISPLAY = {
  showOnHome: false,
  showOnContact: false,
  showOnFooter: false,
};

export function getSiteLocation(content) {
  return (
    content?.location ??
    content?.socialLinks?.location ??
    content?.profile?.location ??
    DEFAULT_LOCATION
  );
}

export function getServiceArea(content) {
  return content?.serviceArea ?? DEFAULT_SERVICE_AREA;
}

export function getLocationDisplay(content) {
  return { ...DEFAULT_LOCATION_DISPLAY, ...(content?.display ?? {}) };
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

  for (const plate of CASE_PLATES) {
    const plateCms = new Set(getPlateCmsCategories(plate.id));
    counts[`plate:${plate.id}`] = all.filter((c) => plateCms.has(c.category)).length;
    for (const branch of plate.branches) {
      const branchCms = new Set(branch.cmsCategories);
      counts[branch.id] = all.filter((c) => branchCms.has(c.category)).length;
    }
  }

  counts["acoustic-simulation"] = all.filter(
    (c) => c.category === "acoustic-simulation"
  ).length;

  return counts;
}
