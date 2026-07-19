import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import MixingAudioPlayer from "./MixingAudioPlayer";
import { t } from "../../lib/content";

function ModuleBlock({
  group,
  eyebrow,
  emptyLabel,
  lang,
  activeTrackId,
  onActivate,
}) {
  const title = t(group?.title, lang) || (lang === "cn" ? "音频" : "Audio");
  const description = t(group?.description, lang);
  const tracks = Array.isArray(group?.tracks) ? group.tracks : [];

  return (
    <section className="case-file__section mixing-audio-module">
      <SectionTitle
        sectionIndex={null}
        eyebrow={eyebrow}
        title={title}
        subtitle={description || undefined}
      />

      <div className="mixing-audio-module__body console-panel">
        {tracks.length === 0 ? (
          <p className="mixing-audio-module__empty">{emptyLabel}</p>
        ) : (
          <ul className="mixing-audio-module__tracks">
            {tracks.map((track) => (
              <li key={track.id} className="mixing-audio-module__track">
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
    </section>
  );
}

/**
 * Mixing-case audio: two independent stacked modules — 贴唱 then 分轨.
 * Shared activeTrackId so only one track plays at a time across both.
 */
export default function MixingAudioSection({ modules, lang }) {
  const [activeTrackId, setActiveTrackId] = useState(null);

  if (!modules) return null;

  return (
    <div className="mixing-audio-stack">
      <ModuleBlock
        group={modules.vocalTune}
        eyebrow="01 VOCAL TUNE"
        emptyLabel={
          lang === "cn"
            ? "暂无贴唱音频，请在后台「贴唱 / 分轨」上传。"
            : "No vocal-tune audio yet — upload in admin."
        }
        lang={lang}
        activeTrackId={activeTrackId}
        onActivate={setActiveTrackId}
      />
      <ModuleBlock
        group={modules.multitrack}
        eyebrow="02 MULTITRACK"
        emptyLabel={
          lang === "cn"
            ? "暂无分轨音频，请在后台「贴唱 / 分轨」上传。"
            : "No multitrack audio yet — upload in admin."
        }
        lang={lang}
        activeTrackId={activeTrackId}
        onActivate={setActiveTrackId}
      />
    </div>
  );
}
