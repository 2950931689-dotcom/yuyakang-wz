import { useLanguage } from "../../context/LanguageContext";
import { getUiText } from "../../lib/content";

export default function MediaFallback({ label, compact = false }) {
  const { lang } = useLanguage();

  return (
    <div className={`media-fallback${compact ? " media-fallback--compact" : ""}`}>
      <span className="media-fallback__grid" aria-hidden="true" />
      <span>{label ?? getUiText("noMedia", lang)}</span>
    </div>
  );
}
