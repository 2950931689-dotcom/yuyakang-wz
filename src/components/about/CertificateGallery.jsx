import { getVisibleCertificates, t } from "../../lib/content";
import { buildCertificateItems } from "../../lib/media";
import { useLanguage } from "../../context/LanguageContext";
import { useMediaLightbox } from "../../context/MediaLightboxContext";

export default function CertificateGallery({ certificates }) {
  const { lang } = useLanguage();
  const { openLightbox } = useMediaLightbox();
  const items = buildCertificateItems(certificates, lang);

  return (
    <div className="case-gallery">
      {certificates.map((c, i) => (
        <button
          key={c.id}
          type="button"
          className="case-gallery__item"
          onClick={() => openLightbox(items, i)}
          aria-label={t(c.title, lang)}
        >
          <img src={c.imageUrl} alt={t(c.title, lang)} loading="lazy" />
          <span className="case-gallery__caption">{t(c.title, lang)}</span>
        </button>
      ))}
    </div>
  );
}
