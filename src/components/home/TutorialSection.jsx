import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getDouyinUrl, getUiText, isDouyinSelfLink, t } from "../../lib/content";
import ExternalLinkButton from "../ui/ExternalLinkButton";

export default function TutorialSection({ compact = false }) {
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
    <div className={`tutorial-section${compact ? " tutorial-section--compact" : ""}`} id="tutorials">
      <div className="tutorial-section__inner">
        <div className="tutorial-section__content">
          <span className="tutorial-section__code">TUTORIALS</span>
          <h2 className="tutorial-section__title">{t(section.title, lang)}</h2>
          <p className="tutorial-section__subtitle">{t(section.subtitle, lang)}</p>
          <p className="tutorial-section__desc">{t(section.description, lang)}</p>
        </div>

        <div className="tutorial-section__actions">
          <ExternalLinkButton href={douyin}>
            {t(section.douyinButton, lang)}
          </ExternalLinkButton>
          <ExternalLinkButton href={wechatVideo} variant="secondary">
            {t(section.wechatVideoButton, lang)}
          </ExternalLinkButton>
          {douyinSelf && (
            <p className="tutorial-section__hint">{getUiText("douyinDraftHint", lang)}</p>
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
    </div>
  );
}
