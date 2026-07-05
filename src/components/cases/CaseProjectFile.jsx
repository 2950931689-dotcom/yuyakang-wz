import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getCategoryLabel, getCaseProjectNumber, getCaseToolsText, t } from "../../lib/content";
import { buildCaseVideoItem } from "../../lib/media";
import { useMediaLightbox } from "../../context/MediaLightboxContext";
import CaseGallery from "./CaseGallery";
import AudioPreviewPlaceholder from "./AudioPreviewPlaceholder";
import ProjectConsole from "./ProjectConsole";
import SystemSignalFlow from "./SystemSignalFlow";
import Tag from "../ui/Tag";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import MediaFallback from "../ui/MediaFallback";

const COLLAPSE_THRESHOLD = 480;

function ProseSection({ code, title, text, lang, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!text?.trim()) return null;

  const isLong = text.length > COLLAPSE_THRESHOLD;
  const showCollapsed = isLong && !expanded;

  return (
    <section className="case-file__section">
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

function MetaCell({ label, value }) {
  if (!value?.trim()) return null;
  return (
    <div className="case-file__meta-cell">
      <span className="case-file__meta-label">{label}</span>
      <span className="case-file__meta-value">{value}</span>
    </div>
  );
}

export default function CaseProjectFile({ caseItem, content, lang }) {
  const { openLightbox } = useMediaLightbox();
  const projectNum = getCaseProjectNumber(content, caseItem);
  const videoItem = buildCaseVideoItem(caseItem, lang);

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
  const tags = caseItem.tags ?? [];
  const projectDate = caseItem.projectDate || caseItem.date || "";

  const labels = {
    file: lang === "cn" ? "项目档案" : "Project File",
    overview: lang === "cn" ? "项目概览" : "Project Overview",
    challenge: lang === "cn" ? "项目难点" : "Challenge",
    role: lang === "cn" ? "我的角色" : "My Role",
    solution: lang === "cn" ? "解决方案" : "Solution",
    result: lang === "cn" ? "最终效果" : "Result",
    tools: lang === "cn" ? "使用设备与软件" : "Tools & Software",
    media: lang === "cn" ? "项目媒体" : "Media",
    location: lang === "cn" ? "地点" : "Location",
    category: lang === "cn" ? "分类" : "Category",
    date: lang === "cn" ? "时间" : "Date",
    roleLabel: lang === "cn" ? "角色" : "Role",
  };

  const ci = content.i18n?.cases ?? {};

  return (
    <article className="case-file fade-in">
      <ProjectConsole caseItem={caseItem} content={content} lang={lang} />

      <header className="case-file__header">
        <div className="case-file__header-top">
          <span className="case-file__project-id">PROJECT {projectNum}</span>
          <span className="case-file__file-tag">PROJECT FILE</span>
        </div>
        <h1 className="case-file__title">{t(caseItem.title, lang)}</h1>
        <div className="case-file__signal-line" aria-hidden="true" />
      </header>

      <div className="case-file__meta-grid">
        <MetaCell label={labels.category} value={getCategoryLabel(caseItem.category, lang)} />
        <MetaCell label={labels.location} value={t(caseItem.location, lang)} />
        <MetaCell label={labels.roleLabel} value={roleText} />
        <MetaCell label={labels.date} value={projectDate} />
      </div>

      {(tags.length > 0 || caseItem.featured) && (
        <div className="case-file__tags">
          {caseItem.featured && (
            <Tag featured>{lang === "cn" ? "精选" : "Featured"}</Tag>
          )}
          {tags.map((tag) => (
            <Tag key={typeof tag === "string" ? tag : tag.cn}>{typeof tag === "string" ? tag : t(tag, lang)}</Tag>
          ))}
        </div>
      )}

      <SystemSignalFlow caseItem={caseItem} lang={lang} />

      <ProseSection
        code="01 / OVERVIEW"
        title={labels.overview}
        text={overview}
        lang={lang}
      />
      {backgroundOnly && (
        <ProseSection
          code="01b / BACKGROUND"
          title={lang === "cn" ? "项目背景" : "Background"}
          text={backgroundOnly}
          lang={lang}
        />
      )}

      <ProseSection
        code="02 / CHALLENGE"
        title={labels.challenge}
        text={t(caseItem.challenge, lang)}
        lang={lang}
      />

      {(roleText || serviceText) && (
        <section className="case-file__section">
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

      <section className="case-file__section case-file__section--media media-rack">
        <header className="media-rack__head">
          <span className="case-file__section-code">MEDIA RACK</span>
          <h2 className="case-file__section-title">
            {lang === "cn" ? "项目媒体机架" : "Project Media Rack"}
          </h2>
        </header>

        <div className="media-rack__slot">
          <div className="media-rack__slot-head">
            <span className="media-rack__slot-code">01 PHOTO</span>
            <span className="media-rack__slot-label">{lang === "cn" ? "现场图片" : "Gallery"}</span>
          </div>
          <div className="media-rack__slot-body">
            <CaseGallery caseItem={caseItem} rack />
          </div>
        </div>

        <div className="media-rack__slot">
          <div className="media-rack__slot-head">
            <span className="media-rack__slot-code">02 VIDEO</span>
            <span className="media-rack__slot-label">{lang === "cn" ? "视频" : "Video"}</span>
          </div>
          <div className="media-rack__slot-body">
            {videoItem ? (
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
            ) : (
              <MediaFallback label={lang === "cn" ? "暂无视频" : "No video"} compact />
            )}
          </div>
        </div>

        <div className="media-rack__slot">
          <div className="media-rack__slot-head">
            <span className="media-rack__slot-code">03 AUDIO</span>
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
            <span className="media-rack__slot-code">04 SYSTEM SNAPSHOT</span>
            <span className="media-rack__slot-label">
              {lang === "cn" ? "系统快照" : "System Snapshot"}
            </span>
          </div>
          <div className="media-rack__slot-body media-rack__snapshot">
            {toolsText ? (
              <p className="media-rack__snapshot-text">{toolsText}</p>
            ) : (
              <p className="media-rack__snapshot-text media-rack__snapshot-text--muted">
                {lang === "cn" ? "系统设备与链路摘要见上方 Signal Flow。" : "See Signal Flow above for system chain summary."}
              </p>
            )}
          </div>
        </div>
      </section>

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
