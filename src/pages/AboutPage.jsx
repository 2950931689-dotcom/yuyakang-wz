import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getVisibleCertificates, getWorkPhotos, t } from "../lib/content";
import { buildWorkPhotoItems } from "../lib/media";
import { useMediaLightbox } from "../context/MediaLightboxContext";
import CertificateGallery from "../components/about/CertificateGallery";
import EngineerIdentity from "../components/about/EngineerIdentity";
import SignalIdentity from "../components/about/SignalIdentity";
import ControlSurface from "../components/about/ControlSurface";
import ExperienceTimeline from "../components/about/ExperienceTimeline";
import ToolRack from "../components/about/ToolRack";
import WorkPhilosophy from "../components/about/WorkPhilosophy";
import AboutCTA from "../components/about/AboutCTA";
import LoadingState from "../components/ui/LoadingState";
import MediaFallback from "../components/ui/MediaFallback";

export default function AboutPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const { openLightbox } = useMediaLightbox();

  if (loading || !content) return <LoadingState />;

  const profile = content.profile ?? {
    name: { cn: "余雅康", en: "Yu Yakang" },
    title: { cn: "", en: "" },
    bio: { cn: "", en: "" },
  };
  const certs = getVisibleCertificates(content);
  const workPhotos = getWorkPhotos(content);
  const workItems = buildWorkPhotoItems(workPhotos, lang);

  return (
    <div className="page about-page fade-in">
      <div className="about-page__inner container">
        <EngineerIdentity profile={profile} lang={lang} />
        <SignalIdentity lang={lang} />
        <ControlSurface lang={lang} />
        <ExperienceTimeline profile={profile} lang={lang} />
        <ToolRack certificates={certs} profile={profile} lang={lang} />
        <WorkPhilosophy lang={lang} />
        <AboutCTA />

        <section className="about-section about-archive" aria-label={lang === "cn" ? "档案资料" : "Archive"}>
          <header className="about-archive__head">
            <span className="about-archive__code">PROFILE ARCHIVE</span>
            <h2 className="about-archive__title">
              {lang === "cn" ? "个人档案资料" : "Profile Archive"}
            </h2>
          </header>

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
        </section>
      </div>
    </div>
  );
}
