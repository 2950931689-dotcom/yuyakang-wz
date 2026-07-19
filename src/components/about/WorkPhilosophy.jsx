import SectionTitle from "../ui/SectionTitle";
import { WORK_PHILOSOPHY } from "../../lib/aboutContent";

export default function WorkPhilosophy({ lang }) {
  return (
    <section className="about-section work-philosophy">
      <SectionTitle
        sectionIndex={9}
        eyebrow="WORK PHILOSOPHY"
        title={lang === "cn" ? "工作方法论" : "Work Philosophy"}
      />

      <p className="work-philosophy__intro">{WORK_PHILOSOPHY.intro[lang]}</p>

      <div className="work-philosophy__grid">
        {WORK_PHILOSOPHY.principles.map((p) => (
          <article key={p.id} className="work-philosophy__card">
            <span className="work-philosophy__label">{p.label}</span>
            <p className="work-philosophy__text">{p.title[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
