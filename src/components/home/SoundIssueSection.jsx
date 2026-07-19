import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";
import { getHomeSoundIssues } from "../../lib/cmsBinding";
import SectionTitle from "../ui/SectionTitle";

export default function SoundIssueSection() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const issues = getHomeSoundIssues(content);

  if (!issues.length) return null;

  return (
    <div className="sound-check">
      <SectionTitle
        sectionIndex={6}
        eyebrow="SOUND CHECK"
        title={lang === "cn" ? "现场声音问题诊断" : "Sound Issue Diagnostics"}
        subtitle={
          lang === "cn"
            ? "常见现场问题速览，便于沟通前快速对照可能成因。"
            : "A quick checklist of common on-site issues and likely causes."
        }
      />
      <div className="sound-check__grid">
        {issues.map((issue, index) => (
          <article key={issue.order ?? index} className="sound-check__card">
            <span className="sound-check__code">
              CHECK {String(issue.order ?? index + 1).padStart(2, "0")}
            </span>
            <h3 className="sound-check__title">{t(issue.title, lang)}</h3>
            <p className="sound-check__desc">{t(issue.description, lang)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
