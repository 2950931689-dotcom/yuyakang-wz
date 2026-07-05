import * as Lucide from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getVisibleServices, t } from "../../lib/content";
import { getServiceProblems } from "../../lib/homeContent";

export default function ServicePreview() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const services = getVisibleServices(content);

  return (
    <div className="service-preview">
      {services.map((svc, i) => {
        const Icon = Lucide[svc.icon] || Lucide.Circle;
        const num = String(i + 1).padStart(2, "0");
        const problems = getServiceProblems(svc, lang);

        return (
          <div key={svc.id} className="service-preview__item">
            <div className="service-preview__icon">
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <div className="service-preview__body">
              <span className="service-preview__code">SERVICE {num}</span>
              <h3 className="service-preview__title">{t(svc.title, lang)}</h3>
              {svc.summary && (
                <p className="service-preview__summary">{t(svc.summary, lang)}</p>
              )}
              <div className="service-preview__problems">
                <span className="service-preview__problems-label">
                  {lang === "cn" ? "解决问题：" : "Addresses:"}
                </span>
                <span className="service-preview__problems-list">
                  {problems.join(lang === "cn" ? " / " : " · ")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
