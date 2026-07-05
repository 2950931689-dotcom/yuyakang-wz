import { Link } from "react-router-dom";
import { Headphones, Video } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCaseCover, getCategoryLabel, t } from "../../lib/content";
import Tag from "../ui/Tag";
import MediaFallback from "../ui/MediaFallback";

export default function CaseCard({ caseItem }) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const cover = getCaseCover(caseItem);

  if (!content) return null;

  return (
    <Link to={`/cases/${caseItem.slug}`} className="case-card">
      <div className="case-card__media">
        {cover ? (
          <img src={cover} alt={t(caseItem.title, lang)} loading="lazy" />
        ) : (
          <MediaFallback label={lang === "cn" ? "暂无封面" : "No Cover"} />
        )}
        <div className="case-card__badges">
          <Tag>{getCategoryLabel(caseItem.category, lang)}</Tag>
          {caseItem.featured && (
            <Tag featured>{lang === "cn" ? "精选" : "Featured"}</Tag>
          )}
        </div>
      </div>
      <div className="case-card__body">
        <h3 className="case-card__title">{t(caseItem.title, lang)}</h3>
        <div className="case-card__meta">
          {t(caseItem.location, lang)} · {t(caseItem.role, lang)}
        </div>
        <p className="case-card__summary">{t(caseItem.summary, lang)}</p>
        <div className="case-card__icons">
          {caseItem.videoUrl && <Video size={14} strokeWidth={1.5} aria-label="Video" />}
          {caseItem.audioUrl && <Headphones size={14} strokeWidth={1.5} aria-label="Audio" />}
        </div>
      </div>
    </Link>
  );
}
