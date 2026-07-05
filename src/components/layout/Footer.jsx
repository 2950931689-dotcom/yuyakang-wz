import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/content";

export default function Footer() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <div className="footer__brand">{content.siteSettings.siteName.en}</div>
          <div className="footer__tagline">{t(content.siteSettings.tagline, lang)}</div>
        </div>
        <div className="footer__copy">
          © {new Date().getFullYear()} {t(content.profile.name, lang)} ·{" "}
          {t(content.socialLinks.location, lang)}
        </div>
      </div>
    </footer>
  );
}
