import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";
import { getHomeSection, getHomeSoundIssues } from "../../lib/cmsBinding";
import SectionTitle from "../ui/SectionTitle";

export default function SoundIssueSection() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const issues = getHomeSoundIssues(content);
  const section = getHomeSection(content, "soundCheck");

  if (!issues.length) return null;

  return (
    <div className="sound-check">
      <SectionTitle
        sectionIndex={6}
        eyebrow={t(section.eyebrow, lang) || "SOUND CHECK"}
        title={t(section.title, lang)}
        subtitle={t(section.subtitle, lang)}
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
