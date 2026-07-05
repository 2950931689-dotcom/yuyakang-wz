import { CATEGORY_FILTERS } from "../../lib/content";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";

export default function CaseFilter({ active, onChange }) {
  const { lang } = useLanguage();

  return (
    <div className="case-filter" role="tablist">
      {CATEGORY_FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          role="tab"
          aria-selected={active === f.id}
          className={active === f.id ? "active" : ""}
          onClick={() => onChange(f.id)}
        >
          {t(f.label, lang)}
        </button>
      ))}
    </div>
  );
}
