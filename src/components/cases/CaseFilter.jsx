import { CATEGORY_FILTERS, getCategoryCounts, t } from "../../lib/content";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";

export default function CaseFilter({ active, onChange }) {
  const { lang } = useLanguage();
  const { content } = useContent();
  const counts = content ? getCategoryCounts(content) : {};

  return (
    <div className="case-filter-wrap">
      <div className="case-filter" role="tablist">
        {CATEGORY_FILTERS.map((f) => {
          const count = counts[f.id] ?? 0;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active === f.id}
              className={active === f.id ? "active" : ""}
              onClick={() => onChange(f.id)}
            >
              <span>{t(f.label, lang)}</span>
              <span className="case-filter__count">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
