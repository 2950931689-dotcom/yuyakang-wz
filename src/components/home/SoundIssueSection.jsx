import { useLanguage } from "../../context/LanguageContext";
import { SOUND_ISSUES } from "../../lib/homeContent";
import SectionTitle from "../ui/SectionTitle";

export default function SoundIssueSection() {
  const { lang } = useLanguage();

  return (
    <div className="sound-check">
      <SectionTitle
        sectionIndex={6}
        eyebrow="SOUND CHECK"
        title={lang === "cn" ? "现场声音问题诊断" : "Sound Issue Diagnostics"}
        subtitle={
          lang === "cn"
            ? "常见现场问题与可能成因，便于项目沟通前快速对照。"
            : "Common on-site issues and likely causes for faster project alignment."
        }
      />
      <div className="sound-check__grid">
        {SOUND_ISSUES.map((issue) => (
          <article key={issue.order} className="sound-check__card">
            <span className="sound-check__code">
              CHECK {String(issue.order).padStart(2, "0")}
            </span>
            <h3 className="sound-check__title">{issue.title[lang]}</h3>
            <p className="sound-check__desc">{issue.description[lang]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
