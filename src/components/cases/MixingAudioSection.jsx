import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import MixingAudioPlayer from "./MixingAudioPlayer";
import { t } from "../../lib/content";

function GroupBlock({ group, lang, activeTrackId, onActivate }) {
  if (!group?.tracks?.length) return null;
  const title = t(group.title, lang) || (lang === "cn" ? "音频" : "Audio");
  const description = t(group.description, lang);

  return (
    <div className="mixing-audio-section__group">
      <header className="mixing-audio-section__group-head">
        <h3 className="mixing-audio-section__group-title">{title}</h3>
        {description ? (
          <p className="mixing-audio-section__group-desc">{description}</p>
        ) : null}
      </header>
      <ul className="mixing-audio-section__tracks">
        {group.tracks.map((track) => (
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
    </div>
  );
}

/** Mixing-case-only audio module: 贴唱 + 分轨. */
export default function MixingAudioSection({ modules, lang }) {
  const [activeTrackId, setActiveTrackId] = useState(null);

  if (!modules) return null;

  return (
    <section className="case-file__section case-file__section--mixing-audio mixing-audio-section">
      <SectionTitle
        sectionIndex={null}
        eyebrow="MIXING AUDIO"
        title={lang === "cn" ? "混音案例" : "Mixing Audio"}
        subtitle={
          lang === "cn"
            ? "贴唱与分轨音频试听 — 同页同一时间仅播放一条。"
            : "Vocal-tune and multitrack previews — one track playing at a time."
        }
      />

      <div className="mixing-audio-section__grid">
        <GroupBlock
          group={modules.vocalTune}
          lang={lang}
          activeTrackId={activeTrackId}
          onActivate={setActiveTrackId}
        />
        <GroupBlock
          group={modules.multitrack}
          lang={lang}
          activeTrackId={activeTrackId}
          onActivate={setActiveTrackId}
        />
      </div>
    </section>
  );
}
