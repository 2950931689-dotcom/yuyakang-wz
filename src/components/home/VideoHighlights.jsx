import { useCallback, useMemo, useRef, useState } from "react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeSection } from "../../lib/cmsBinding";
import {
  getDouyinUrl,
  getFeaturedVideos,
  t,
} from "../../lib/content";
import { resolveUploadUrl } from "../../lib/api";
import { MOTION, openExternalAfterLaunch, prefersReducedMotion } from "../../lib/motion";
import ExternalLinkButton from "../ui/ExternalLinkButton";
import Reveal from "../ui/Reveal";
import SectionTitle from "../ui/SectionTitle";

/** Preview framework — mix of photo / video card shells until CMS is filled. */
const PREVIEW_COVER_FRAMEWORK = [
  { id: "preview-01", mediaType: "image", title: { cn: "照片卡片 01", en: "Photo 01" }, index: "01" },
  { id: "preview-02", mediaType: "video", title: { cn: "视频卡片 02", en: "Video 02" }, index: "02" },
  { id: "preview-03", mediaType: "image", title: { cn: "照片卡片 03", en: "Photo 03" }, index: "03" },
  { id: "preview-04", mediaType: "video", title: { cn: "视频卡片 04", en: "Video 04" }, index: "04" },
  { id: "preview-05", mediaType: "image", title: { cn: "照片卡片 05", en: "Photo 05" }, index: "05" },
  { id: "preview-06", mediaType: "video", title: { cn: "视频卡片 06", en: "Video 06" }, index: "06" },
];

function buildPlatformEntries(content, lang, section) {
  const social = content?.socialLinks ?? {};
  const wechatCopy = section.wechat ?? {};
  const douyinCopy = section.douyin ?? {};

  return [
    {
      id: "platform-douyin",
      platform: t(douyinCopy.platform, lang) || (lang === "cn" ? "抖音" : "Douyin"),
      title: t(douyinCopy.title, lang) || (lang === "cn" ? "抖音主页" : "Douyin Profile"),
      description:
        t(douyinCopy.description, lang) ||
        (lang === "cn"
          ? "查看现场调音、系统调试、项目记录与声音相关内容。"
          : "Live sound, system tuning and project notes on Douyin."),
      href: String(getDouyinUrl(social) || "").trim(),
      cta: t(douyinCopy.cta, lang) || (lang === "cn" ? "打开抖音主页" : "Open Douyin Profile"),
    },
    {
      id: "platform-wechat",
      platform: t(wechatCopy.platform, lang) || (lang === "cn" ? "视频号" : "WeChat Channel"),
      title: t(wechatCopy.title, lang) || (lang === "cn" ? "视频号主页" : "WeChat Channel Home"),
      description:
        t(wechatCopy.description, lang) ||
        (lang === "cn"
          ? "查看现场调音、系统调试、项目记录与声音相关内容。"
          : "Live sound, system tuning and project notes on WeChat Channels."),
      href: String(social.wechatVideoUrl || "").trim(),
      cta: t(wechatCopy.cta, lang) || (lang === "cn" ? "打开视频号主页" : "Open WeChat Channel"),
    },
  ];
}

function mediaSrc(url) {
  if (!url) return "";
  return url.startsWith("/uploads/") ? resolveUploadUrl(url) : url;
}

function getCoverVideos(content) {
  return getFeaturedVideos(content).filter((item) => {
    const hasImage = Boolean(String(item.coverImage || "").trim());
    const hasVideo = Boolean(String(item.previewVideo || "").trim());
    return hasImage || hasVideo;
  });
}

function resolveMediaType(item) {
  if (item.mediaType === "video" || item.mediaType === "image") return item.mediaType;
  if (String(item.previewVideo || "").trim()) return "video";
  return "image";
}

function buildMarqueeTrack(items) {
  if (!items.length) return [];
  let unit = [...items];
  while (unit.length < 6) {
    unit = unit.concat(items);
  }
  return [
    ...unit.map((item, i) => ({ ...item, _key: `a-${i}-${item.id || item.url || i}` })),
    ...unit.map((item, i) => ({ ...item, _key: `b-${i}-${item.id || item.url || i}` })),
  ];
}

function CoverCardMedia({ item, title, isPreview, registerVideo }) {
  const videoRef = useRef(null);
  const mediaType = resolveMediaType(item);
  const cover = mediaSrc(String(item.coverImage || "").trim());
  const previewVideo = mediaSrc(String(item.previewVideo || "").trim());
  const indexLabel = item.index || "";

  const setVideoEl = (el) => {
    videoRef.current = el;
    registerVideo?.(el);
  };

  const playPreview = () => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
  };

  const pausePreview = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  };

  if (isPreview || (!cover && !previewVideo)) {
    return (
      <div
        className={`video-cover-marquee__placeholder video-cover-marquee__placeholder--${mediaType}`}
        aria-hidden="true"
      >
        <span className="video-cover-marquee__placeholder-code">{indexLabel || "CARD"}</span>
        <span className="video-cover-marquee__placeholder-mark">
          {mediaType === "video" ? "VIDEO" : "PHOTO"}
        </span>
      </div>
    );
  }

  if (mediaType === "video" && previewVideo) {
    return (
      <div
        className="video-cover-marquee__media"
        onMouseEnter={playPreview}
        onMouseLeave={pausePreview}
        onFocus={playPreview}
        onBlur={pausePreview}
      >
        <video
          ref={setVideoEl}
          className="video-cover-marquee__video"
          src={previewVideo}
          poster={cover || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={title}
        />
        <span className="video-cover-marquee__badge" aria-hidden="true">
          VIDEO
        </span>
      </div>
    );
  }

  return (
    <div className="video-cover-marquee__media">
      <img
        src={cover || previewVideo}
        alt={title}
        className="video-cover-marquee__img"
        loading="lazy"
        draggable={false}
      />
      <span className="video-cover-marquee__badge video-cover-marquee__badge--photo" aria-hidden="true">
        PHOTO
      </span>
    </div>
  );
}

