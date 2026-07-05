import { Link } from "react-router-dom";
import * as Lucide from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getVisibleServices, t } from "../lib/content";
import { getServiceProblems } from "../lib/homeContent";
import Button from "../components/ui/Button";

export default function ServicesPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  const services = getVisibleServices(content);

  return (
    <div className="page container fade-in">
      <header className="page-header">
        <span className="page-header__eyebrow">03 / SERVICES</span>
        <h1 className="page-title">{lang === "cn" ? "声音解决方案" : "Sound Solutions"}</h1>
        <p className="page-lead">
          {lang === "cn"
            ? "按项目类型定位现场与后期问题，提供可落地的调音、系统工程与混音支持。"
            : "Problem-focused live sound, system engineering and mixing support."}
        </p>
      </header>

      <div className="service-page-list">
        {services.map((svc, i) => {
          const Icon = Lucide[svc.icon] || Lucide.Circle;
          const num = String(i + 1).padStart(2, "0");
          const problems = getServiceProblems(svc, lang);

          return (
            <article key={svc.id} className="service-page-card">
              <div className="service-page-card__head">
                <span className="code-label service-page-card__code">SERVICE {num}</span>
                <div className="service-page-card__title-row">
                  <span className="service-page-card__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <h2 className="service-page-card__title">{t(svc.title, lang)}</h2>
                </div>
              </div>
              <p className="service-page-card__summary">{t(svc.summary, lang)}</p>
              <div className="service-page-card__problems">
                <span className="service-page-card__problems-label">
                  {lang === "cn" ? "解决问题" : "Addresses"}
                </span>
                <div className="service-page-card__tags">
                  {problems.map((problem) => (
                    <span key={problem} className="tag tag--outline">
                      {problem}
                    </span>
                  ))}
                </div>
              </div>
              {svc.description && t(svc.description, lang) !== "[TODO]" && (
                <p className="service-page-card__detail">{t(svc.description, lang)}</p>
              )}
              <ul className="service-page-card__meta">
                <li>
                  {lang === "cn"
                    ? "适合：演出方、Livehouse、品牌活动与音乐制作客户"
                    : "For: venues, tours, events and production clients"}
                </li>
                <li>
                  {lang === "cn"
                    ? "可交付：现场调音报告、系统调试、混音成品或技术方案"
                    : "Deliverables: tuning, system setup, mixes or technical plans"}
                </li>
              </ul>
              <div className="service-page-card__action">
                <Button as={Link} to="/booking" variant="secondary" className="btn--sm">
                  {lang === "cn" ? "预约此服务" : "Book This Service"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
