import { getCaseImages } from "../../lib/content";
import { useLanguage } from "../../context/LanguageContext";
import EmptyState from "../ui/EmptyState";

export default function CaseGallery({ caseItem }) {
  const { lang } = useLanguage();
  const images = getCaseImages(caseItem);

  if (!images.length) {
    return <EmptyState message={lang === "cn" ? "暂无现场图片" : "No images available"} />;
  }

  return (
    <div className="case-gallery">
      {images.map((src) => (
        <img key={src} src={src} alt="" loading="lazy" />
      ))}
    </div>
  );
}
