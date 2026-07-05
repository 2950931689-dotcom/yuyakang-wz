import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getDouyinUrl, isDouyinSelfLink, t } from "../../lib/content";
import Button from "../ui/Button";

export default function TutorialSection() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const section = content.tutorialSection;
  if (!section?.enabled) return null;

  const social = content.socialLinks;
  const douyin = getDouyinUrl(social);
  const wechatVideo = social?.wechatVideoUrl;
  const douyinSelf = isDouyinSelfLink(douyin);

  return (
    <section className="section container tutorial-section" id="tutorials">
      <div className="tutorial-section__inner">
        <div className="tutorial-section__content">
          <h2 className="tutorial-section__title">{t(section.title, lang)}</h2>
          <p className="tutorial-section__subtitle">{t(section.subtitle, lang)}</p>
          <p className="tutorial-section__desc">{t(section.description, lang)}</p>
        </div>

        <div className="tutorial-section__actions">
          {douyin && (
            <Button
              as="a"
              href={douyin}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(section.douyinButton, lang)}
            </Button>
          )}
          {wechatVideo && (
            <Button
              as="a"
              href={wechatVideo}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              {t(section.wechatVideoButton, lang)}
            </Button>
          )}
          {douyinSelf && (
            <p className="tutorial-section__hint">{t(section.douyinDraftHint, lang)}</p>
          )}
        </div>
      </div>

      {section.tags?.length > 0 && (
        <ul className="tutorial-section__tags">
          {section.tags.map((tag, i) => (
            <li key={i} className="tutorial-section__tag">
              {t(tag, lang)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
