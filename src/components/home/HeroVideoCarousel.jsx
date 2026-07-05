import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCaseCover, getHeroSlides, t } from "../../lib/content";

const MIN_SLIDE_SEC = 3;
const MAX_SLIDE_SEC = 15;
const DEFAULT_DURATION = 8;
const SWITCH_COOLDOWN_MS = 120;

function clampSlideDurationSec(raw, heroDefault) {
  const v = Number(raw ?? heroDefault ?? DEFAULT_DURATION);
  if (Number.isNaN(v)) return DEFAULT_DURATION;
  return Math.min(MAX_SLIDE_SEC, Math.max(MIN_SLIDE_SEC, v));
}

export default function HeroVideoCarousel({ hero: heroProp, isMobile, onStatusChange }) {
  const { content } = useContent();
  const { lang } = useLanguage();

  const heroMode = heroProp?.mode;
  const heroSlideDuration = heroProp?.slideDuration ?? DEFAULT_DURATION;

  const slides = useMemo(
    () => getHeroSlides(content, heroProp ?? {}),
    [content, heroMode, heroSlideDuration]
  );

  const slidesKey = useMemo(
    () => slides.map((s) => `${s.caseSlug}:${s.video}:${s.duration}:${s.sortOrder}`).join("|"),
    [slides]
  );

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug("[HeroCarousel] slides", slides.length, slides.map((s) => s.title));
    }
  }, [slides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState(() => new Set());
  const [allFailed, setAllFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileVideoFailed, setMobileVideoFailed] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const progressStartRef = useRef(0);
  const effectiveDurationSecRef = useRef(DEFAULT_DURATION);
  const isSwitchingRef = useRef(false);
  const slidesRef = useRef(slides);
  const failedRef = useRef(failedIndices);
  const activeIndexRef = useRef(0);
  const heroSlideDurationRef = useRef(heroSlideDuration);

  slidesRef.current = slides;
  failedRef.current = failedIndices;
  activeIndexRef.current = activeIndex;
  heroSlideDurationRef.current = heroSlideDuration;

  const current = slides[activeIndex] ?? null;
  const durationSec = clampSlideDurationSec(current?.duration, heroSlideDuration);
  const total = slides.length;

  const resolvePoster = useCallback(
    (slide) => {
      if (slide?.poster) return slide.poster;
      if (slide?.caseSlug && content) {
        const c = content.cases?.find((x) => x.slug === slide.caseSlug);
        if (c) return getCaseCover(c) || heroProp?.fallbackPoster;
      }
      return isMobile
        ? heroProp?.mobilePosterUrl
        : heroProp?.fallbackPoster || heroProp?.posterUrl;
    },
    [content, heroProp, isMobile]
  );

  const getVideoSrc = useCallback(
    (slide) => {
      if (!slide) return "";
      return isMobile && slide.mobileVideo ? slide.mobileVideo : slide.video;
    },
    [isMobile]
  );

  const getDurationSecForIndex = useCallback((index) => {
    const slide = slidesRef.current[index];
    return clampSlideDurationSec(slide?.duration, heroSlideDurationRef.current);
  }, []);

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

  const clearSlideTimers = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const scheduleDurationTimer = useCallback(
    (durationMs) => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        goToNextSlideRef.current("timer");
      }, durationMs);
    },
    []
  );

  const goToNextSlideRef = useRef(() => {});

  const goToNextSlide = useCallback(
    (reason) => {
      if (isSwitchingRef.current) return;

      const list = slidesRef.current;
      if (!list.length) return;

      if (list.length === 1) {
        clearSlideTimers();
        setProgress(0);
        progressStartRef.current = performance.now();
        const video = videoRef.current;
        const slide = list[0];
        if (video) {
          try {
            video.currentTime = slide?.startTime ?? 0;
          } catch {
            /* ignore */
          }
          video.play().catch(() => {});
        }
        const maxSec = getDurationSecForIndex(0);
        effectiveDurationSecRef.current = maxSec;
        scheduleDurationTimer(maxSec * 1000);
        startProgressLoopRef.current();
        return;
      }

      isSwitchingRef.current = true;
      clearSlideTimers();

      const from = activeIndexRef.current;
      const failedSet = failedRef.current;
      const next = findNextIndex(from, failedSet);

      if (import.meta.env.DEV) {
        console.debug("[HeroCarousel] switch", reason, from, "->", next);
      }

      if (failedSet.has(next) && failedSet.size >= list.length) {
        setAllFailed(true);
        window.setTimeout(() => {
          isSwitchingRef.current = false;
        }, SWITCH_COOLDOWN_MS);
        return;
      }

      setProgress(0);
      setActiveIndex(next);
      activeIndexRef.current = next;

      window.setTimeout(() => {
        isSwitchingRef.current = false;
      }, SWITCH_COOLDOWN_MS);
    },
    [clearSlideTimers, findNextIndex, getDurationSecForIndex, scheduleDurationTimer]
  );

  goToNextSlideRef.current = goToNextSlide;

  const startProgressLoopRef = useRef(() => {});

  const startProgressLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    const tick = () => {
      const index = activeIndexRef.current;
      const maxSec = effectiveDurationSecRef.current;
      const maxMs = maxSec * 1000;
      const slide = slidesRef.current[index];
      const startTime = slide?.startTime ?? 0;
      const video = videoRef.current;

      let nextProgress = 0;

      if (video && Number.isFinite(video.duration) && video.duration > 0 && !video.error) {
        const playable = Math.max(0.01, video.duration - startTime);
        const effectiveSec = Math.min(playable, getDurationSecForIndex(index));
        const currentOffset = Math.max(0, video.currentTime - startTime);
        nextProgress = Math.min(1, currentOffset / effectiveSec);
      } else {
        const elapsed = performance.now() - progressStartRef.current;
        nextProgress = Math.min(1, elapsed / maxMs);
      }

      setProgress(nextProgress);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [getDurationSecForIndex]);

  startProgressLoopRef.current = startProgressLoop;

  const startSlidePlayback = useCallback(() => {
    const index = activeIndexRef.current;
    const maxSec = getDurationSecForIndex(index);
    effectiveDurationSecRef.current = maxSec;

    clearSlideTimers();
    progressStartRef.current = performance.now();
    setProgress(0);
    setMobileVideoFailed(false);

    scheduleDurationTimer(maxSec * 1000);
    startProgressLoop();
  }, [clearSlideTimers, getDurationSecForIndex, scheduleDurationTimer, startProgressLoop]);

  const handleVideoError = useCallback(() => {
    if (isMobile) {
      setMobileVideoFailed(true);
      return;
    }

    const slideIdx = activeIndexRef.current;
    const list = slidesRef.current;
    const nextFailed = new Set(failedRef.current);
    nextFailed.add(slideIdx);
    failedRef.current = nextFailed;
    setFailedIndices(nextFailed);

    if (nextFailed.size >= list.length) {
      setAllFailed(true);
      clearSlideTimers();
      setProgress(0);
      return;
    }

    goToNextSlide("error");
  }, [clearSlideTimers, goToNextSlide, isMobile]);

  const handleLoadedMetadata = useCallback(
    (e) => {
      const video = e.currentTarget;
      const index = activeIndexRef.current;
      const slide = slidesRef.current[index];
      const maxSec = getDurationSecForIndex(index);
      const startTime = slide?.startTime ?? 0;

      try {
        if (startTime > 0) video.currentTime = startTime;
      } catch {
        /* ignore seek errors */
      }

      video.play().catch(() => {});

      if (Number.isFinite(video.duration) && video.duration > 0) {
        const playable = Math.max(0.01, video.duration - startTime);
        const effectiveSec = Math.min(playable, maxSec);
        effectiveDurationSecRef.current = effectiveSec;
        scheduleDurationTimer(effectiveSec * 1000);
      }
    },
    [getDurationSecForIndex, scheduleDurationTimer]
  );

  useEffect(() => {
    setActiveIndex(0);
    activeIndexRef.current = 0;
    setFailedIndices(new Set());
    failedRef.current = new Set();
    setAllFailed(false);
    setMobileVideoFailed(false);
    setProgress(0);
    isSwitchingRef.current = false;
  }, [slidesKey, isMobile]);

  useEffect(() => {
    if (allFailed || !slides.length) {
      clearSlideTimers();
      return undefined;
    }

    startSlidePlayback();
    return clearSlideTimers;
  }, [activeIndex, allFailed, clearSlideTimers, slides.length, slidesKey, startSlidePlayback]);

  useEffect(
    () => () => {
      clearSlideTimers();
    },
    [clearSlideTimers]
  );

  const slideTitle = current?.title ? t(current.title, lang) : "";
  const statusVisible = slides.length > 0 && !allFailed;

  useEffect(() => {
    onStatusChange?.({
      visible: statusVisible,
      index: activeIndex,
      total,
      slideTitle,
      durationSec,
      progress,
    });
  }, [activeIndex, durationSec, onStatusChange, progress, slideTitle, statusVisible, total]);

  const fallbackPoster = isMobile
    ? heroProp?.mobilePosterUrl
    : heroProp?.fallbackPoster || heroProp?.posterUrl;

  if (!slides.length || allFailed) {
    if (fallbackPoster) {
      return (
        <div className="hero__carousel-stack hero__media">
          <div className="hero__carousel-layer">
            <img src={fallbackPoster} alt="" className="hero__carousel-poster" />
          </div>
        </div>
      );
    }
    return (
      <div className="hero__poster" aria-hidden="true">
        <span className="hero__poster-grid" />
      </div>
    );
  }

  const poster = resolvePoster(current);
  const videoSrc = getVideoSrc(current);
  const showPosterOnly = isMobile && (mobileVideoFailed || !videoSrc);
  const videoKey = `${activeIndex}:${videoSrc || poster || "slide"}`;

  return (
    <div className="hero__carousel-stack hero__media">
      <div className="hero__carousel-layer">
        {showPosterOnly ? (
          poster ? (
            <img src={poster} alt="" className="hero__carousel-poster" />
          ) : (
            <div className="hero__poster">
              <span className="hero__poster-grid" />
            </div>
          )
        ) : (
          <video
            key={videoKey}
            ref={videoRef}
            className="hero__carousel-video"
            src={videoSrc || undefined}
            poster={poster || undefined}
            muted
            playsInline
            autoPlay
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={(e) => {
              e.currentTarget.play().catch(() => {});
            }}
            onEnded={() => goToNextSlide("ended")}
            onError={handleVideoError}
          />
        )}
      </div>
    </div>
  );
}
