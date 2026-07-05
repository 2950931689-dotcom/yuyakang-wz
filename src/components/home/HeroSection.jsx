import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHeroVideo, t } from "../../lib/content";
import Button from "../ui/Button";

const FALLBACK_CLIP = "/hero/source-clips/hero-source-echo-live.mp4";

export default function HeroSection() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const [videoSrc, setVideoSrc] = useState(FALLBACK_CLIP);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!content) return;
    setVideoSrc(getHeroVideo(content, isMobile));
    setVideoOk(true);
  }, [content, isMobile]);

  if (!content) return null;

  const hero = content.hero;
  const primaryUrl = isMobile ? hero.primaryButton.mobileUrl : hero.primaryButton.desktopUrl;

  return (
    <section className="hero hero__scanlines" id="hero">
      <div className="hero__video-wrap">
        {videoOk ? (
          <video
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={hero.posterUrl}
            onError={() => {
              if (videoSrc !== FALLBACK_CLIP) setVideoSrc(FALLBACK_CLIP);
              else setVideoOk(false);
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <div className="media-fallback" style={{ height: "100%", aspectRatio: "auto" }}>
            YU YAKANG AUDIO
          </div>
        )}
        <div className="hero__overlay" />
      </div>
      <div className="hero__content fade-in">
        <p className="hero__logo">{content.siteSettings.siteName.en}</p>
        <h1 className="hero__title">{t(hero.headline, lang)}</h1>
        <p className="hero__subtitle">{t(hero.subheadline, lang)}</p>
        <div className="hero__actions">
          <Button as="a" href={primaryUrl} target="_blank" rel="noopener noreferrer">
            {t(hero.primaryButton, lang)}
          </Button>
          <Button as={Link} to={hero.secondaryButton.url} variant="secondary">
            {t(hero.secondaryButton, lang)}
          </Button>
        </div>
      </div>
    </section>
  );
}
