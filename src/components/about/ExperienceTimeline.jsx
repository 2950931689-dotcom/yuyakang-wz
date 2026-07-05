import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import { buildExperienceCues } from "../../lib/aboutContent";
import { t } from "../../lib/content";

export default function ExperienceTimeline({ profile, lang }) {
  const [activeId, setActiveId] = useState(null);
  const cues = buildExperienceCues(profile, lang, t);

  return (
    <section className="about-section experience-timeline">
      <SectionTitle
        sectionIndex={4}
        eyebrow="EXPERIENCE TIMELINE"
        title={lang === "cn" ? "声音经历时间轴" : "Experience Timeline"}
      />

      <div className="experience-timeline__wave" aria-hidden="true">
        {Array.from({ length: 48 }, (_, i) => (
          <span
            key={i}
            className="experience-timeline__bar"
            style={{ "--bar-h": `${20 + Math.sin(i * 0.45) * 14 + (i % 3) * 4}%` }}
          />
        ))}
      </div>

      <ol className="experience-timeline__list">
        {cues.map((cue) => {
          const title = typeof cue.title === "string" ? cue.title : t(cue.title, lang);
          const desc = typeof cue.desc === "string" ? cue.desc : t(cue.desc, lang);
          const isActive = activeId === cue.id;

          return (
            <li
              key={cue.id}
              className={`experience-timeline__cue${isActive ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(cue.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <span className="experience-timeline__timecode">{cue.timecode}</span>
              <span className="experience-timeline__rail" aria-hidden="true">
                <span className="experience-timeline__rail-dot" />
              </span>
              <div className="experience-timeline__body">
                <h3 className="experience-timeline__title">{title}</h3>
                <p className="experience-timeline__desc">{desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
