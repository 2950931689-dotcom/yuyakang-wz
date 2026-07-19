import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getNavLabel, getSiteDisplayName } from "../../lib/content";
import { originFromEvent } from "../../lib/motion";
import LanguageSwitch from "./LanguageSwitch";
import ThemeSwitch from "./ThemeSwitch";
import LogoLink from "./LogoLink";
import NavSignalLink from "./NavSignalLink";
import WechatQrModal from "../contact/WechatQrModal";

const NAV_KEYS = [
  ["home", "/"],
  ["cases", "/cases"],
  ["about", "/about"],
  ["services", "/services"],
  ["booking", "/booking"],
  ["contact", "/contact"],
];

export default function MobileNav({ open, onClose }) {
  const { content } = useContent();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!content) return null;

  return (
    <div className={`mobile-nav ${open ? "open" : ""}`} aria-hidden={!open}>
      <button type="button" className="mobile-nav__backdrop" aria-label="关闭菜单" onClick={onClose} />
      <div className="mobile-nav__panel">
        <div className="mobile-nav__head">
          <LogoLink onNavigate={onClose}>{getSiteDisplayName(content, "en")}</LogoLink>
          <button type="button" className="header__menu-btn" aria-label="关闭" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <LanguageSwitch />
        <ThemeSwitch className="theme-switch--mobile" />
        <nav className="mobile-nav__links" aria-label="手机导航">
          {NAV_KEYS.map(([key, path]) => (
            <NavSignalLink key={key} to={path} end={path === "/"} onClick={onClose}>
              {getNavLabel(content, key, lang)}
            </NavSignalLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function MobileCta() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrOrigin, setQrOrigin] = useState(null);

  const openQr = useCallback((event) => {
    setQrOrigin(originFromEvent(event));
    setQrOpen(true);
  }, []);

  if (!content) return null;

  return (
    <>
      <div className="mobile-cta">
        <button type="button" className="mobile-cta__btn" onClick={openQr}>
          {lang === "cn" ? "微信咨询" : "WeChat"}
        </button>
        <Link to="/booking" className="mobile-cta__btn mobile-cta__btn--primary">
          {lang === "cn" ? "提交需求" : "Book"}
        </Link>
      </div>
      <WechatQrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        content={content}
        originRect={qrOrigin}
      />
    </>
  );
}
