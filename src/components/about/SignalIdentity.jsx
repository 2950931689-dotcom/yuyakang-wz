import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import { getSignalIdentityNodes } from "../../lib/cmsBinding";

export default function SignalIdentity({ content, lang }) {
  const [activeId, setActiveId] = useState(null);
  const nodes = getSignalIdentityNodes(content, lang);

  return (
    <section className="about-section signal-identity">
      <SectionTitle
        sectionIndex={3}
        eyebrow="SIGNAL IDENTITY"
        title={lang === "cn" ? "能力信号链" : "Signal Identity"}
        subtitle={
          lang === "cn"
            ? "录音技术背景 → 现场调音 → 系统调试 → 混音后期 → 项目交付"
            : "Recording → Live Sound → System Tuning → Mixing → Delivery"
        }
      />

      <div className="signal-identity__track" aria-hidden="true">
        <span className="signal-identity__track-dot" />
      </div>

      <ol className="signal-identity__nodes">
        {nodes.map((node, index) => (
          <li key={node.id} className="signal-identity__item">
            {index > 0 && <span className="signal-identity__connector" aria-hidden="true" />}
            <button
              type="button"
              className={`signal-identity__node patch-channel${activeId === node.id ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(node.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(node.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="signal-identity__node-code">{node.label}</span>
              <span className="signal-identity__node-title">
                {lang === "cn" ? node.labelCn : node.label}
              </span>
              <span className="signal-identity__node-desc">{node.desc[lang]}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
