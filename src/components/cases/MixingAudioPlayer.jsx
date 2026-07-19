import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Mixing audio player: combined play/pause + thin draggable timeline.
 * Parent coordinates exclusive playback via activeTrackId / onActivate.
 */
export default function MixingAudioPlayer({
  track,
  lang = "cn",
  activeTrackId,
  onActivate,
}) {
  const audioRef = useRef(null);
  const railRef = useRef(null);
  const seekingRef = useRef(false);
  const labelId = useId();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  const src = String(track?.audioUrl || "").trim();
  const name =
    String(track?.name || "").trim() ||
    (lang === "cn" ? "未命名音频" : "Untitled audio");
  const description = String(track?.description || "").trim();
  const isActive = activeTrackId === track.id;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;

    const onLoaded = () => {
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
        setReady(true);
        setError(false);
      }
    };
    const onTime = () => {
      if (seekingRef.current) return;
      const t = el.currentTime;
      if (Number.isFinite(t)) setCurrent(t);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      el.currentTime = 0;
      setCurrent(0);
    };
    const onError = () => {
      setError(true);
      setPlaying(false);
      setReady(false);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    return () => {
      el.pause();
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!isActive && !el.paused) {
      el.pause();
    }
  }, [isActive]);

  const seekTo = useCallback(
    (value) => {
      const el = audioRef.current;
      if (!el || !Number.isFinite(duration) || duration <= 0) return;
      const next = Math.min(Math.max(Number(value) || 0, 0), duration);
      el.currentTime = next;
      setCurrent(next);
    },
    [duration]
  );

  const ratioFromClientX = useCallback(
    (clientX) => {
      const rail = railRef.current;
      if (!rail || !Number.isFinite(duration) || duration <= 0) return 0;
      const rect = rail.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      return ratio * duration;
    },
    [duration]
  );

  const onRailPointerDown = (e) => {
    if (!ready || error || duration <= 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    seekingRef.current = true;
    onActivate?.(track.id);
    const next = ratioFromClientX(e.clientX);
    setCurrent(next);
    seekTo(next);
  };

  const onRailPointerMove = (e) => {
    if (!seekingRef.current) return;
    const next = ratioFromClientX(e.clientX);
    setCurrent(next);
  };

  const onRailPointerUp = (e) => {
    if (!seekingRef.current) return;
    seekingRef.current = false;
    const next = ratioFromClientX(e.clientX);
    seekTo(next);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const toggle = async () => {
    const el = audioRef.current;
    if (!el || error || !src) return;
    if (!el.paused) {
      el.pause();
      return;
    }
    onActivate?.(track.id);
    try {
      await el.play();
    } catch {
      setError(true);
      setPlaying(false);
    }
  };

  const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const pct = max > 0 ? Math.min(Math.max((current / max) * 100, 0), 100) : 0;

  return (
    <div
      className={`mixing-audio-player${playing ? " is-playing" : ""}${error ? " is-error" : ""}`}
    >
      <audio ref={audioRef} src={src || undefined} preload="metadata" />

      <div className="mixing-audio-player__head">
        <button
          type="button"
          className="mixing-audio-player__toggle"
          onClick={toggle}
          disabled={!src || error}
          aria-labelledby={labelId}
          aria-pressed={playing}
          aria-label={
            playing
              ? lang === "cn"
                ? "暂停"
                : "Pause"
              : lang === "cn"
                ? "播放"
                : "Play"
          }
        >
          {playing ? <Pause size={16} strokeWidth={1.75} /> : <Play size={16} strokeWidth={1.75} />}
          <span className="mixing-audio-player__toggle-label">
            {playing
              ? lang === "cn"
                ? "暂停"
                : "Pause"
              : lang === "cn"
                ? "播放"
                : "Play"}
          </span>
        </button>

        <div className="mixing-audio-player__meta">
          <p id={labelId} className="mixing-audio-player__name">
            {name}
          </p>
          {description ? (
            <p className="mixing-audio-player__desc">{description}</p>
          ) : null}
        </div>

        <span className="mixing-audio-player__time" aria-live="off">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>

      {error ? (
        <p className="mixing-audio-player__error">
          {lang === "cn" ? "音频暂不可用" : "Audio unavailable"}
        </p>
      ) : (
        <div
          ref={railRef}
          className="mixing-audio-player__timeline"
          role="slider"
          tabIndex={ready && max > 0 ? 0 : -1}
          aria-valuemin={0}
          aria-valuemax={Math.round(max) || 0}
          aria-valuenow={Math.round(current) || 0}
          aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
          aria-label={lang === "cn" ? `${name} 进度` : `${name} seek`}
          aria-disabled={!ready || max <= 0}
          onPointerDown={onRailPointerDown}
          onPointerMove={onRailPointerMove}
          onPointerUp={onRailPointerUp}
          onPointerCancel={onRailPointerUp}
          onKeyDown={(e) => {
            if (!ready || max <= 0) return;
            const step = Math.max(max * 0.02, 1);
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              seekTo(current - step);
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              seekTo(current + step);
            } else if (e.key === "Home") {
              e.preventDefault();
              seekTo(0);
            } else if (e.key === "End") {
              e.preventDefault();
              seekTo(max);
            }
          }}
        >
          <div className="mixing-audio-player__timeline-track" aria-hidden="true">
            <div
              className="mixing-audio-player__timeline-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div
            className="mixing-audio-player__timeline-thumb"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
