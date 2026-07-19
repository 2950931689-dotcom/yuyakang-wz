import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";
import { getHomeSection, getHomeWorkflow } from "../../lib/cmsBinding";
import SectionTitle from "../ui/SectionTitle";

export default function WorkflowSection() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const steps = getHomeWorkflow(content);
  const section = getHomeSection(content, "workflow");

  if (!steps.length) return null;

  return (
    <div className="workflow-section">
      <SectionTitle
        sectionIndex={5}
        eyebrow={t(section.eyebrow, lang) || "WORKFLOW"}
        title={t(section.title, lang)}
        subtitle={t(section.subtitle, lang)}
      />
      <ol className="workflow-cue">
        {steps.map((step, index) => (
          <li key={step.order ?? index} className="workflow-cue__item">
            <div className="workflow-cue__num-col">
              <span className="workflow-cue__num">
                {String(step.order ?? index + 1).padStart(2, "0")}
              </span>
              {index < steps.length - 1 && (
                <span className="workflow-cue__line" aria-hidden="true" />
              )}
            </div>
            <div className="workflow-cue__content">
              <h3 className="workflow-cue__title">{t(step.title, lang)}</h3>
              <p className="workflow-cue__desc">{t(step.description, lang)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
