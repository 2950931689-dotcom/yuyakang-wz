import SectionTitle from "../ui/SectionTitle";
import { t } from "../../lib/content";
import { ENGINEER_IDENTITY_TAGLINE, ENGINEER_PARAMS } from "../../lib/aboutContent";

export default function EngineerIdentity({ profile, lang }) {
  const nameCn = t(profile?.name, "cn") || "余雅康";
  const nameEn = t(profile?.name, "en") || "Yu Yakang";
  const title = t(profile?.title, lang);
  const location = profile?.location ? t(profile.location, lang) : lang === "cn" ? "中国 / 广东" : "CHINA / GUANGDONG";
  const tagline = ENGINEER_IDENTITY_TAGLINE[lang];

  const params = [
    { key: "ID", value: ENGINEER_PARAMS.id },
    { key: "STATUS", value: ENGINEER_PARAMS.status[lang] || ENGINEER_PARAMS.status.en },
    { key: "LOCATION", value: location.toUpperCase() },
    { key: "ROLE", value: ENGINEER_PARAMS.role },
    { key: "FIELD", value: ENGINEER_PARAMS.field },
  ];

  return (
    <section className="about-section engineer-identity">
      <SectionTitle
        sectionIndex={1}
        eyebrow="ENGINEER PROFILE"
        title={lang === "cn" ? "工程师身份档案" : "Engineer Profile"}
      />

      <div className="engineer-identity__card">
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
              <span className="engineer-identity__name-en">{nameEn.toUpperCase()}</span>
            </h1>
            <p className="engineer-identity__role">
              {title || "Live Sound Engineer · System Tuning · Mixing"}
            </p>
            <p className="engineer-identity__tagline">{tagline}</p>
          </div>
        </div>

        <aside className="engineer-identity__params" aria-label={lang === "cn" ? "身份参数" : "Identity parameters"}>
          {params.map((p) => (
            <div key={p.key} className="engineer-identity__param">
              <span className="engineer-identity__param-key">{p.key}</span>
              <span className="engineer-identity__param-value">
                {p.key === "STATUS" && <span className="engineer-identity__status-dot" aria-hidden="true" />}
                {p.value}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
