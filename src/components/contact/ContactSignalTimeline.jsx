import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import { CONTACT_TIMELINE } from "../../lib/contactContent";

export default function ContactSignalTimeline({ lang }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="contact-section contact-signal-timeline">
      <SectionTitle
        sectionIndex={3}
        eyebrow="CONTACT SIGNAL FLOW"
        title={lang === "cn" ? "联系信号流程" : "Contact Signal Flow"}
      />

      <div className="contact-signal-timeline__wave" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className="contact-signal-timeline__bar"
            style={{ "--h": `${16 + Math.sin(i * 0.5) * 12 + (i % 3) * 4}%` }}
          />
        ))}
      </div>

      <ol className="contact-signal-timeline__list">
        {CONTACT_TIMELINE.map((cue) => {
          const isActive = activeId === cue.id;
          return (
            <li
              key={cue.id}
              className={`contact-signal-timeline__cue${isActive ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(cue.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <span className="contact-signal-timeline__time">{cue.timecode}</span>
              <span className="contact-signal-timeline__rail" aria-hidden="true">
                <span className="contact-signal-timeline__dot" />
              </span>
              <div className="contact-signal-timeline__body">
                <h3>{cue.title[lang]}</h3>
                <p>{cue.desc[lang]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
