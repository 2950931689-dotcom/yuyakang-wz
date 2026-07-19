import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeProfileCopy, getProfileIdentity } from "../../lib/cmsBinding";
import { getVisibleCertificates, getSiteDisplayName } from "../../lib/content";
import CertificationRack from "../about/CertificationRack";
import SectionTitle from "../ui/SectionTitle";

/**
 * Homepage 01 — short personal intro + certificate rack (PC & mobile).
 * Copy from CMS homeSections.profile.
 */
export default function HomeProfileSection() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const identity = getProfileIdentity(content, lang);
  const copy = getHomeProfileCopy(content, lang);
  const nameCn = identity.nameCn || "余雅康";
  const brandEn = getSiteDisplayName(content, "en") || "YU YAKANG AUDIO";
  const certificates = getVisibleCertificates(content);

  return (
    <div className="home-profile">
      <SectionTitle
        sectionIndex={1}
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <div className="home-profile__panel console-panel console-panel--compact">
        <div className="home-profile__identity">
          <p className="home-profile__name">
            <span className="home-profile__name-cn">{nameCn}</span>
            <span className="home-profile__name-slash" aria-hidden="true">
              /
            </span>
            <span className="home-profile__name-en">{brandEn}</span>
          </p>

          <ul className="home-profile__roles" aria-label={lang === "cn" ? "身份标签" : "Roles"}>
            {copy.roles.map((role) => (
              <li key={role} className="home-profile__role">
                {role}
              </li>
            ))}
          </ul>
        </div>

        <p className="home-profile__intro">{copy.intro}</p>

        <ul
          className="home-profile__quals"
          aria-label={lang === "cn" ? "资质标签" : "Qualifications"}
        >
          {copy.qualifications.map((item) => (
            <li key={item} className="home-profile__qual">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {certificates.length > 0 && (
        <div className="home-profile__certs">
          <CertificationRack certificates={certificates} lang={lang} embedded />
        </div>
      )}
    </div>
  );
}
