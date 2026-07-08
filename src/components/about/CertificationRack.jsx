import SectionTitle from "../ui/SectionTitle";
import { t } from "../../lib/content";
import { buildCertificateItems } from "../../lib/media";
import { useMediaLightbox } from "../../context/MediaLightboxContext";
import MediaFallback from "../ui/MediaFallback";

export default function CertificationRack({ certificates, lang }) {
  const { openLightbox } = useMediaLightbox();
  const items = buildCertificateItems(certificates, lang);

  return (
    <section className="about-section certification-rack console-rack">
      <SectionTitle
        sectionIndex={2}
        eyebrow="CERTIFICATION RACK"
        title={lang === "cn" ? "证书认证机架" : "Certification Rack"}
        subtitle={
          lang === "cn"
            ? "专业认证与资质档案，用于快速建立现场与系统交付信任。"
            : "Professional certifications and credentials for on-site and system delivery trust."
        }
      />

      {certificates.length ? (
        <div className="certification-rack__grid console-rack__grid">
          {certificates.map((cert, i) => (
            <button
              key={cert.id}
              type="button"
              className="certification-rack__unit console-rack__unit"
              onClick={() => openLightbox(items, i)}
              aria-label={t(cert.title, lang)}
            >
              <span className="certification-rack__unit-code console-rack__index">
                RACK {String(i + 1).padStart(2, "0")}
              </span>
              <span className="certification-rack__unit-scan console-rack__scan" aria-hidden="true" />
              <div className="certification-rack__image-wrap">
                <img
                  src={cert.imageUrl}
                  alt={t(cert.title, lang)}
                  loading="lazy"
                  className="certification-rack__image"
                />
              </div>
              <span className="certification-rack__label">{t(cert.title, lang)}</span>
            </button>
          ))}
        </div>
      ) : (
        <MediaFallback label={lang === "cn" ? "暂无证书" : "No certificates"} />
      )}
    </section>
  );
}
