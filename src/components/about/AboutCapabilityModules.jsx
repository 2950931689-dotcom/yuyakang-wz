import SectionTitle from "../ui/SectionTitle";
import {
  ABOUT_CAPABILITY_MODULES,
  ABOUT_CREDENTIAL_TAGS,
} from "../../lib/aboutContent";

function TagList({ items, label }) {
  if (!items?.length) return null;
  return (
    <ul className="about-capability__tags" aria-label={label}>
      {items.map((tag) => (
        <li key={tag} className="about-capability__tag">
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** Modules 03–07: recording, system, live, tools, consoles. */
export default function AboutCapabilityModules({ lang }) {
  return (
    <>
      {ABOUT_CAPABILITY_MODULES.map((mod) => {
        const title = mod.title[lang] || mod.title.cn;
        const lead = mod.lead[lang] || mod.lead.cn;
        const tags = mod.tags[lang] || mod.tags.cn;
        return (
          <section key={mod.id} className="about-section about-capability" id={mod.id}>
            <SectionTitle
              sectionIndex={mod.sectionIndex}
              eyebrow={mod.eyebrow}
              title={title}
            />
            <div className="about-capability__panel console-panel console-panel--compact">
              <p className="about-capability__lead">{lead}</p>
              <TagList
                items={tags}
                label={lang === "cn" ? `${title}标签` : `${title} tags`}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}

/** Text credential tags shown above the certificate image rack. */
export function AboutCredentialTags({ lang }) {
  const tags = ABOUT_CREDENTIAL_TAGS[lang] || ABOUT_CREDENTIAL_TAGS.cn;
  return (
    <TagList
      items={tags}
      label={lang === "cn" ? "资质标签" : "Credential tags"}
    />
  );
}
