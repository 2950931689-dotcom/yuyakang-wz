import { useLanguage } from "../../context/LanguageContext";
import { getUiText } from "../../lib/content";

export default function ErrorState({ message, hint }) {
  const { lang } = useLanguage();

  return (
    <div className="state state--error" role="alert">
      <p className="state__title">{message ?? getUiText("errorDefault", lang)}</p>
      {hint && <p className="state__hint">{hint}</p>}
    </div>
  );
}
