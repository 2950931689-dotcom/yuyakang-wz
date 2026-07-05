import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";
import { HOME_WORKFLOW_STEPS } from "../../lib/homeContent";
import SectionTitle from "../ui/SectionTitle";

export default function WorkflowSection() {
  const { lang } = useLanguage();

  const steps = HOME_WORKFLOW_STEPS;

  return (
    <div className="workflow-section">
      <SectionTitle
        sectionIndex={4}
        eyebrow="WORKFLOW"
        title={lang === "cn" ? "合作流程" : "Workflow"}
        subtitle={
          lang === "cn"
            ? "从需求对接到现场调试与交付复盘的标准协作路径。"
            : "Standard path from briefing through on-site tuning to delivery review."
        }
      />
      <ol className="workflow-cue">
        {steps.map((step, index) => (
          <li key={step.order} className="workflow-cue__item">
            <div className="workflow-cue__num-col">
              <span className="workflow-cue__num">{String(step.order).padStart(2, "0")}</span>
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
