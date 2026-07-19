import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getCaseImages, t } from "../../lib/content";
import { buildCaseVideoItem } from "../../lib/media";
import { useMediaLightbox } from "../../context/MediaLightboxContext";
import CaseGallery from "./CaseGallery";
import AudioPreviewPlaceholder from "./AudioPreviewPlaceholder";
import ProjectConsole from "./ProjectConsole";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

/**
 * Build a single「项目介绍」body from case narrative fields.
 * Does not rewrite text — only concatenates non-empty unique blocks.
 *
 * Priority:
 * 1. If multiple of summary/background/challenge/solution/result have content → combine (one region).
 * 2. Else challenge.
 * 3. Else summary → background → description → body.
 */
export function getCaseIntroductionText(caseItem, lang) {
  const pick = (field) => {
    const value = t(caseItem?.[field], lang);
    return typeof value === "string" ? value.trim() : "";
  };

  const summary = pick("summary");
  const background = pick("background");
  const challenge = pick("challenge");
  const solution = pick("solution");
  const result = pick("result");
  const description = pick("description");
  const body = pick("body");

  const narrative = [summary, background, challenge, solution, result].filter(Boolean);
  const uniqueCount = new Set(narrative).size;

  if (uniqueCount > 1) {
    const parts = [];
    const seen = new Set();
    for (const block of [summary, background, challenge, solution, result]) {
      if (!block || seen.has(block)) continue;
      seen.add(block);
      parts.push(block);
    }
    return parts.join("\n\n");
  }

  if (challenge) return challenge;
  return summary || background || description || body || "";
}

function IntroductionSection({ text, lang }) {
  if (!text?.trim()) return null;

  return (
    <section className="case-file__section case-file__section--intro">
      <header className="case-file__section-head">
        <span className="case-file__section-code">PROJECT INTRODUCTION</span>
        <h2 className="case-file__section-title">
          {lang === "cn" ? "项目介绍" : "Introduction"}
        </h2>
      </header>
      <div className="case-file__prose">
        {text.split(/\n\n+/).map((para, i) => {
          const trimmed = para.trim();
          if (!trimmed) return null;
          return <p key={i}>{trimmed}</p>;
        })}
      </div>
    </section>
  );
}

function MediaRack({ caseItem, content, lang }) {
  const { openLightbox } = useMediaLightbox();
  const videoItem = buildCaseVideoItem(caseItem, lang);
  const hasVideo = Boolean(videoItem);
  const photoCount = getCaseImages(caseItem).length;
  const hasPhotos = photoCount > 0;
  const hasAudio = Boolean(caseItem?.audioUrl);
  let slotIndex = 0;

  const nextCode = (label) => {
    slotIndex += 1;
    return `${String(slotIndex).padStart(2, "0")} ${label}`;
  };

  const hasAnyMedia = hasVideo || hasPhotos || hasAudio;

  return (
    <section className="case-file__section case-file__section--media media-rack">
      <header className="media-rack__head">
        <span className="case-file__section-code">MEDIA RACK</span>
        <h2 className="case-file__section-title">
          {lang === "cn" ? "项目媒体机架" : "Project Media Rack"}
        </h2>
      </header>

      {!hasAnyMedia && (
        <EmptyState
          message={
            lang === "cn" ? "暂无项目媒体" : "No project media yet"
          }
        />
      )}

      {hasVideo && (
        <div className="media-rack__slot">
          <div className="media-rack__slot-head">
            <span className="media-rack__slot-code">{nextCode("VIDEO")}</span>
            <span className="media-rack__slot-label">{lang === "cn" ? "视频" : "Video"}</span>
          </div>
          <div className="media-rack__slot-body">
            <button
              type="button"
              className="case-video-trigger media-rack__video"
              onClick={() => openLightbox([videoItem], 0)}
              aria-label={lang === "cn" ? "播放项目视频" : "Play project video"}
            >
              <video
                src={caseItem.videoUrl}
                poster={videoItem.poster || undefined}
                muted
                playsInline
                preload="metadata"
              />
              <span className="case-video-trigger__play">
                <Play size={28} strokeWidth={1.5} />
              </span>
            </button>
          </div>
        </div>
      )}

      {hasPhotos && (
        <div className="media-rack__slot">
          <div className="media-rack__slot-head">
            <span className="media-rack__slot-code">{nextCode("PHOTO")}</span>
            <span className="media-rack__slot-label">{lang === "cn" ? "现场图片" : "Gallery"}</span>
          </div>
          <div className="media-rack__slot-body">
            <CaseGallery caseItem={caseItem} rack />
          </div>
        </div>
      )}

      {hasAudio && (
        <div className="media-rack__slot">
          <div className="media-rack__slot-head">
            <span className="media-rack__slot-code">{nextCode("AUDIO")}</span>
            <span className="media-rack__slot-label">{lang === "cn" ? "音频试听" : "Audio Preview"}</span>
          </div>
          <div className="media-rack__slot-body">
            <div className="media-rack__audio">
              <div className="media-rack__waveform" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="media-rack__wave-bar"
                    style={{ height: `${28 + ((i * 17) % 52)}%` }}
                  />
                ))}
              </div>
              <AudioPreviewPlaceholder />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Simplified case detail body (round case-detail simplification):
 * Project data → Media rack → Project introduction → CTA.
 * Narrative fields remain in CMS; only front-end sections are reduced.
 */
export default function CaseProjectFile({ caseItem, content, lang }) {
  const introduction = getCaseIntroductionText(caseItem, lang);

  return (
    <article className="case-file fade-in">
      <section className="case-file__section case-file__section--data">
        <header className="case-file__section-head">
          <span className="case-file__section-code">PROJECT DATA</span>
          <h2 className="case-file__section-title">
            {lang === "cn" ? "项目详细信息" : "Project Data"}
          </h2>
        </header>
        <ProjectConsole caseItem={caseItem} content={content} lang={lang} />
      </section>

      <MediaRack caseItem={caseItem} content={content} lang={lang} />

      <IntroductionSection text={introduction} lang={lang} />

      <footer className="case-file__cta">
        <div className="case-file__cta-main">
          <Button as={Link} to={`/booking?case=${encodeURIComponent(caseItem.slug)}`}>
            {lang === "cn" ? "预约类似项目" : "Book a Similar Project"}
          </Button>
          <Button as={Link} to="/cases" variant="secondary">
            {lang === "cn" ? "返回案例列表" : "Back to Works"}
          </Button>
        </div>
        <p className="case-file__cta-hint">
          {lang === "cn"
            ? "如果你正在筹备类似 Livehouse、演出系统或混音项目，可以带着该案例作为参考提交需求。"
            : "Planning a similar livehouse, tour system or mixing project? Share this case as reference when you submit."}
        </p>
      </footer>
    </article>
  );
}
