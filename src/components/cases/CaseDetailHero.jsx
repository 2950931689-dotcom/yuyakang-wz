import { getCategoryLabel, getCaseProjectNumber, t } from "../../lib/content";
import { getCaseHeroImage } from "../../lib/caseVisuals";
import Tag from "../ui/Tag";

export default function CaseDetailHero({ caseItem, content, lang }) {
  const image = getCaseHeroImage(caseItem);
  const projectNum = getCaseProjectNumber(content, caseItem);
  const roleText = t(caseItem.role, lang);
  const locationText = t(caseItem.location, lang);
  const categoryText = getCategoryLabel(caseItem.category, lang);
  const projectDate = caseItem.projectDate || caseItem.date || "";
  const tags = caseItem.tags ?? [];
  const serviceText =
    t(caseItem.serviceContent, lang) || t(caseItem.services, lang);

  const metaRows = [
    locationText && {
      key: lang === "cn" ? "地点" : "LOCATION",
      value: locationText,
    },
    roleText && {
      key: lang === "cn" ? "角色" : "ROLE",
      value: roleText,
    },
    {
      key: lang === "cn" ? "状态" : "STATUS",
      value: "DELIVERED",
    },
    projectDate && {
      key: lang === "cn" ? "时间" : "DATE",
      value: projectDate,
    },
  ].filter(Boolean);

  return (
    <header
      className={`case-detail-hero${image ? " case-detail-hero--has-image" : ""}`}
    >
      {image && (
        <div
          className="case-detail-hero__bg"
          style={{ backgroundImage: `url("${image}")` }}
          aria-hidden="true"
        />
      )}
      <div className="case-detail-hero__overlay" aria-hidden="true" />
      <div className="case-detail-hero__grid" aria-hidden="true" />

      <div className="case-detail-hero__content container">
        <div className="case-detail-hero__copy">
          <div className="case-detail-hero__top">
            <span className="case-detail-hero__file-id">PROJECT FILE {projectNum}</span>
            {caseItem.featured && (
              <span className="case-detail-hero__featured">
                {lang === "cn" ? "精选" : "FEATURED"}
              </span>
            )}
          </div>
          <h1 className="case-detail-hero__title">{t(caseItem.title, lang)}</h1>

          {(categoryText || serviceText || tags.length > 0) && (
            <div className="case-detail-hero__tags">
              {categoryText && (
                <span className="case-detail-hero__type">{categoryText}</span>
              )}
              {serviceText && serviceText !== roleText && (
                <span className="case-detail-hero__service">{serviceText}</span>
              )}
              {tags.map((tag) => (
                <Tag key={typeof tag === "string" ? tag : tag.cn}>
                  {typeof tag === "string" ? tag : t(tag, lang)}
                </Tag>
              ))}
            </div>
          )}

          {metaRows.length > 0 && (
            <dl className="case-detail-hero__meta">
              {metaRows.map((row) => (
                <div key={row.key} className="case-detail-hero__meta-row">
                  <dt>{row.key}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </header>
  );
}
