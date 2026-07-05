import { getCaseCover, getCaseImages, resolveImageUrl, t } from "./content";

/** @returns {import("../context/MediaLightboxContext").MediaItem[]} */
export function buildCaseGalleryItems(caseItem, lang = "cn") {
  const images = getCaseImages(caseItem);
  return images.map((src, i) => ({
    type: "image",
    src,
    title: caseItem.title,
    description: {
      cn: `现场图片 ${i + 1}`,
      en: `Gallery photo ${i + 1}`,
    },
    alt: `${t(caseItem.title, lang)} gallery ${i + 1}`,
  }));
}

export function buildCaseVideoItem(caseItem, lang = "cn") {
  if (!caseItem.videoUrl) return null;
  return {
    type: "video",
    src: caseItem.videoUrl,
    poster: getCaseCover(caseItem) || resolveImageUrl(caseItem.coverUrl, caseItem.slug),
    title: caseItem.title,
    description: caseItem.summary,
    alt: t(caseItem.title, lang),
  };
}

export function buildCertificateItems(certificates, lang = "cn") {
  return certificates.map((c) => ({
    type: "image",
    src: c.imageUrl,
    title: c.title,
    description: {
      cn: [t(c.issuer, "cn"), c.year].filter(Boolean).join(" · "),
      en: [t(c.issuer, "en"), c.year].filter(Boolean).join(" · "),
    },
    alt: t(c.title, lang),
  }));
}

export function buildWorkPhotoItems(workPhotos, lang = "cn") {
  return (workPhotos ?? []).map((p) => ({
    type: "image",
    src: p.imageUrl,
    title: p.title,
    description: p.description,
    alt: t(p.title, lang) || "Work photo",
  }));
}
