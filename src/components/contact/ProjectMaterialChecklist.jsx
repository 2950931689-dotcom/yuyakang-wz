import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getContactChecklist } from "../../lib/cmsBinding";
import SectionTitle from "../ui/SectionTitle";
import BookingSignalMeter from "../booking/BookingSignalMeter";

export default function ProjectMaterialChecklist() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const checklist = getContactChecklist(content, lang);

  return (
    <section className="contact-section contact-checklist">
      <SectionTitle
        sectionIndex={4}
        eyebrow="PROJECT MATERIAL CHECKLIST"
        title={lang === "cn" ? "项目资料准备清单" : "Project Material Checklist"}
      />

      <p className="contact-checklist__lead">
        {lang === "cn"
          ? "资料越完整，项目评估越准确。即使暂时没有完整设备表，也可以先通过微信发送现场照片或视频。"
          : "More complete materials enable better assessment. Site photos or video via WeChat are a good start."}
      </p>

      <div className="contact-checklist__grid">
        {checklist.map((item, i) => (
          <article key={item.cn} className="contact-checklist__item">
            <div className="contact-checklist__head">
              <span className="contact-checklist__code">
                CHECK {String(i + 1).padStart(2, "0")}
              </span>
              <BookingSignalMeter level={50 + i * 7} />
            </div>
            <p className="contact-checklist__text">{item[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
