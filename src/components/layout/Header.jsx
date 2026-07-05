import { Menu } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getNavLabel } from "../../lib/content";
import LanguageSwitch from "./LanguageSwitch";
import ThemeSwitch from "./ThemeSwitch";
import LogoLink from "./LogoLink";
import NavSignalLink from "./NavSignalLink";

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
        <LogoLink>{content.siteSettings.siteName.en}</LogoLink>
        <nav className="header__nav" aria-label="主导航">
          {NAV_KEYS.map(([key, path]) => (
            <NavSignalLink key={key} to={path} end={path === "/"}>
              {getNavLabel(content, key, lang)}
            </NavSignalLink>
          ))}
        </nav>
        <div className="header__actions">
          <LanguageSwitch />
          <ThemeSwitch />
          <button
            type="button"
            className="header__menu-btn"
            aria-label="打开菜单"
            onClick={onMenuOpen}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
