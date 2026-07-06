import { useState } from "react";
import { t } from "../../lib/content";
import CertificateGallery from "./CertificateGallery";
import MediaFallback from "../ui/MediaFallback";

export default function ProfileArchive({
  profile,
  certs,
  workPhotos,
  workItems,
  lang,
  openLightbox,
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="about-section about-archive about-raw-data">
      <div className="about-raw-data__shell">
        <header className="about-raw-data__head">
          <div>
            <span className="about-archive__code">RAW PROFILE DATA</span>
            <h2 className="about-archive__title">
              {lang === "cn" ? "原始档案" : "Raw Profile Data"}
            </h2>
            <p className="about-raw-data__desc">
              {lang === "cn"
                ? "以下为完整个人简介、证书与工作照归档，用于补充查看。"
                : "Full bio, certificates and on-site photos for supplementary reference."}
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

            <div className="prose-block">
              <h3>{lang === "cn" ? "证书" : "Certificates"}</h3>
              {certs.length ? (
                <CertificateGallery certificates={certs} />
              ) : (
                <MediaFallback label={lang === "cn" ? "暂无证书" : "No certificates"} compact />
              )}
            </div>

            <div className="prose-block">
              <h3>{lang === "cn" ? "工作照" : "On Site"}</h3>
              {workPhotos.length ? (
                <div className="case-gallery">
                  {workPhotos.map((p, i) => (
                    <button
                      key={p.id || p.imageUrl}
                      type="button"
                      className="case-gallery__item"
                      onClick={() => openLightbox(workItems, i)}
                      aria-label={t(p.title, lang)}
                    >
                      <img src={p.imageUrl} alt={t(p.title, lang)} loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : (
                <MediaFallback label={lang === "cn" ? "暂无工作照" : "No work photos"} compact />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
