import { useLanguage } from "../../context/LanguageContext";
import {
  CREDENTIAL_IDENTITIES,
  CREDENTIALS_SUBTITLE,
  ENGINEERING_TAGS,
} from "../../lib/homeContent";
import SectionTitle from "../ui/SectionTitle";

export default function CredentialsSection() {
  const { lang } = useLanguage();

  return (
    <div className="credentials">
      <SectionTitle
        sectionIndex={1}
        eyebrow="CREDENTIALS"
        title={lang === "cn" ? "专业背书" : "Professional Credentials"}
        subtitle={CREDENTIALS_SUBTITLE[lang]}
      />
      <div className="credentials__panel">
        <div className="credentials__tags" aria-label={lang === "cn" ? "工程参数标签" : "Engineering tags"}>
          {ENGINEERING_TAGS.map((tag) => (
            <span key={tag} className="credentials__tag">
              {tag}
            </span>
          ))}
        </div>
        <ul className="credentials__list">
          {CREDENTIAL_IDENTITIES[lang].map((item) => (
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