function CoverMarquee({ items, lang, isPreview }) {
  const track = useMemo(() => buildMarqueeTrack(items), [items]);
  const [launchingKey, setLaunchingKey] = useState(null);
  const videoRefs = useRef(new Map());

  const stopPreviewOnCard = useCallback((key) => {
    const el = videoRefs.current.get(key);
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
  }, []);

  const handleCoverOpen = useCallback(
    (event, href, key) => {
      event.preventDefault();
      if (!href || launchingKey) return;
      stopPreviewOnCard(key);
      setLaunchingKey(key);
      const delay = prefersReducedMotion() ? 0 : MOTION.launchMs;
      openExternalAfterLaunch(href, { delayMs: delay }).finally(() => {
        setLaunchingKey(null);
      });
    },
    [launchingKey, stopPreviewOnCard]
  );

  if (!track.length) return null;

  const durationSec = Math.max(32, Math.max(items.length, 6) * 6);
  const locked = Boolean(launchingKey);

  return (
    <div
      className={[
        "video-cover-marquee",
        isPreview && "video-cover-marquee--preview",
        locked && "video-cover-marquee--locked",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        isPreview
          ? lang === "cn"
            ? "封面滚动预览框架"
            : "Cover marquee preview framework"
          : lang === "cn"
            ? "抖音视频封面"
            : "Douyin video covers"
      }
    >
      <div
        className="video-cover-marquee__viewport"
        style={{ "--marquee-duration": `${durationSec}s` }}
      >
        <ul className="video-cover-marquee__track">
          {track.map((item) => {
            const href = String(item.url || "").trim();
            const title =
              t(item.title, lang) ||
              (lang === "cn" ? "抖音视频" : "Douyin video");

            const cardInner = (
              <>
                <CoverCardMedia
                  item={item}
                  title={title}
                  isPreview={isPreview}
                  registerVideo={(el) => {
                    if (el) videoRefs.current.set(item._key, el);
                    else videoRefs.current.delete(item._key);
                  }}
                />
                <span className="video-cover-marquee__shade" aria-hidden="true" />
                <span className="video-cover-marquee__label">{title}</span>
              </>
            );

            return (
              <li key={item._key} className="video-cover-marquee__item">
                {href && !isPreview ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "video-cover-marquee__link",
                      launchingKey === item._key && "is-launching",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    title={title}
                    onClick={(e) => handleCoverOpen(e, href, item._key)}
                  >
                    {cardInner}
                  </a>
                ) : (
                  <div className="video-cover-marquee__link video-cover-marquee__link--static">
                    {cardInner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {isPreview && (
        <p className="video-cover-marquee__preview-note">
          {lang === "cn"
            ? "预览框架 · 支持照片 / 视频卡片 · 后台可上传替换"
            : "Preview · Photo / video cards · Replace in admin"}
        </p>
      )}
    </div>
  );
}

/**
 * Homepage 04: cover marquee (photo or video preview) + platform text cards.
 */
export default function VideoHighlights() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [launchingPlatform, setLaunchingPlatform] = useState(null);

  if (!content) return null;

  const section = getHomeSection(content, "videoHighlights");
  const platforms = buildPlatformEntries(content, lang, section);
  const realCovers = getCoverVideos(content);
  const isPreview = realCovers.length === 0;
  const covers = isPreview ? PREVIEW_COVER_FRAMEWORK : realCovers;

  const handlePlatformOpen = (event, href, id) => {
    if (!href?.trim() || launchingPlatform) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    setLaunchingPlatform(id);
    const delay = prefersReducedMotion() ? 0 : MOTION.launchMs;
    openExternalAfterLaunch(href, { delayMs: delay }).finally(() => {
      setLaunchingPlatform(null);
    });
  };

  return (
    <Reveal
      as="section"
      className="section container home-section home-section--video-highlights"
      id="video-highlights"
      delay={40}
      aria-label={t(section.title, lang) || (lang === "cn" ? "抖音 / 视频号" : "Social video")}
    >
      <div className="video-highlights">
        <SectionTitle
          sectionIndex={4}
          eyebrow={t(section.eyebrow, lang) || "SOCIAL VIDEO"}
          title={t(section.title, lang)}
          subtitle={t(section.subtitle, lang)}
        />

        <div className="video-highlights__marquee-zone">
          <CoverMarquee items={covers} lang={lang} isPreview={isPreview} />
        </div>

        <div className="video-highlights__platform-zone">
          <ul
            className="video-highlights__platforms"
            aria-label={lang === "cn" ? "平台主页" : "Platform homes"}
          >
            {platforms.map((item) => (
              <li
                key={item.id}
                className={[
                  "video-highlights__platform-card",
                  launchingPlatform === item.id && "is-launching",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="video-highlights__platform-badge">{item.platform}</span>
                <h3 className="video-highlights__title">{item.title}</h3>
                <p className="video-highlights__desc">{item.description}</p>
                <ExternalLinkButton
                  href={item.href}
                  variant="secondary"
                  className="video-highlights__btn"
                  onClick={(e) => handlePlatformOpen(e, item.href, item.id)}
                >
                  {item.cta}
                </ExternalLinkButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
