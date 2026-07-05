import { useCallback, useEffect, useRef, useState } from "react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCaseCover, t } from "../../lib/content";

export default function HeroVideoCarousel({ hero, isMobile }) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const slides = (hero.slides ?? []).filter((s) => s.enabled !== false && s.video);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);

  const current = slides[index];
  const durationMs = (current?.duration ?? hero.slideDuration ?? 5) * 1000;

  const resolvePoster = useCallback(
    (slide) => {
      if (slide?.poster) return slide.poster;
      if (slide?.caseSlug && content) {
        const c = content.cases?.find((x) => x.slug === slide.caseSlug);
        if (c) return getCaseCover(c) || hero.fallbackPoster;
      }
      return isMobile ? hero.mobilePosterUrl : hero.fallbackPoster || hero.posterUrl;
    },
    [content, hero, isMobile]
  );

  const goNext = useCallback(() => {
    if (slides.length <= 1) return;
    setVisible(false);
    window.setTimeout(() => {
      setIndex((i) => {
        let next = (i + 1) % slides.length;
        let attempts = 0;
        while (attempts < slides.length) {
          if (slides[next]?.video) return next;
          next = (next + 1) % slides.length;
          attempts += 1;
        }
        return next;
      });
      setFailed(false);
      setVisible(true);
    }, 280);
  }, [slides]);

  const handleError = useCallback(() => {
    if (slides.length <= 1) {
      setFailed(true);
      return;
    }
    goNext();
  }, [slides.length, goNext]);

  useEffect(() => {
    setIndex(0);
    setFailed(false);
    setVisible(true);
  }, [slides.length, isMobile]);

  useEffect(() => {
    if (!current || failed) return undefined;
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(goNext, durationMs);
    return () => clearTimeout(timerRef.current);
  }, [current, failed, durationMs, goNext, index]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current || failed) return undefined;

    const onLoaded = () => {
      try {
        video.currentTime = current.startTime ?? 0;
        video.play().catch(() => {});
      } catch {
        /* ignore seek errors */
      }
    };

    video.addEventListener("loadeddata", onLoaded);
    return () => video.removeEventListener("loadeddata", onLoaded);
  }, [current, failed, index]);

  if (!slides.length || failed) {
    return (
      <div className="hero__poster" aria-hidden="true">
        <span className="hero__poster-grid" />
      </div>
    );
  }

  const poster = resolvePoster(current);

  return (
    <>
      <div className={`hero__carousel-video${visible ? " is-visible" : ""}`}>
        <video
          ref={videoRef}
          key={`${index}-${current.video}`}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster={poster || undefined}
          onError={handleError}
        >
          <source src={current.video} type="video/mp4" />
        </video>
      </div>
      {current.title && (
        <div className="hero__slide-label" aria-hidden="true">
          {t(current.title, lang)}
        </div>
      )}
    </>
  );
}
