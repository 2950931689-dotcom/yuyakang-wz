import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getFeaturedVideos,
  getOfficialDouyinUrl,
  t,
} from "../../lib/content";
import ExternalLinkButton from "../ui/ExternalLinkButton";
import SectionTitle from "../ui/SectionTitle";

function buildPlatformEntries(content, lang) {
  const social = content?.socialLinks ?? {};
  const entries = [];

  const wechatUrl = String(social.wechatVideoUrl || "").trim();
  if (wechatUrl) {
    entries.push({
      id: "platform-wechat",
      platform: lang === "cn" ? "视频号" : "WeChat Channel",
      title: lang === "cn" ? "视频号主页" : "WeChat Channel Home",
      description:
        lang === "cn"
          ? "查看现场调音、系统调试、项目记录与声音相关内容。"
          : "Live sound, system tuning and project notes on WeChat Channels.",
      href: wechatUrl,
      cta: lang === "cn" ? "打开视频号主页" : "Open WeChat Channel",
    });
  }

  const douyinUrl = getOfficialDouyinUrl(social);
  if (douyinUrl) {
    entries.push({
      id: "platform-douyin",
      platform: lang === "cn" ? "抖音" : "Douyin",
      title: lang === "cn" ? "抖音主页" : "Douyin Profile",
      description:
        lang === "cn"
          ? "查看现场调音、系统调试、项目记录与声音相关内容。"
          : "Live sound, system tuning and project notes on Douyin.",
      href: douyinUrl,
      cta: lang === "cn" ? "打开抖音主页" : "Open Douyin Profile",
    });
  }

  return entries;
}

function platformLabel(platform, lang) {
  const key = String(platform || "").toLowerCase();
  if (key.includes("douyin") || key.includes("抖音")) {
    return lang === "cn" ? "抖音" : "Douyin";
  }
  if (key.includes("wechat") || key.includes("视频号")) {
    return lang === "cn" ? "视频号" : "WeChat Channel";
  }
  return t(platform, lang) || String(platform || "");
}

/**
 * Homepage 04 — platform home entries + optional manual featured videos.
 * No scraping, embeds, or fabricated links.
 */
export default function VideoHighlights() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const platforms = buildPlatformEntries(content, lang);
  const featured = getFeaturedVideos(content);

  if (!platforms.length && !featured.length) return null;

  return (
    <section
      className="section container section-reveal home-section home-section--video-highlights"
      id="video-highlights"
      aria-label={lang === "cn" ? "抖音 / 视频号" : "Social video"}
    >
      <div className="video-highlights">
        <SectionTitle
          sectionIndex={4}
          eyebrow="SOCIAL VIDEO"
          title={lang === "cn" ? "抖音 / 视频号" : "Douyin / WeChat Channel"}
          subtitle={
            lang === "cn"
              ? "通过短视频平台查看更多现场调音、系统搭建、声音调试与项目记录。"
              : "Short-form platforms for live sound, system setup and project notes."
          }
        />

        {platforms.length > 0 && (
          <ul className="video-highlights__platforms" aria-label={lang === "cn" ? "平台主页" : "Platform homes"}>
            {platforms.map((item) => (
              <li key={item.id} className="video-highlights__platform-card">
                <span className="video-highlights__platform-badge">{item.platform}</span>
                <h3 className="video-highlights__title">{item.title}</h3>
                <p className="video-highlights__desc">{item.description}</p>
                <ExternalLinkButton
                  href={item.href}
                  variant="secondary"
                  className="video-highlights__btn"
                >
                  {item.cta}
                </ExternalLinkButton>
              </li>
            ))}
          </ul>
        )}

        {featured.length > 0 && (
          <ul
            className="video-highlights__list"
            aria-label={lang === "cn" ? "精选视频" : "Featured videos"}
          >
            {featured.map((item) => {
              const href = String(item.url || "").trim();
              const cover = String(item.coverImage || "").trim();
              const title = t(item.title, lang) || (lang === "cn" ? "精选视频" : "Featured video");
              const description = t(item.description, lang);
              return (
                <li key={item.id || href} className="video-highlights__card">
                  {cover ? (
                    <div className="video-highlights__poster-wrap">
                      <img
                        src={cover}
                        alt=""
                        className="video-highlights__poster"
                        loading="lazy"
                      />
                      <span className="video-highlights__platform">
                        {platformLabel(item.platform, lang)}
                      </span>
                    </div>
                  ) : (
                    <span className="video-highlights__platform video-highlights__platform--inline">
                      {platformLabel(item.platform, lang)}
                    </span>
                  )}
                  <div className="video-highlights__body">
                    <h3 className="video-highlights__title">{title}</h3>
                    {description ? (
                      <p className="video-highlights__desc">{description}</p>
                    ) : null}
                    <ExternalLinkButton
                      href={href}
                      variant="secondary"
                      className="video-highlights__btn"
                    >
                      {lang === "cn" ? "观看" : "Watch"}
                    </ExternalLinkButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
