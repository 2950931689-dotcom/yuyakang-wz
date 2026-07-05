import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getVisibleCertificates, t } from "../lib/content";
import EmptyState from "../components/ui/EmptyState";

export default function AboutPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  const certs = getVisibleCertificates(content);
  const workPhotos = [1, 2, 3, 4, 5, 6].map((n) => `/images/about/work-${String(n).padStart(2, "0")}.jpg`);

  return (
    <div className="page container fade-in">
      <h1 className="page-title">{t(content.profile.name, lang)}</h1>
      <p className="page-lead">{t(content.profile.title, lang)}</p>

      <div className="prose-block">
        <h3>{lang === "cn" ? "个人简介" : "Bio"}</h3>
        <p>{t(content.profile.bio, lang)}</p>
      </div>

      <div className="prose-block">
        <h3>{lang === "cn" ? "专业经验" : "Experience"}</h3>
        {content.profile.experience.map((item) => (
          <p key={item.label.cn}>
            <strong>{t(item.label, lang)}：</strong> {t(item.value, lang)}
          </p>
        ))}
      </div>

      <div className="prose-block">
        <h3>{lang === "cn" ? "软件 / 设备能力" : "Tools & Software"}</h3>
        {content.profile.tools.map((item) => (
          <p key={item.label.cn}>
            <strong>{t(item.label, lang)}：</strong> {t(item.value, lang)}
          </p>
        ))}
      </div>

      <div className="prose-block">
        <h3>{lang === "cn" ? "证书" : "Certificates"}</h3>
        <div className="case-gallery">
          {certs.map((c) => (
            <figure key={c.id}>
              <img src={c.imageUrl} alt={t(c.title, lang)} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>

      <div className="prose-block">
        <h3>{lang === "cn" ? "工作照" : "On Site"}</h3>
        <div className="case-gallery">
          {workPhotos.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
          ))}
        </div>
      </div>
    </div>
  );
}
