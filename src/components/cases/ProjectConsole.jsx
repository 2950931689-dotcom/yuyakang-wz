import { getCategoryLabel, getCaseProjectNumber, t } from "../../lib/content";
import { getCaseKeywordTags } from "../../lib/homeContent";
import { getCaseSystemSummary } from "../../lib/caseSignalFlow";

export default function ProjectConsole({ caseItem, content, lang }) {
  const projectNum = getCaseProjectNumber(content, caseItem);
  const roleText = t(caseItem.role, lang);
  const locationText = t(caseItem.location, lang);
  const categoryText = getCategoryLabel(caseItem.category, lang);
  const systemSummary = getCaseSystemSummary(caseItem, lang);
  const keywords = getCaseKeywordTags(caseItem, lang);

  return (
    <div className="project-console console-panel console-panel--compact">
      <div className="project-console__head">
        <span className="project-console__tag">PROJECT FILE</span>
        <span className="project-console__id">PROJECT {projectNum}</span>
        <span className="project-console__status">
          <span className="project-console__dot console-panel__status-dot" aria-hidden="true" />
          STATUS: DELIVERED
        </span>
        <span className="project-console__signal">SIGNAL: READY</span>
      </div>
      <div className="project-console__grid">
        {roleText && (
          <div className="project-console__cell">
            <span className="project-console__label">ROLE</span>
            <span className="project-console__value">{roleText}</span>
          </div>
        )}
        {locationText && (
          <div className="project-console__cell">
            <span className="project-console__label">
              {lang === "cn" ? "地点" : "LOCATION"}
            </span>
            <span className="project-console__value">{locationText}</span>
          </div>
        )}
        {categoryText && (
          <div className="project-console__cell">
            <span className="project-console__label">
              {lang === "cn" ? "分类" : "CATEGORY"}
            </span>
            <span className="project-console__value">{categoryText}</span>
          </div>
        )}
        {systemSummary && (
          <div className="project-console__cell project-console__cell--wide">
            <span className="project-console__label">SYSTEM</span>
            <span className="project-console__value">{systemSummary}</span>
          </div>
        )}
      </div>
      {keywords.length > 0 && (
        <div className="project-console__keywords">
          {keywords.map((kw) => (
            <span key={kw} className="project-console__keyword">
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
