import { getCategoryCounts, t } from "../../lib/content";
import { getHomeCasePlateChrome } from "../../lib/cmsBinding";
import { CASE_PLATES } from "../../lib/content";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";

/**
 * Two-level case filter: plate (全部 / 现场·系统 / 后期·混音) + branch tabs.
 * Plate/branch labels prefer CMS homeSections.
 */
export default function CaseFilter({ plateId, branchId, onPlateChange, onBranchChange }) {
  const { lang } = useLanguage();
  const { content } = useContent();
  const counts = content ? getCategoryCounts(content) : {};
  const plates = CASE_PLATES.map((p) => getHomeCasePlateChrome(content, p.id));
  const activePlate =
    plateId && plateId !== "all" ? getHomeCasePlateChrome(content, plateId) : null;

  return (
    <div className="case-filter-wrap">
      <div className="case-filter case-filter--plates" role="tablist" aria-label={lang === "cn" ? "案例板块" : "Case plates"}>
        <button
          type="button"
          role="tab"
          aria-selected={plateId === "all" || !plateId}
          className={plateId === "all" || !plateId ? "active" : ""}
          onClick={() => onPlateChange("all")}
        >
          <span>{lang === "cn" ? "全部" : "All"}</span>
          <span className="case-filter__count">{counts.all ?? 0}</span>
        </button>
        {plates.map((plate) => (
          <button
            key={plate.id}
            type="button"
            role="tab"
            aria-selected={plateId === plate.id}
            className={plateId === plate.id ? "active" : ""}
            onClick={() => onPlateChange(plate.id)}
          >
            <span>{t(plate.label, lang)}</span>
            <span className="case-filter__count">{counts[`plate:${plate.id}`] ?? 0}</span>
          </button>
        ))}
      </div>

      {activePlate ? (
        <div
          className="case-filter case-filter--branches"
          role="tablist"
          aria-label={t(activePlate.label, lang)}
        >
          {activePlate.branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              role="tab"
              aria-selected={branchId === branch.id}
              className={branchId === branch.id ? "active" : ""}
              onClick={() => onBranchChange(branch.id)}
            >
              <span>{t(branch.label, lang)}</span>
              <span className="case-filter__count">{counts[branch.id] ?? 0}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
