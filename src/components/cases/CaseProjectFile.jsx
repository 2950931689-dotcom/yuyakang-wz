import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getCaseToolsText, t } from "../../lib/content";
import { buildCaseVideoItem } from "../../lib/media";
import { useMediaLightbox } from "../../context/MediaLightboxContext";
import CaseGallery from "./CaseGallery";
import AudioPreviewPlaceholder from "./AudioPreviewPlaceholder";
import ProjectConsole from "./ProjectConsole";
import SystemSignalFlow from "./SystemSignalFlow";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

const COLLAPSE_THRESHOLD = 480;

function ProseSection({ code, title, text, lang, defaultExpanded = true, className = "", hideHeadOnMobile = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!text?.trim()) return null;

  const isLong = text.length > COLLAPSE_THRESHOLD;
  const showCollapsed = isLong && !expanded;
  const sectionClass = [
    "case-file__section",
    className,
    hideHeadOnMobile ? "case-file__section--mobile-muted-head" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass}>
      <header className="case-file__section-head">
        <span className="case-file__section-code">{code}</span>
        <h2 className="case-file__section-title">{title}</h2>
      </header>
      <div className={`case-file__prose${showCollapsed ? " is-collapsed" : ""}`}>
        {text.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para.trim()}</p>
        ))}
      </div>
      {isLong && (
        <button
          type="button"
          className="case-file__toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? lang === "cn"
              ? "收起"
              : "Show less"
            : lang === "cn"
              ? "展开全文"
              : "Read full text"}
        </button>
      )}
    </section>
  );
}

