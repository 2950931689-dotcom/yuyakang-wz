import { getCaseImages } from "../../lib/content";
import { buildCaseGalleryItems } from "../../lib/media";
import { useLanguage } from "../../context/LanguageContext";
import { useMediaLightbox } from "../../context/MediaLightboxContext";
import EmptyState from "../ui/EmptyState";

export default function CaseGallery({ caseItem, rack = false }) {
  const { lang } = useLanguage();
  const { openLightbox } = useMediaLightbox();
  const images = getCaseImages(caseItem);
  const items = buildCaseGalleryItems(caseItem, lang);

  if (!images.length) {
    return <EmptyState message={lang === "cn" ? "暂无现场图片" : "No images available"} />;
  }

  return (
    <div className={`case-gallery${rack ? " case-gallery--rack" : ""}`}>
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          className="case-gallery__item"
          onClick={() => openLightbox(items, i)}
          aria-label={lang === "cn" ? `查看图片 ${i + 1}` : `View image ${i + 1}`}
        >
          <img src={src} alt={items[i]?.alt || ""} loading="lazy" />
        </button>
      ))}
    </div>
  );
}
