import SectionTitle from "../ui/SectionTitle";
import { getProfileIdentity } from "../../lib/cmsBinding";
import {
  ABOUT_IDENTITY_TAGS,
  getAboutIntroParagraphs,
} from "../../lib/aboutContent";

export default function EngineerIdentity({ content, profile, lang }) {
  const identity = getProfileIdentity(content ?? { profile }, lang);
  const { nameCn, nameEn, title, location, status, field, engineerId } = identity;
  const introParagraphs = getAboutIntroParagraphs(profile, lang);
  const identityTags = ABOUT_IDENTITY_TAGS[lang] || ABOUT_IDENTITY_TAGS.cn;

  const params = [
    { key: "ID", value: engineerId },
    { key: "STATUS", value: status },
    { key: "LOCATION", value: String(location || "").toUpperCase() },
    { key: "ROLE", value: profile?.roleCode || "SYSTEM ENGINEER" },
    { key: "FIELD", value: field },
  ];

  return (
    <section className="about-section engineer-identity" id="professional-identity">
      <SectionTitle
        sectionIndex={1}
        eyebrow="PROFESSIONAL IDENTITY"
        title={lang === "cn" ? "专业身份" : "Professional Identity"}
      />

      <div className="engineer-identity__card console-panel console-panel--split">
        <div className="engineer-identity__main">
          {profile?.avatarUrl && (
            <div className="engineer-identity__avatar">
              <img src={profile.avatarUrl} alt={nameCn} loading="lazy" />
            </div>
          )}
          <div className="engineer-identity__copy">
            <h1 className="page-title engineer-identity__name">
              <span className="engineer-identity__name-cn">{nameCn}</span>
              <span className="engineer-identity__name-sep"> / </span>
              <span className="engineer-identity__name-en">{nameEn}</span>
            </h1>
            <p className="engineer-identity__role">{title || identity.role}</p>

            <ul
              className="engineer-identity__tags"
              aria-label={lang === "cn" ? "专业身份标签" : "Identity tags"}
            >
              {identityTags.map((tag) => (
                <li key={tag} className="engineer-identity__tag">
                  {tag}
                </li>
              ))}
            </ul>

            <div className="engineer-identity__intro">
              {introParagraphs.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        <aside
          className="engineer-identity__params"
          aria-label={lang === "cn" ? "身份参数" : "Identity parameters"}
        >
          {params.map((p) => (
            <div key={p.key} className="engineer-identity__param">
              <span className="engineer-identity__param-key">{p.key}</span>
              <span className="engineer-identity__param-value">
                {p.key === "STATUS" && (
                  <span
                    className="engineer-identity__status-dot console-panel__status-dot"
                    aria-hidden="true"
                  />
                )}
                {p.value}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
