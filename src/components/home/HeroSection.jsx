import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHeroVideo, getSafeHero, t } from "../../lib/content";
import Button from "../ui/Button";
import ExternalLinkButton from "../ui/ExternalLinkButton";
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
  const useCarousel = hero.mode === "caseVideoCarousel" && hero.slides?.length;

  return (
    <section className="hero hero__scanlines" id="hero">
      <div className="hero__video-wrap">
        {useCarousel ? (
          <HeroVideoCarousel hero={hero} isMobile={isMobile} />
        ) : (
          <HeroSingleVideo hero={hero} isMobile={isMobile} content={content} />
        )}
        <div className="hero__overlay" />
      </div>
      <div className="hero__content fade-in">
        <p className="hero__logo">{content.siteSettings.siteName.en}</p>
        <h1 className="hero__title">{t(hero.headline, lang)}</h1>
        <p className="hero__subtitle">{t(hero.subheadline, lang)}</p>
        <div className="hero__actions">
          <ExternalLinkButton href={primaryUrl}>
            {t(hero.primaryButton, lang)}
          </ExternalLinkButton>
          <Button as={Link} to={hero.secondaryButton.url} variant="secondary">
            {t(hero.secondaryButton, lang)}
          </Button>
        </div>
      </div>
    </section>
  );
}
