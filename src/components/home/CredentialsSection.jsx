import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeCredentials } from "../../lib/cmsBinding";
import { CREDENTIALS_SUBTITLE } from "../../lib/homeContent";
import SectionTitle from "../ui/SectionTitle";

export default function CredentialsSection() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const { items, tags } = getHomeCredentials(content, lang);

  return (
    <div className="credentials">
      <SectionTitle
        sectionIndex={1}
        eyebrow="CREDENTIALS"
        title={lang === "cn" ? "专业背书" : "Professional Credentials"}
        subtitle={CREDENTIALS_SUBTITLE[lang]}
      />
      <div className="credentials__panel console-panel console-panel--compact">
        <div className="credentials__tags" aria-label={lang === "cn" ? "工程参数标签" : "Engineering tags"}>
          {tags.map((tag) => (
            <span key={tag} className="credentials__tag">
              {tag}
            </span>
          ))}
        </div>
        <ul className="credentials__list">
          {items.map((item) => (
            <li key={item} className="credentials__item">
              <span className="credentials__item-mark" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
