import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getProfileIdentity } from "../../lib/cmsBinding";
import { getVisibleCertificates, getSiteDisplayName } from "../../lib/content";
import {
  HOME_PROFILE_INTRO,
  HOME_PROFILE_QUALIFICATIONS,
  HOME_PROFILE_ROLES,
  HOME_PROFILE_SUBTITLE,
} from "../../lib/homeContent";
import CertificationRack from "../about/CertificationRack";
import SectionTitle from "../ui/SectionTitle";

/**
 * Homepage 01 — short personal intro + certificate rack (PC & mobile).
 * Replaces CredentialsSection + HomeMobileCertificates to avoid duplicate modules.
 */
export default function HomeProfileSection() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const identity = getProfileIdentity(content, lang);
  const nameCn = identity.nameCn || "余雅康";
  const brandEn = getSiteDisplayName(content, "en") || "YU YAKANG AUDIO";
  const roles = HOME_PROFILE_ROLES[lang] || HOME_PROFILE_ROLES.cn;
  const qualifications = HOME_PROFILE_QUALIFICATIONS[lang] || HOME_PROFILE_QUALIFICATIONS.cn;
  const intro = HOME_PROFILE_INTRO[lang] || HOME_PROFILE_INTRO.cn;
  const certificates = getVisibleCertificates(content);

  return (
    <div className="home-profile">
      <SectionTitle
        sectionIndex={1}
        eyebrow="ENGINEER PROFILE"
        title={lang === "cn" ? "个人介绍" : "Engineer Profile"}
        subtitle={HOME_PROFILE_SUBTITLE[lang]}
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
            {roles.map((role) => (
              <li key={role} className="home-profile__role">
                {role}
              </li>
            ))}
          </ul>
        </div>

        <p className="home-profile__intro">{intro}</p>

        <ul
          className="home-profile__quals"
          aria-label={lang === "cn" ? "资质标签" : "Qualifications"}
        >
          {qualifications.map((item) => (
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
