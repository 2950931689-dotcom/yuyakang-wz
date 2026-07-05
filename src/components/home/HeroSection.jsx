import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHeroSlides, getHeroVideo, getSafeHero, t } from "../../lib/content";
import { splitHeroHeadline } from "../../lib/heroBoot";
import { HERO_LEAD } from "../../lib/homeContent";
import Button from "../ui/Button";
import HeroVideoCarousel from "./HeroVideoCarousel";

const FALLBACK_CLIP = "/hero/source-clips/hero-source-echo-live.mp4";

function HeroSingleVideo({ hero, isMobile, content }) {
  const [videoState, setVideoState] = useState("loading");
  const [videoSrc, setVideoSrc] = useState(FALLBACK_CLIP);

  useEffect(() => {
    if (!content) return;
    setVideoSrc(getHeroVideo(content, isMobile));
    setVideoState("loading");
  }, [content, hero, isMobile]);

  const showVideo = videoState !== "failed";

  const handleVideoError = () => {
    if (videoSrc !== FALLBACK_CLIP) {
      setVideoSrc(FALLBACK_CLIP);
      setVideoState("loading");
    } else {
      setVideoState("failed");
    }
  };

  return (
    <>
      {(videoState === "loading" || videoState === "failed") && (
        <div className="hero__poster" aria-hidden="true">
          <span className="hero__poster-grid" />
        </div>
      )}
      {showVideo && (
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={hero.posterUrl || undefined}
          onLoadedData={() => setVideoState("ready")}
          onError={handleVideoError}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </>
  );
}

export default function HeroSection() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [carouselStatus, setCarouselStatus] = useState(null);

  const handleCarouselStatus = useCallback((status) => {
    setCarouselStatus(status);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!content) return null;

  const hero = getSafeHero(content);
  const primaryUrl = isMobile ? hero.primaryButton.mobileUrl : hero.primaryButton.desktopUrl;
  const carouselSlides = getHeroSlides(content, hero);
  const useCarousel = hero.mode !== "singleVideo" && carouselSlides.length > 0;

  const nameCn = content.profile?.name ? t(content.profile.name, "cn") : "余雅康";
  const nameEnRaw = content.profile?.name ? t(content.profile.name, "en") : "YU YAKANG";
  const nameEn = nameEnRaw || "YU YAKANG";
  const heroRole =
    lang === "cn"
      ? "现场调音师 · 系统工程师 · 混音师"
      : "Live Sound Engineer · System Tuning · Mixing";

  const headline = t(hero.headline, lang);
  const titleLines = splitHeroHeadline(headline);

  return (
    <section className="hero hero__scanlines" id="hero">
      <div className="hero__video-wrap">
        {useCarousel ? (
          <HeroVideoCarousel
            hero={hero}
            isMobile={isMobile}
            onStatusChange={handleCarouselStatus}
          />
        ) : (
          <HeroSingleVideo hero={hero} isMobile={isMobile} content={content} />
        )}
        <div className="hero__overlay" />
      </div>
      <div className="hero__content hero-copy hero-boot">
        <p className="hero__logo hero-boot__eyebrow">
          <span className="hero__logo-index">01 / </span>
          {content.siteSettings.siteName.en}
        </p>
        <div className="hero-boot__scanline" aria-hidden="true" />
        <h1 className="hero__title hero-boot__title">
          {titleLines.map((line) => (
            <span key={line} className="hero-boot__title-line">
              {line}
            </span>
          ))}
        </h1>
        <div className="hero-identity hero-boot__identity">
          <div className="hero-identity__name">
            <span className="hero-identity__cn">{nameCn || "余雅康"}</span>
            <span className="hero-identity__slash" aria-hidden="true">
              /
            </span>
            <span className="hero-identity__en">{nameEn}</span>
          </div>
          <p className="hero-identity__role">{heroRole}</p>
        </div>
        <p className="hero__lead hero-boot__lead">{HERO_LEAD[lang]}</p>
        <div className="hero__actions hero-boot__actions">
          <Button as={Link} to="/cases">
            {lang === "cn" ? "查看代表案例" : "Featured Projects"}
          </Button>
          <Button as={Link} to="/booking" variant="secondary">
            {lang === "cn" ? "预约项目评估" : "Book Assessment"}
          </Button>
        </div>
        {primaryUrl && (
          <a
            className="text-link hero__video-link hero-boot__actions-link"
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {lang === "cn" ? "观看代表视频" : "Watch Reel"}
          </a>
        )}
      </div>
      {carouselStatus?.visible && (
        <div className="hero__carousel-status hero-boot__status" aria-live="polite">
          <div className="hero__carousel-status-head">
            <span className="hero__carousel-status-dot" aria-hidden="true" />
            <span className="hero__carousel-status-code">
              PROJECT {String(carouselStatus.index + 1).padStart(2, "0")} /{" "}
              {String(carouselStatus.total).padStart(2, "0")}
            </span>
            <span className="hero__carousel-status-ready">SIGNAL READY</span>
          </div>
          {carouselStatus.slideTitle && (
            <p className="hero__carousel-status-title">{carouselStatus.slideTitle}</p>
          )}
          <div className="hero__carousel-status-meta">
            <span className="hero__carousel-status-dur">
              TIME {String(carouselStatus.durationSec).padStart(2, "0")}S
            </span>
          </div>
          <div className="hero__carousel-progress" aria-hidden="true">
            <span
              className="hero__carousel-progress-fill"
              style={{ transform: `scaleX(${carouselStatus.progress})` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
