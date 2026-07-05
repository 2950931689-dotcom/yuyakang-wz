import SectionTitle from "../ui/SectionTitle";
import { buildToolRackItems } from "../../lib/aboutContent";
import { t } from "../../lib/content";

export default function ToolRack({ certificates, profile, lang }) {
  const items = buildToolRackItems({ certificates, profile, lang, t });

  return (
    <section className="about-section tool-rack">
      <SectionTitle
        sectionIndex={5}
        eyebrow="TOOL RACK"
        title={lang === "cn" ? "工具与认证机架" : "Tool Rack"}
      />

      <div className="tool-rack__frame">
        {items.map((item, i) => (
          <div key={item.id} className="tool-rack__unit">
            <span className="tool-rack__unit-code">
              RACK {String(i + 1).padStart(2, "0")}
            </span>
            <span className="tool-rack__unit-label">{item.label}</span>
            <span className="tool-rack__unit-scan" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
