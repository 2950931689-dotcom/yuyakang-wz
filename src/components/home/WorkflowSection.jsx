import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";
import SectionTitle from "../ui/SectionTitle";

export default function WorkflowSection() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const steps = [...content.siteSettings.processSteps].sort((a, b) => a.order - b.order);

  return (
    <div>
      <SectionTitle
        eyebrow="Process"
        title={lang === "cn" ? "工作流程" : "Workflow"}
      />
      <div className="workflow">
        {steps.map((step) => (
          <div key={step.order} className="workflow__step">
            <div className="workflow__num">{String(step.order).padStart(2, "0")}</div>
            <div className="workflow__title">{t(step.title, lang)}</div>
            <div className="workflow__desc">{t(step.description, lang)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
