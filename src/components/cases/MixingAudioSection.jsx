import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import MixingAudioPlayer from "./MixingAudioPlayer";
import { t } from "../../lib/content";

function GroupBlock({ group, code, emptyLabel, lang, activeTrackId, onActivate }) {
  const title = t(group?.title, lang) || (lang === "cn" ? "音频" : "Audio");
  const description = t(group?.description, lang);
  const tracks = Array.isArray(group?.tracks) ? group.tracks : [];

  return (
    <div className="mixing-audio-section__group console-panel">
      <header className="mixing-audio-section__group-head">
        <span className="mixing-audio-section__group-code">{code}</span>
        <h3 className="mixing-audio-section__group-title">{title}</h3>
        {description ? (
          <p className="mixing-audio-section__group-desc">{description}</p>
        ) : null}
      </header>

      {tracks.length === 0 ? (
        <p className="mixing-audio-section__empty">{emptyLabel}</p>
      ) : (
        <ul className="mixing-audio-section__tracks">
          {tracks.map((track) => (
            <li key={track.id} className="mixing-audio-section__track">
              <MixingAudioPlayer
                track={track}
                lang={lang}
                activeTrackId={activeTrackId}
                onActivate={onActivate}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Mixing-case-only audio modules: 贴唱 + 分轨. */
export default function MixingAudioSection({ modules, lang }) {
  const [activeTrackId, setActiveTrackId] = useState(null);

  if (!modules) return null;

  return (
    <section className="case-file__section case-file__section--mixing-audio mixing-audio-section">
      <SectionTitle
        sectionIndex={null}
        eyebrow="MIXING MODULES"
        title={lang === "cn" ? "贴唱 / 分轨" : "Vocal Tune / Multitrack"}
        subtitle={
          lang === "cn"
            ? "播放与暂停共用同一按键；可拖拽细进度条定位。同页同一时间仅播放一条。"
            : "One play/pause control per track with a thin draggable timeline. Only one track plays at a time."
        }
      />

      <div className="mixing-audio-section__grid">
        <GroupBlock
          group={modules.vocalTune}
          code="01 VOCAL TUNE"
          emptyLabel={lang === "cn" ? "暂无贴唱音频" : "No vocal-tune tracks yet"}
          lang={lang}
          activeTrackId={activeTrackId}
          onActivate={setActiveTrackId}
        />
        <GroupBlock
          group={modules.multitrack}
          code="02 MULTITRACK"
          emptyLabel={lang === "cn" ? "暂无分轨音频" : "No multitrack clips yet"}
          lang={lang}
          activeTrackId={activeTrackId}
          onActivate={setActiveTrackId}
        />
      </div>
    </section>
  );
}
