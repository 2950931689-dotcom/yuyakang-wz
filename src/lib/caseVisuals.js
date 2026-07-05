import { getCaseCover, resolveImageUrl } from "./content.js";

function pickUrl(value, slug) {
  if (!value) return null;
  if (typeof value === "string") return resolveImageUrl(value, slug);
  if (typeof value === "object") {
    const src = value.src ?? value.url ?? "";
    return src ? resolveImageUrl(src, slug) : null;
  }
  return null;
}

/** Hero / ambient image for a single case (cover → gallery → poster → video poster). */
export function getCaseHeroImage(caseItem) {
  if (!caseItem) return null;
  const slug = caseItem.slug;

  const fromCover =
    pickUrl(caseItem.coverImage, slug) ??
    pickUrl(caseItem.coverUrl, slug);
  if (fromCover) return fromCover;

  const gallery0 = caseItem.galleryImages?.[0] ?? caseItem.images?.[0];
  const fromGallery = pickUrl(gallery0, slug);
  if (fromGallery) return fromGallery;

  const fromPoster = pickUrl(caseItem.poster, slug);
  if (fromPoster) return fromPoster;

  const videoPoster = caseItem.videos?.[0]?.poster;
  const fromVideoPoster = pickUrl(videoPoster, slug);
  if (fromVideoPoster) return fromVideoPoster;

  return getCaseCover(caseItem);
}

/** Collect unique case images for booking ambient carousel. */
export function collectCaseAmbientImages(content) {
  const seen = new Set();
  const urls = [];

  for (const caseItem of content?.cases ?? []) {
    if (caseItem.visible === false) continue;
    const img = getCaseHeroImage(caseItem);
    if (img && !seen.has(img)) {
      seen.add(img);
      urls.push(img);
    }
  }

  return urls;
}
