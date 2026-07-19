import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Thin custom audio player — no third-party libs.
 * Parent coordinates exclusive playback via activeTrackId / onActivate.
 */
export default function MixingAudioPlayer({
  track,
  lang = "cn",
  activeTrackId,
  onActivate,
}) {
  const audioRef = useRef(null);
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

  const seekTo = (value) => {
    const el = audioRef.current;
    if (!el || !Number.isFinite(duration) || duration <= 0) return;
    const next = Math.min(Math.max(Number(value) || 0, 0), duration);
    el.currentTime = next;
    setCurrent(next);
  };

  const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const progress = max > 0 ? current : 0;

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
        <label className="mixing-audio-player__seek-wrap">
          <span className="sr-only">
            {lang === "cn" ? "音频进度" : "Seek"}
          </span>
          <input
            type="range"
            className="mixing-audio-player__seek"
            min={0}
            max={max || 0}
            step={0.01}
            value={progress}
            disabled={!ready || max <= 0}
            aria-label={lang === "cn" ? `${name} 进度` : `${name} seek`}
            onPointerDown={() => {
              seekingRef.current = true;
            }}
            onPointerUp={(e) => {
              seekingRef.current = false;
              seekTo(e.currentTarget.value);
            }}
            onChange={(e) => {
              const v = Number(e.target.value);
              setCurrent(v);
              if (!seekingRef.current) seekTo(v);
            }}
          />
        </label>
      )}
    </div>
  );
}
