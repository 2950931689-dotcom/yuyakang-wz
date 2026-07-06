import SectionTitle from "../ui/SectionTitle";
import { getProfileIdentity } from "../../lib/cmsBinding";

export default function EngineerIdentity({ content, profile, lang }) {
  const identity = getProfileIdentity(content ?? { profile }, lang);
  const { nameCn, nameEn, title, tagline, location, status, field, engineerId } = identity;

  const params = [
    { key: "ID", value: engineerId },
    { key: "STATUS", value: status },
    { key: "LOCATION", value: location.toUpperCase() },
    { key: "ROLE", value: profile?.roleCode || "SYSTEM ENGINEER" },
    { key: "FIELD", value: field },
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
              <span className="engineer-identity__name-en">{nameEn}</span>
            </h1>
            <p className="engineer-identity__role">
              {title || identity.role}
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
