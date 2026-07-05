import { useLanguage } from "../../context/LanguageContext";
import { getUiText } from "../../lib/content";

export default function LoadingState({ message }) {
  const { lang } = useLanguage();

  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="state__spinner" aria-hidden="true" />
      <p>{message ?? getUiText("loading", lang)}</p>
    </div>
  );
}
