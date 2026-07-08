import { useState } from "react";
import { t } from "../../lib/content";

export default function ProfileArchive({ profile, lang }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="about-section about-archive about-raw-data">
      <div className="about-raw-data__shell">
        <header className="about-raw-data__head">
          <div>
            <span className="about-archive__code">07 / RAW PROFILE DATA</span>
            <h2 className="about-archive__title">
              {lang === "cn" ? "原始档案" : "Raw Profile Data"}
            </h2>
            <p className="about-raw-data__desc">
              {lang === "cn"
                ? "以下为完整个人简介与技能归档，用于补充查看。"
                : "Full bio and skills archive for supplementary reference."}
            </p>
          </div>
          <button
            type="button"
            className="about-raw-data__toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open
              ? lang === "cn"
                ? "收起完整档案"
                : "Collapse Archive"
              : lang === "cn"
                ? "查看完整档案"
                : "View Full Archive"}
          </button>
        </header>

        {open && (
          <div className="about-raw-data__body">
            {profile.affiliation && (
              <p className="about-affiliation">{t(profile.affiliation, lang)}</p>
            )}

            <div className="prose-block">
              <h3>{lang === "cn" ? "个人简介" : "Bio"}</h3>
              <p>{t(profile.bio, lang)}</p>
            </div>

            {profile.skillGroups?.map((group) => (
              <div className="prose-block about-skills" key={group.id}>
                <h3>{t(group.title, lang)}</h3>
                <ul className="about-skills__list">
                  {group.items.map((item, i) => (
                    <li key={i}>{t(item, lang)}</li>
                  ))}
                </ul>
              </div>
            ))}

            {!profile.skillGroups?.length && profile.experience?.length > 0 && (
              <div className="prose-block">
                <h3>{lang === "cn" ? "专业经验" : "Experience"}</h3>
                {profile.experience.map((item) => (
                  <p key={item.label.cn}>
                    <strong>{t(item.label, lang)}：</strong> {t(item.value, lang)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
