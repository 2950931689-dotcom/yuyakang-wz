import SectionTitle from "../ui/SectionTitle";
import { t } from "../../lib/content";
import MediaFallback from "../ui/MediaFallback";

export default function FieldRecord({ workPhotos, workItems, lang, openLightbox }) {
  return (
    <section className="about-section field-record console-rack">
      <SectionTitle
        sectionIndex={5}
        eyebrow="FIELD RECORD"
        title={lang === "cn" ? "现场工作记录" : "Field Record"}
        subtitle={
          lang === "cn"
            ? "现场调音、系统调试与演出现场记录，用于补充现场执行证明。"
            : "On-site mixing, system tuning and live show documentation."
        }
      />

      {workPhotos.length ? (
        <div className="field-record__grid console-rack__grid">
          {workPhotos.map((photo, i) => (
            <button
              key={photo.id || photo.imageUrl}
              type="button"
              className="field-record__item console-rack__unit"
              onClick={() => openLightbox(workItems, i)}
              aria-label={t(photo.title, lang)}
            >
              <span className="field-record__item-code console-rack__index">
                REC {String(i + 1).padStart(2, "0")}
              </span>
              <div className="field-record__image-wrap">
                <img
                  src={photo.imageUrl}
                  alt={t(photo.title, lang)}
                  loading="lazy"
                  className="field-record__image"
                />
              </div>
              {photo.title && (
                <span className="field-record__caption">{t(photo.title, lang)}</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <MediaFallback label={lang === "cn" ? "暂无工作照" : "No work photos"} />
      )}
    </section>
  );
}
