import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Video } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCaseCover, getCategoryLabel, getCaseProjectNumber, t } from "../../lib/content";
import Tag from "../ui/Tag";
import MediaFallback from "../ui/MediaFallback";

export default function CaseCard({ caseItem, projectNumber }) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);
  const cover = getCaseCover(caseItem);
  const projectId =
    projectNumber ?? (content ? getCaseProjectNumber(content, caseItem) : "000");

  if (!content) return null;

  const href = `/cases/${caseItem.slug}`;

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (pressing) return;
      setPressing(true);
      window.setTimeout(() => {
        navigate(href);
      }, 100);
    },
    [href, navigate, pressing]
  );

  return (
    <a
      href={href}
      className={`case-card${pressing ? " case-card--pressing" : ""}`}
      onClick={handleClick}
    >
      <div className="case-card__media">
        {cover ? (
          <img src={cover} alt={t(caseItem.title, lang)} loading="lazy" />
        ) : (
          <MediaFallback label={lang === "cn" ? "暂无封面" : "No Cover"} />
        )}
        <div className="case-card__overlay" aria-hidden="true">
          <span>{lang === "cn" ? "查看项目" : "View Project"}</span>
        </div>
        <div className="case-card__badges">
          <Tag>{getCategoryLabel(caseItem.category, lang)}</Tag>
          {caseItem.featured && (
            <Tag featured>{lang === "cn" ? "精选" : "Featured"}</Tag>
          )}
        </div>
        {(caseItem.videoUrl || caseItem.audioUrl) && (
          <div className="case-card__media-tags">
            {caseItem.videoUrl && (
              <span className="case-card__media-tag">
                <Video size={12} strokeWidth={1.5} />
                {lang === "cn" ? "视频" : "Video"}
              </span>
            )}
            {caseItem.audioUrl && (
              <span className="case-card__media-tag">
                <Headphones size={12} strokeWidth={1.5} />
                {lang === "cn" ? "音频" : "Audio"}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="case-card__body">
        <span className="case-card__project-id">PROJECT {projectId}</span>
        <h3 className="case-card__title">{t(caseItem.title, lang)}</h3>
        <div className="case-card__meta">
          {t(caseItem.location, lang)} · {t(caseItem.role, lang)}
        </div>
        <p className="case-card__summary">{t(caseItem.summary, lang)}</p>
      </div>
    </a>
  );
}
