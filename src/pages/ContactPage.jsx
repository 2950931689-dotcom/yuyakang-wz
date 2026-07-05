import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getDouyinUrl, isDouyinSelfLink, t } from "../lib/content";
import WechatQr from "../components/contact/WechatQr";
import Button from "../components/ui/Button";

export default function ContactPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  const ci = content.i18n.contact;
  const social = content.socialLinks;
  const douyin = getDouyinUrl(social);
  const douyinSelf = isDouyinSelfLink(douyin);

  return (
    <div className="page container fade-in">
      <h1 className="page-title">{t(ci.title, lang)}</h1>
      <p className="page-lead">{t(social.contactNote, lang)}</p>

      <div className="contact-grid">
        <div>
          <div className="prose-block">
            <h3>{content.siteSettings.siteName.en}</h3>
            <p>
              {t(content.profile.name, lang)}
              <br />
              {t(content.profile.title, lang)}
              <br />
              {t(ci.location, lang)}：{t(social.location, lang)}
            </p>
          </div>

          <div className="contact-links">
            <a href={social.wechatVideoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} strokeWidth={1.5} />
              {t(ci.wechatVideo, lang)}
            </a>
            {douyin && (
              <a href={douyin} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} strokeWidth={1.5} />
                {t(ci.douyin, lang)}
              </a>
            )}
          </div>

          {douyinSelf && (
            <div className="alert alert--warn" style={{ marginTop: 16 }}>
              {lang === "cn"
                ? "当前抖音链接可能不是公开主页链接，后续建议替换。"
                : "Current Douyin link may not be a public profile URL. Please replace with a shared profile link."}
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <Button as={Link} to="/booking">{t(ci.bookNow, lang)}</Button>
          </div>
        </div>

        <div>
          <WechatQr content={content} caption={t(ci.wechatQr, lang)} />
        </div>
      </div>
    </div>
  );
}
