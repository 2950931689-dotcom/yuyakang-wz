import { getCategoryLabel, getCaseToolsText, t } from "../../lib/content";
import Tag from "../ui/Tag";

function QuickCard({ code, title, text, lang }) {
  if (!text?.trim()) return null;

  return (
    <article className="project-quick-view__card console-rack__unit">
      <header className="project-quick-view__card-head">
        <span className="project-quick-view__card-code console-rack__index">{code}</span>
        <h3 className="project-quick-view__card-title">{title}</h3>
      </header>
      <div className="project-quick-view__card-body">
        {text.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para.trim()}</p>
        ))}
      </div>
    </article>
  );
}

export default function ProjectQuickView({ caseItem, lang }) {
  const overview =
    t(caseItem.summary, lang) || t(caseItem.background, lang);
  const backgroundOnly =
    t(caseItem.summary, lang) && t(caseItem.background, lang)
      ? t(caseItem.background, lang)
      : "";
  const roleText = t(caseItem.role, lang);
  const challengeText = t(caseItem.challenge, lang);
  const solutionText = t(caseItem.solution, lang);
  const resultText = t(caseItem.result, lang);
  const toolsText = getCaseToolsText(caseItem, lang);
  const tags = caseItem.tags ?? [];
  const categoryText = getCategoryLabel(caseItem.category, lang);
  const locationText = t(caseItem.location, lang);

  const labels = {
    section: lang === "cn" ? "快速项目概览" : "Project Quick View",
    background: lang === "cn" ? "项目背景" : "Background",
    role: lang === "cn" ? "我的角色" : "My Role",
    challenge: lang === "cn" ? "现场问题" : "On-Site Challenge",
    solution: lang === "cn" ? "解决思路" : "Approach",
    result: lang === "cn" ? "交付结果" : "Delivery Result",
  };

  const hasCards =
    overview ||
    backgroundOnly ||
    roleText ||
    challengeText ||
    solutionText ||
    resultText;

  if (!hasCards && !tags.length && !toolsText && !categoryText && !locationText) {
    return null;
  }

  return (
    <section className="case-file__section project-quick-view">
      <header className="case-file__section-head">
        <span className="case-file__section-code">PROJECT QUICK VIEW</span>
        <h2 className="case-file__section-title">{labels.section}</h2>
      </header>

      {(categoryText || locationText || tags.length > 0) && (
        <div className="project-quick-view__meta">
          {categoryText && (
            <span className="project-quick-view__meta-item">
              <span className="project-quick-view__meta-key">
                {lang === "cn" ? "类型" : "TYPE"}
              </span>
              <span className="project-quick-view__meta-val">{categoryText}</span>
            </span>
          )}
          {locationText && (
            <span className="project-quick-view__meta-item">
              <span className="project-quick-view__meta-key">
                {lang === "cn" ? "地点" : "LOCATION"}
              </span>
              <span className="project-quick-view__meta-val">{locationText}</span>
            </span>
          )}
          {tags.length > 0 && (
            <div className="project-quick-view__tags">
              {tags.map((tag) => (
                <Tag key={typeof tag === "string" ? tag : tag.cn}>
                  {typeof tag === "string" ? tag : t(tag, lang)}
                </Tag>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="project-quick-view__grid">
        <QuickCard
          code="01"
          title={labels.background}
          text={backgroundOnly || overview}
          lang={lang}
        />
        <QuickCard code="02" title={labels.role} text={roleText} lang={lang} />
        <QuickCard code="03" title={labels.challenge} text={challengeText} lang={lang} />
        <QuickCard code="04" title={labels.solution} text={solutionText} lang={lang} />
        <QuickCard code="05" title={labels.result} text={resultText} lang={lang} />
      </div>

      {Array.isArray(caseItem.toolsUsed) && caseItem.toolsUsed.length > 0 && (
        <div className="project-quick-view__tools">
          <span className="project-quick-view__tools-label">
            {lang === "cn" ? "使用设备" : "TOOLS"}
          </span>
          <div className="project-quick-view__tools-list">
            {caseItem.toolsUsed.map((tool) => (
              <span key={tool} className="case-file__tool-chip">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
