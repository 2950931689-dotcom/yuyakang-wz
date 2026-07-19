import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Video } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCaseCover, getCategoryLabel, getCaseProjectNumber, t } from "../../lib/content";
import { getCaseKeywordTags } from "../../lib/homeContent";
import { MOTION, prefersReducedMotion } from "../../lib/motion";
import Tag from "../ui/Tag";
import MediaFallback from "../ui/MediaFallback";

export default function CaseCard({ caseItem, projectNumber, featuredLayout = false }) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);
  const cover = getCaseCover(caseItem);
  const projectId =
    projectNumber ?? (content ? getCaseProjectNumber(content, caseItem) : "000");
  const keywordTags = getCaseKeywordTags(caseItem, lang);

  if (!content) return null;

  const href = `/cases/${caseItem.slug}`;

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (isOpening) return;
      setIsOpening(true);
      const delay = prefersReducedMotion() ? 0 : MOTION.launchMs;
      window.setTimeout(() => {
        navigate(href);
      }, delay);
    },
    [href, navigate, isOpening]
  );

  return (
    <a
      href={href}
      className={[
        "case-card",
        isOpening && "is-opening",
        featuredLayout && "case-card--featured",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
    >
      <span className="case-card__scanline" aria-hidden="true" />
      <div className="case-card__media">
        {cover ? (
          <img src={cover} alt={t(caseItem.title, lang)} loading="lazy" />
        ) : (
          <MediaFallback label={lang === "cn" ? "暂无封面" : "No Cover"} />
        )}
        <div className="case-card__overlay" aria-hidden="true">
          <span>
            {featuredLayout
              ? lang === "cn"
                ? "OPEN PROJECT FILE"
                : "OPEN PROJECT FILE"
              : lang === "cn"
                ? "OPEN PROJECT FILE"
                : "OPEN PROJECT FILE"}
          </span>
        </div>
        <div className="case-card__open-meta" aria-hidden="true">
          <span>SCAN FILE</span>
          <span>SIGNAL VERIFIED</span>
          <span>OPEN PROJECT FILE</span>
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
        <span className="case-card__project-status">PROJECT FILE</span>
        <span className="case-card__project-id">PROJECT {projectId}</span>
        <h3 className="case-card__title">{t(caseItem.title, lang)}</h3>
        <div className="case-card__meta-grid">
          <span className="case-card__meta-item">
            <span className="case-card__meta-label">{lang === "cn" ? "地点" : "Location"}</span>
            {t(caseItem.location, lang)}
          </span>
          <span className="case-card__meta-item">
            <span className="case-card__meta-label">{lang === "cn" ? "角色" : "Role"}</span>
            {t(caseItem.role, lang)}
          </span>
        </div>
        {keywordTags.length > 0 && (
          <div className="case-card__keywords">
            {keywordTags.map((tag) => (
              <span key={tag} className="case-card__keyword">
                {tag}
              </span>
            ))}
          </div>
        )}
        {!featuredLayout && (
          <p className="case-card__summary">{t(caseItem.summary, lang)}</p>
        )}
        {featuredLayout && (
          <span className="case-card__archive-link">
            {lang === "cn" ? "查看项目档案" : "Open Project File"}
          </span>
        )}
      </div>
    </a>
  );
}
