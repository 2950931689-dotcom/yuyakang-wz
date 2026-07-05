import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCaseCover, getHeroSlides, t } from "../../lib/content";

const FADE_MS = 700;
const FADE_MS_REDUCED = 120;
const TICK_MS = 50;
const MIN_SLIDE_SEC = 3;
const MAX_SLIDE_SEC = 15;
const PRELOAD_AHEAD_MS = 2000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function clampSlideDurationSec(raw, heroDefault) {
  const v = Number(raw ?? heroDefault ?? 5);
  if (Number.isNaN(v)) return 5;
  return Math.min(MAX_SLIDE_SEC, Math.max(MIN_SLIDE_SEC, v));
}

function CarouselLayer({
  slide,
  poster,
  videoSrc,
  mode,
  fadeActive,
  usePosterMode,
  preload,
  onError,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !slide || usePosterMode) return undefined;

    const shouldPlay =
      mode === "solo" || mode === "fade-out" || (mode === "fade-in" && fadeActive);

    if (shouldPlay) {
      const start = () => {
        try {
          if (mode === "fade-in") video.currentTime = slide.startTime ?? 0;
          video.play().catch(() => {});
        } catch {
          /* ignore seek errors */
        }
      };
      if (video.readyState >= 2) start();
      else video.addEventListener("loadeddata", start, { once: true });
    }

    return () => {
      if (mode !== "preload") video.pause();
    };
  }, [slide, usePosterMode, mode, fadeActive, videoSrc]);

  if (!slide) return null;

  const layerClass = [
    "hero__carousel-layer",
    mode === "solo" && "is-solo",
    mode === "fade-out" && "is-fading-out",
    mode === "fade-in" && "is-fading-in",
    fadeActive && mode === "fade-out" && "is-fading-out-active",
    fadeActive && mode === "fade-in" && "is-fading-in-active",
    mode === "preload" && "is-preload",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layerClass}>
      {usePosterMode ? (
        poster ? (
          <img src={poster} alt="" className="hero__carousel-poster" />
        ) : (
          <div className="hero__poster">
            <span className="hero__poster-grid" />
          </div>
        )
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          preload={preload}
          poster={poster || undefined}
          onError={onError}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

export default function HeroVideoCarousel({ hero: heroProp, isMobile }) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const reducedMotion = usePrefersReducedMotion();

  const hero = heroProp ?? {};
  const slides = useMemo(() => getHeroSlides(content, hero), [content, hero]);
  const usePosterMode = isMobile;

  const [index, setIndex] = useState(0);
  const [crossfade, setCrossfade] = useState(null);
  const [preloadNext, setPreloadNext] = useState(null);
  const [failedIndices, setFailedIndices] = useState(() => new Set());
  const [allFailed, setAllFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  const fadeMs = reducedMotion ? FADE_MS_REDUCED : FADE_MS;
  const playTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const progressRef = useRef(null);
  const slideStartRef = useRef(0);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const current = slides[index] ?? null;
  const durationSec = clampSlideDurationSec(current?.duration, hero.slideDuration);
  const durationMs = durationSec * 1000;
  const total = slides.length;

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

  const getVideoSrc = useCallback(
    (slide) => {
      if (!slide) return "";
      return isMobile && slide.mobileVideo ? slide.mobileVideo : slide.video;
    },
    [isMobile]
  );

  const findNextIndex = useCallback((from, failedSet) => {
    const list = slidesRef.current;
    if (!list.length) return from;
    let next = (from + 1) % list.length;
    let attempts = 0;
    while (attempts < list.length) {
      if (!failedSet.has(next) && list[next]?.video) return next;
      next = (next + 1) % list.length;
      attempts += 1;
    }
    return from;
  }, []);

  const beginCrossfade = useCallback(
    (nextIndex) => {
      if (crossfade || nextIndex === index) return;

      setCrossfade({ from: index, to: nextIndex, active: false });
      setPreloadNext(null);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setCrossfade({ from: index, to: nextIndex, active: true });
        });
      });

      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = window.setTimeout(() => {
        setIndex(nextIndex);
        setCrossfade(null);
        setProgress(0);
        slideStartRef.current = Date.now();
      }, fadeMs);
    },
    [crossfade, fadeMs, index]
  );

  const goNext = useCallback(() => {
    const list = slidesRef.current;
    if (list.length <= 1) return;
    const next = findNextIndex(index, failedIndices);
    if (failedIndices.has(next) && failedIndices.size >= list.length) {
      setAllFailed(true);
      return;
    }
    beginCrossfade(next);
  }, [beginCrossfade, failedIndices, findNextIndex, index]);

  const handleVideoError = useCallback(
    (slideIdx) => {
      const list = slidesRef.current;
      const nextFailed = new Set(failedIndices);
      nextFailed.add(slideIdx);

      if (nextFailed.size >= list.length) {
        setFailedIndices(nextFailed);
        setAllFailed(true);
        return;
      }

      setFailedIndices(nextFailed);
      const next = findNextIndex(slideIdx, nextFailed);
      if (next !== slideIdx) {
        if (crossfade) {
          window.clearTimeout(fadeTimerRef.current);
          setCrossfade(null);
        }
        beginCrossfade(next);
      } else {
        setAllFailed(true);
      }
    },
    [beginCrossfade, crossfade, failedIndices, findNextIndex]
  );

  useEffect(() => {
    setIndex(0);
    setCrossfade(null);
    setPreloadNext(null);
    setFailedIndices(new Set());
    setAllFailed(false);
    setProgress(0);
    slideStartRef.current = Date.now();
  }, [slides.length, isMobile]);

  useEffect(() => {
    if (!current || allFailed) return undefined;

    window.clearTimeout(playTimerRef.current);
    slideStartRef.current = Date.now();
    setProgress(0);

    const list = slidesRef.current;
    const nextIdx = list.length > 1 ? findNextIndex(index, failedIndices) : null;
    const playMs = Math.max(0, durationMs - fadeMs);

    progressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - slideStartRef.current;
      setProgress(Math.min(1, elapsed / durationMs));
    }, TICK_MS);

    const preloadTimer =
      nextIdx != null && !reducedMotion
        ? window.setTimeout(() => setPreloadNext(nextIdx), Math.max(0, playMs - PRELOAD_AHEAD_MS))
        : null;

    playTimerRef.current = window.setTimeout(() => {
      if (list.length <= 1) return;
      goNext();
    }, playMs);

    return () => {
      window.clearTimeout(playTimerRef.current);
      window.clearTimeout(preloadTimer);
      window.clearInterval(progressRef.current);
    };
  }, [
    allFailed,
    current,
    durationMs,
    fadeMs,
    failedIndices,
    findNextIndex,
    goNext,
    index,
    reducedMotion,
  ]);

  useEffect(
    () => () => {
      window.clearTimeout(playTimerRef.current);
      window.clearTimeout(fadeTimerRef.current);
      window.clearInterval(progressRef.current);
    },
    []
  );

  if (!slides.length || allFailed) {
    return (
      <div className="hero__poster" aria-hidden="true">
        <span className="hero__poster-grid" />
      </div>
    );
  }

  const padIndex = (i) => String(i + 1).padStart(2, "0");
  const padTotal = String(total).padStart(2, "0");
  const statusIndex = crossfade?.from ?? index;
  const statusSlide = slides[statusIndex];
  const slideTitle = statusSlide?.title ? t(statusSlide.title, lang) : "";
  const statusDurationSec = clampSlideDurationSec(
    statusSlide?.duration,
    hero.slideDuration
  );

  const currentSlide = slides[index];

  return (
    <>
      <div className="hero__carousel-stack">
        {!crossfade && (
          <CarouselLayer
            slide={currentSlide}
            poster={resolvePoster(currentSlide)}
            videoSrc={getVideoSrc(currentSlide)}
            mode="solo"
            usePosterMode={usePosterMode}
            preload="auto"
            onError={() => handleVideoError(index)}
          />
        )}

        {crossfade && (
          <>
            <CarouselLayer
              slide={slides[crossfade.from]}
              poster={resolvePoster(slides[crossfade.from])}
              videoSrc={getVideoSrc(slides[crossfade.from])}
              mode="fade-out"
              fadeActive={crossfade.active}
              usePosterMode={usePosterMode}
              preload="auto"
              onError={() => handleVideoError(crossfade.from)}
            />
            <CarouselLayer
              slide={slides[crossfade.to]}
              poster={resolvePoster(slides[crossfade.to])}
              videoSrc={getVideoSrc(slides[crossfade.to])}
              mode="fade-in"
              fadeActive={crossfade.active}
              usePosterMode={usePosterMode}
              preload="metadata"
              onError={() => handleVideoError(crossfade.to)}
            />
          </>
        )}

        {!crossfade && preloadNext != null && preloadNext !== index && (
          <CarouselLayer
            slide={slides[preloadNext]}
            poster={resolvePoster(slides[preloadNext])}
            videoSrc={getVideoSrc(slides[preloadNext])}
            mode="preload"
            usePosterMode={usePosterMode}
            preload="metadata"
            onError={() => {}}
          />
        )}
      </div>

      <div className="hero__carousel-status" aria-live="polite">
        <div className="hero__carousel-status-row">
          <span className="hero__carousel-status-code">
            PROJECT {padIndex(statusIndex)} / {padTotal}
          </span>
          {slideTitle && (
            <span className="hero__carousel-status-title">{slideTitle}</span>
          )}
          <span className="hero__carousel-status-dur">{statusDurationSec}s</span>
        </div>
        <div className="hero__carousel-progress" aria-hidden="true">
          <span
            className="hero__carousel-progress-fill"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>
    </>
  );
}
