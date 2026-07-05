import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switch" aria-label="Language switch">
      <button
        type="button"
        className={lang === "cn" ? "active" : ""}
        onClick={() => setLang("cn")}
      >
        CN
      </button>
      <span>/</span>
      <button
        type="button"
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
