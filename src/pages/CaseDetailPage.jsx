import { Link, useParams } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getCaseBySlug } from "../lib/content";
import CaseDetailHero from "../components/cases/CaseDetailHero";
import CaseProjectFile from "../components/cases/CaseProjectFile";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";

export default function CaseDetailPage() {
  const { slug } = useParams();
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <LoadingState />;

  const caseItem = getCaseBySlug(content, slug);

  if (!caseItem) {
    return (
      <div className="not-found container">
        <h1>{lang === "cn" ? "案例未找到" : "Case not found"}</h1>
        <Button as={Link} to="/cases">{lang === "cn" ? "返回案例列表" : "Back to works"}</Button>
      </div>
    );
  }

  return (
    <div className="case-detail-page">
      <CaseDetailHero caseItem={caseItem} />
      <div className="page container case-detail-page__content section-reveal">
        <div className="container--narrow case-detail-page__file">
          <CaseProjectFile caseItem={caseItem} content={content} lang={lang} />
        </div>
      </div>
    </div>
  );
}
