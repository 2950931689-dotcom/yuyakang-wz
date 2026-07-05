import { Link, useParams } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getCaseBySlug, getCategoryLabel, t } from "../lib/content";
import CaseGallery from "../components/cases/CaseGallery";
import AudioPreviewPlaceholder from "../components/cases/AudioPreviewPlaceholder";
import Tag from "../components/ui/Tag";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

function DetailBlock({ title, children }) {
  if (!children) return null;
  return (
    <div className="prose-block">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export default function CaseDetailPage() {
  const { slug } = useParams();
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  const caseItem = getCaseBySlug(content, slug);

  if (!caseItem) {
    return (
      <div className="not-found container">
        <h1>{lang === "cn" ? "案例未找到" : "Case not found"}</h1>
        <Button as={Link} to="/cases">{lang === "cn" ? "返回案例列表" : "Back to works"}</Button>
      </div>
    );
  }

  const ci = content.i18n.cases;

  return (
    <article className="page container fade-in">
      <div style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Tag>{getCategoryLabel(caseItem.category, lang)}</Tag>
        {caseItem.featured && <Tag featured>{lang === "cn" ? "精选" : "Featured"}</Tag>}
      </div>
      <h1 className="page-title">{t(caseItem.title, lang)}</h1>
      <p className="page-lead">
        {[t(caseItem.location, lang), caseItem.date, t(caseItem.role, lang)].filter(Boolean).join(" · ")}
      </p>

      <DetailBlock title={lang === "cn" ? "项目背景" : "Background"}>{t(caseItem.background, lang)}</DetailBlock>
      <DetailBlock title={t(ci.challenge, lang)}>{t(caseItem.challenge, lang)}</DetailBlock>
      <DetailBlock title={t(ci.solution, lang)}>{t(caseItem.solution, lang)}</DetailBlock>
      <DetailBlock title={t(ci.result, lang)}>{t(caseItem.result, lang)}</DetailBlock>
      <DetailBlock title={t(ci.equipment, lang)}>{t(caseItem.equipment, lang)}</DetailBlock>
      {t(caseItem.clientFeedback, lang) && (
        <DetailBlock title={t(ci.clientFeedback, lang)}>{t(caseItem.clientFeedback, lang)}</DetailBlock>
      )}

      <div className="prose-block">
        <h3>{lang === "cn" ? "现场图片" : "Gallery"}</h3>
        <CaseGallery caseItem={caseItem} />
      </div>

      <div className="prose-block">
        <h3>{lang === "cn" ? "视频" : "Video"}</h3>
        {caseItem.videoUrl ? (
          <video src={caseItem.videoUrl} controls playsInline preload="metadata" style={{ width: "100%", maxWidth: 800 }} />
        ) : (
          <EmptyState message={lang === "cn" ? "暂无视频" : "No video"} />
        )}
      </div>

      <div className="prose-block">
        <h3>{lang === "cn" ? "音频试听" : "Audio Preview"}</h3>
        {caseItem.audioUrl ? <AudioPreviewPlaceholder /> : (
          <EmptyState message={t(content.i18n.common.noAudio, lang)} />
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <Button as={Link} to="/booking">
          {lang === "cn" ? "预约类似项目" : "Book a Similar Project"}
        </Button>
      </div>
    </article>
  );
}
