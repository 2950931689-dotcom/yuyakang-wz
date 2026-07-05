import { randomUUID } from "./id.js";

export const CASE_CATEGORIES = [
  ["livehouse-system-tuning", "Livehouse 系统调试"],
  ["tour-system-engineering", "演出系统工程"],
  ["event-sound-reinforcement", "活动扩声"],
  ["mixing-post-production", "混音后期"],
  ["recording-editing", "录音编辑"],
  ["acoustic-simulation", "声学模拟"],
];

export function buildCaseVideoEntry(src, { poster = "", duration = 8, mobileSrc = "" } = {}) {
  if (!src) return null;
  return {
    type: "video",
    src,
    mobileSrc,
    poster,
    title: { cn: "", en: "" },
    description: { cn: "", en: "" },
    duration,
  };
}

export function createEmptyCase(sortOrder = 999) {
  return {
    id: randomUUID(),
    slug: `new-case-${Date.now()}`,
    title: { cn: "新案例", en: "New Case" },
    category: "livehouse-system-tuning",
    location: { cn: "", en: "" },
    role: { cn: "", en: "" },
    projectDate: "",
    date: "",
    summary: { cn: "", en: "" },
    background: { cn: "", en: "" },
    challenge: { cn: "", en: "" },
    solution: { cn: "", en: "" },
    result: { cn: "", en: "" },
    services: { cn: "", en: "" },
    equipment: { cn: "", en: "" },
    toolsUsed: [],
    tags: [],
    coverUrl: "",
    coverImage: "",
    images: [],
    galleryImages: [],
    videoUrl: null,
    videos: [],
    audio: [],
    audioUrl: null,
    featured: false,
    isFeatured: false,
    showInHero: true,
    visible: true,
    heroDuration: 8,
    sortOrder,
    order: sortOrder,
    clientFeedback: { cn: "", en: "" },
    seo: {
      title: { cn: "", en: "" },
      description: { cn: "", en: "" },
      ogImage: "",
    },
  };
}

function normalizeVideoEntry(video, caseItem) {
  const src = typeof video === "string" ? video : video?.src ?? video?.url ?? "";
  if (!src) return null;
  const duration = video?.duration ?? caseItem.heroDuration ?? 8;
  return {
    type: "video",
    src,
    mobileSrc: video?.mobileSrc ?? "",
    poster: video?.poster ?? "",
    title: video?.title ?? { cn: "", en: "" },
    description: video?.description ?? { cn: "", en: "" },
    duration,
  };
}

export function normalizeCaseForSave(caseItem) {
  const c = { ...caseItem };
  if (c.coverImage && !c.coverUrl) c.coverUrl = c.coverImage;
  if (c.coverUrl && !c.coverImage) c.coverImage = c.coverUrl;
  if (c.galleryImages?.length && !c.images?.length) {
    c.images = c.galleryImages.map((g) => (typeof g === "string" ? g : g.src)).filter(Boolean);
  }
  if (c.isFeatured != null) c.featured = c.isFeatured;
  if (c.featured != null) c.isFeatured = c.featured;
  if (c.sortOrder != null) c.order = c.sortOrder;

  if (c.videos?.length) {
    c.videos = c.videos.map((v) => normalizeVideoEntry(v, c)).filter(Boolean);
  } else if (c.videoUrl) {
    c.videos = [
      buildCaseVideoEntry(c.videoUrl, {
        poster: c.heroPoster ?? "",
        duration: c.heroDuration ?? 8,
      }),
    ];
  }

  if (c.videos?.length && !c.videoUrl) {
    c.videoUrl = c.videos[0].src;
  }

  if (c.heroDuration == null && c.videos?.[0]?.duration) {
    c.heroDuration = c.videos[0].duration;
  }

  return c;
}
