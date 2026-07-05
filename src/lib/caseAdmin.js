import { randomUUID } from "./id.js";

export const CASE_CATEGORIES = [
  ["livehouse-system-tuning", "Livehouse 系统调试"],
  ["tour-system-engineering", "演出系统工程"],
  ["event-sound-reinforcement", "活动扩声"],
  ["mixing-post-production", "混音后期"],
  ["recording-editing", "录音编辑"],
  ["acoustic-simulation", "声学模拟"],
];

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
    heroDuration: null,
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
  if (c.videoUrl && !c.videos?.length) {
    c.videos = [{ type: "video", src: c.videoUrl, duration: c.heroDuration ?? 8 }];
  }
  return c;
}
