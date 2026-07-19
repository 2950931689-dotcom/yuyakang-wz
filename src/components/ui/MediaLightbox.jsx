import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useMediaLightbox } from "../../context/MediaLightboxContext";
import { t } from "../../lib/content";

export default function MediaLightbox() {
  const { open, items, index, closeLightbox, goPrev, goNext } = useMediaLightbox();
  const { lang } = useLanguage();
  const videoRef = useRef(null);
  const item = items[index];

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeLightbox, goPrev, goNext]);

  useEffect(() => {
    if (item?.type === "video" && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [item, index]);

  if (!open || !item) return null;

  const title = t(item.title, lang);
  const description = t(item.description, lang);
  const hasNav = items.length > 1;

  return (
    <div className="lightbox open" role="dialog" aria-modal="true" aria-label={title || "Media preview"}>
      <button type="button" className="lightbox__backdrop" aria-label="Close" onClick={closeLightbox} />
      <div className="lightbox__panel">
        <button
          type="button"
          className="lightbox__close"
          aria-label={lang === "cn" ? "关闭" : "Close"}
          onClick={closeLightbox}
        >
          <X size={18} strokeWidth={1.75} />
          <span className="lightbox__close-label">{lang === "cn" ? "关闭" : "Close"}</span>
        </button>

        {hasNav && (
          <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label="Previous" onClick={goPrev}>
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <button type="button" className="lightbox__nav lightbox__nav--next" aria-label="Next" onClick={goNext}>
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>
          </>
        )}

        <div className="lightbox__media">
          {item.type === "video" ? (
            <video
              ref={videoRef}
              src={item.src}
              poster={item.poster}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={item.src} alt={item.alt || title || "Media"} />
          )}
        </div>

        <div className="lightbox__meta">
          {title && <p className="lightbox__title">{title}</p>}
          {description && <p className="lightbox__desc">{description}</p>}
          {hasNav && (
            <p className="lightbox__counter">
              {index + 1} / {items.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
