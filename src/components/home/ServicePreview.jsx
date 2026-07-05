import * as Lucide from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getVisibleServices, t } from "../../lib/content";

export default function ServicePreview() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const services = getVisibleServices(content);

  return (
    <div>
      {services.map((svc) => {
        const Icon = Lucide[svc.icon] || Lucide.Circle;
        return (
          <div key={svc.id} className="service-preview__item">
            <div className="service-preview__icon">
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{t(svc.title, lang)}</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>{t(svc.summary, lang)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
