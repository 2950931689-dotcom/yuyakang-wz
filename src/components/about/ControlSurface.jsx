import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import { getControlSurfaceChannels } from "../../lib/cmsBinding";

function LevelMeters({ level, active }) {
  const lit = Math.round((level / 100) * 8);
  return (
    <div className="control-surface__meters" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className={`control-surface__meter${i < lit ? " is-lit" : ""}${active && i < lit ? " is-active" : ""}`}
        />
      ))}
    </div>
  );
}

export default function ControlSurface({ content, lang }) {
  const [activeId, setActiveId] = useState(null);
  const channels = getControlSurfaceChannels(content, lang);

  return (
    <section className="about-section control-surface">
      <SectionTitle
        sectionIndex={4}
        eyebrow="CONTROL SURFACE"
        title={lang === "cn" ? "能力控制台" : "Control Surface"}
      />

      <div className="control-surface__deck">
        {channels.map((ch) => {
          const isActive = activeId === ch.id;
          return (
            <div
              key={ch.id}
              className={`control-surface__channel${isActive ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(ch.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <span className="control-surface__channel-label">{ch.label}</span>
              <LevelMeters level={ch.level} active={isActive} />
              <div className="control-surface__fader">
                <span
                  className="control-surface__fader-thumb"
                  style={{ "--fader-level": `${ch.level}%` }}
                />
              </div>
              <span className="control-surface__level">
                LEVEL {ch.level} / 100
              </span>
              <p className="control-surface__desc">{ch.desc[lang]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
