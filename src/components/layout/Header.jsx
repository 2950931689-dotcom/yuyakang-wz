import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getNavLabel } from "../../lib/content";
import LanguageSwitch from "./LanguageSwitch";

const NAV_KEYS = [
  ["home", "/"],
  ["cases", "/cases"],
  ["about", "/about"],
  ["services", "/services"],
  ["booking", "/booking"],
  ["contact", "/contact"],
];

export default function Header({ onMenuOpen }) {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          {content.siteSettings.siteName.en}
        </Link>
        <nav className="header__nav" aria-label="Main">
          {NAV_KEYS.map(([key, path]) => (
            <NavLink key={key} to={path} end={path === "/"}>
              {getNavLabel(content, key, lang)}
            </NavLink>
          ))}
        </nav>
        <div className="header__actions">
          <LanguageSwitch />
          <button
            type="button"
            className="header__menu-btn"
            aria-label="Open menu"
            onClick={onMenuOpen}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