function MediaRack({ caseItem, content, lang }) {
  const { openLightbox } = useMediaLightbox();
  const videoItem = buildCaseVideoItem(caseItem, lang);
  const toolsText = getCaseToolsText(caseItem, lang);
  const hasVideo = Boolean(videoItem);
  let slotIndex = 0;

  const nextCode = (label) => {
    slotIndex += 1;
    return `${String(slotIndex).padStart(2, "0")} ${label}`;
  };

  return (
    <section className="case-file__section case-file__section--media media-rack case-file__section--mobile-priority">
      <header className="media-rack__head">
        <span className="case-file__section-code">MEDIA RACK</span>
        <h2 className="case-file__section-title">
          {lang === "cn" ? "项目媒体机架" : "Project Media Rack"}
        </h2>
      </header>

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

      <div className="media-rack__slot">
        <div className="media-rack__slot-head">
          <span className="media-rack__slot-code">{nextCode("PHOTO")}</span>
          <span className="media-rack__slot-label">{lang === "cn" ? "现场图片" : "Gallery"}</span>
        </div>
        <div className="media-rack__slot-body">
          <CaseGallery caseItem={caseItem} rack />
        </div>
      </div>

      <div className="media-rack__slot">
        <div className="media-rack__slot-head">
          <span className="media-rack__slot-code">{nextCode("AUDIO")}</span>
          <span className="media-rack__slot-label">{lang === "cn" ? "音频试听" : "Audio Preview"}</span>
        </div>
        <div className="media-rack__slot-body">
          {caseItem.audioUrl ? (
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
          ) : (
            <EmptyState message={t(content.i18n?.common?.noAudio, lang) || (lang === "cn" ? "暂无音频" : "No audio")} />
          )}
        </div>
      </div>

      <div className="media-rack__slot media-rack__slot--snapshot">
        <div className="media-rack__slot-head">
          <span className="media-rack__slot-code">{nextCode("SYSTEM SNAPSHOT")}</span>
          <span className="media-rack__slot-label">
            {lang === "cn" ? "系统快照" : "System Snapshot"}
          </span>
        </div>
        <div className="media-rack__slot-body media-rack__snapshot">
          {toolsText ? (
            <p className="media-rack__snapshot-text">{toolsText}</p>
          ) : (
            <p className="media-rack__snapshot-text media-rack__snapshot-text--muted">
              {lang === "cn" ? "系统设备与链路摘要见下方 Signal Flow。" : "See Signal Flow below for system chain summary."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CaseProjectFile({ caseItem, content, lang }) {
  const overview =
    t(caseItem.summary, lang) || t(caseItem.background, lang);
  const backgroundOnly =
    t(caseItem.summary, lang) && t(caseItem.background, lang)
      ? t(caseItem.background, lang)
      : "";
  const roleText = t(caseItem.role, lang);
  const serviceText =
    t(caseItem.serviceContent, lang) || t(caseItem.services, lang);
  const toolsText = getCaseToolsText(caseItem, lang);

  const labels = {
    overview: lang === "cn" ? "项目概览" : "Project Overview",
    challenge: lang === "cn" ? "项目难点" : "Challenge",
    role: lang === "cn" ? "我的角色" : "My Role",
    solution: lang === "cn" ? "解决方案" : "Solution",
    result: lang === "cn" ? "最终效果" : "Result",
    tools: lang === "cn" ? "使用设备与软件" : "Tools & Software",
    detail: lang === "cn" ? "完整项目档案" : "Full Project File",
  };

  const ci = content.i18n?.cases ?? {};

  return (
    <article className="case-file fade-in">
      <section className="case-file__section case-file__section--data case-file__section--mobile-defer">
        <header className="case-file__section-head">
          <span className="case-file__section-code">PROJECT DATA</span>
          <h2 className="case-file__section-title">
            {lang === "cn" ? "项目详细信息" : "Project Data"}
          </h2>
        </header>
        <ProjectConsole caseItem={caseItem} content={content} lang={lang} />
      </section>

      <MediaRack caseItem={caseItem} content={content} lang={lang} />

      <section className="case-file__section case-file__section--detail case-file__section--mobile-defer">
        <header className="case-file__section-head">
          <span className="case-file__section-code">PROJECT FILE DETAIL</span>
          <h2 className="case-file__section-title">{labels.detail}</h2>
        </header>
      </section>

      <ProseSection
        code="01 / OVERVIEW"
        title={labels.overview}
        text={overview}
        lang={lang}
        hideHeadOnMobile
      />
      {backgroundOnly && (
        <ProseSection
          code="01b / BACKGROUND"
          title={lang === "cn" ? "项目背景" : "Background"}
          text={backgroundOnly}
          lang={lang}
          hideHeadOnMobile
        />
      )}

      <ProseSection
        code="02 / CHALLENGE"
        title={labels.challenge}
        text={t(caseItem.challenge, lang)}
        lang={lang}
        hideHeadOnMobile
      />

      {(roleText || serviceText) && (
        <section className="case-file__section case-file__section--mobile-muted-head">
          <header className="case-file__section-head">
            <span className="case-file__section-code">03 / ROLE</span>
            <h2 className="case-file__section-title">{labels.role}</h2>
          </header>
          {roleText && (
            <div className="case-file__prose">
              <p>{roleText}</p>
            </div>
          )}
          {serviceText && serviceText !== roleText && (
            <div className="case-file__prose case-file__prose--sub">
              <p className="case-file__sub-label">
                {lang === "cn" ? "服务内容" : "Service Scope"}
              </p>
              <p>{serviceText}</p>
            </div>
          )}
        </section>
      )}

      <ProseSection
        code="04 / SOLUTION"
        title={labels.solution}
        text={t(caseItem.solution, lang)}
        lang={lang}
      />

      <ProseSection
        code="05 / RESULT"
        title={labels.result}
        text={t(caseItem.result, lang)}
        lang={lang}
      />

      {t(caseItem.clientFeedback, lang) && (
        <ProseSection
          code="05b / FEEDBACK"
          title={t(ci.clientFeedback, lang) || (lang === "cn" ? "客户反馈" : "Client Feedback")}
          text={t(caseItem.clientFeedback, lang)}
          lang={lang}
        />
      )}

      {toolsText && (
        <section className="case-file__section">
          <header className="case-file__section-head">
            <span className="case-file__section-code">06 / TOOLS</span>
            <h2 className="case-file__section-title">{labels.tools}</h2>
          </header>
          <div className="case-file__tools">
            {Array.isArray(caseItem.toolsUsed) && caseItem.toolsUsed.length ? (
              caseItem.toolsUsed.map((tool) => (
                <span key={tool} className="case-file__tool-chip">
                  {tool}
                </span>
              ))
            ) : (
              <div className="case-file__prose">
                {toolsText.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <SystemSignalFlow caseItem={caseItem} lang={lang} />

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
