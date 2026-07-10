import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getDouyinUrl, isDouyinSelfLink, t } from "../../lib/content";
import ExternalLinkButton from "../ui/ExternalLinkButton";
import SectionTitle from "../ui/SectionTitle";

function buildHighlightItems(content, lang) {
  const social = content?.socialLinks ?? {};
  const ci = content?.i18n?.contact ?? {};
  const poster =
    social.wechatQrImage ||
    content?.siteSettings?.wechatQrUrl ||
    "/images/wechat-qr.jpg";
  const items = [];

  if (social.wechatVideoUrl?.trim()) {
    items.push({
      id: "wechat-video",
      platform: lang === "cn" ? "视频号" : "WeChat Channel",
      title: t(ci.wechatVideo, lang) || (lang === "cn" ? "微信视频号" : "WeChat Channel"),
      description:
        lang === "cn"
          ? "现场调音与系统记录片段，了解项目风格与交付方式。"
          : "Field sound and system clips — project style and delivery approach.",
      href: social.wechatVideoUrl.trim(),
      poster,
    });
  }

  const douyin = getDouyinUrl(social);
  if (douyin?.trim() && !isDouyinSelfLink(douyin)) {
    items.push({
      id: "douyin",
      platform: lang === "cn" ? "抖音" : "Douyin",
      title: t(ci.douyin, lang) || (lang === "cn" ? "抖音主页" : "Douyin Profile"),
      description:
        lang === "cn"
          ? "演出现场与系统调试相关短视频记录。"
          : "Short clips from live shows and system tuning sessions.",
      href: douyin.trim(),
      poster,
    });
  }

  return items;
}

export default function VideoHighlights() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const items = buildHighlightItems(content, lang);
  if (!items.length) return null;

  return (
    <section
      className="section container section-reveal home-section home-section--video-highlights mobile-only-block"
      id="video-highlights"
      aria-label={lang === "cn" ? "精选视频" : "Video highlights"}
    >
      <div className="video-highlights">
      <SectionTitle
        sectionIndex={4}
        eyebrow="VIDEO HIGHLIGHTS"
        title={lang === "cn" ? "精选视频" : "Video Highlights"}
        subtitle={
          lang === "cn"
            ? "视频号与抖音外链 — 点击在新窗口观看，不占用首页加载。"
            : "WeChat Channel & Douyin links — open in a new tab without heavy homepage embeds."
        }
      />
      <ul className="video-highlights__list">
        {items.map((item) => (
          <li key={item.id} className="video-highlights__card">
            <div className="video-highlights__poster-wrap">
              <img
                src={item.poster}
                alt=""
                className="video-highlights__poster"
                loading="lazy"
              />
              <span className="video-highlights__platform">{item.platform}</span>
            </div>
            <div className="video-highlights__body">
              <h3 className="video-highlights__title">{item.title}</h3>
              <p className="video-highlights__desc">{item.description}</p>
              <ExternalLinkButton
                href={item.href}
                variant="secondary"
                className="video-highlights__btn"
              >
                {lang === "cn" ? "点击观看" : "Watch"}
              </ExternalLinkButton>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
