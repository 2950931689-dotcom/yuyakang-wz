import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getNavLabel } from "../../lib/content";
import LanguageSwitch from "./LanguageSwitch";
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
      <button type="button" className="mobile-nav__backdrop" aria-label="Close menu" onClick={onClose} />
      <div className="mobile-nav__panel">
        <div className="mobile-nav__head">
          <span className="header__logo">{content.siteSettings.siteName.en}</span>
          <button type="button" className="header__menu-btn" aria-label="Close" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <LanguageSwitch />
        <nav className="mobile-nav__links" aria-label="Mobile">
          {NAV_KEYS.map(([key, path]) => (
            <NavLink key={key} to={path} end={path === "/"} onClick={onClose}>
              {getNavLabel(content, key, lang)}
            </NavLink>
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

  if (!content) return null;

  return (
    <>
      <div className="mobile-cta">
        <button type="button" className="mobile-cta__btn" onClick={() => setQrOpen(true)}>
          {lang === "cn" ? "微信咨询" : "WeChat"}
        </button>
        <Link to="/booking" className="mobile-cta__btn mobile-cta__btn--primary">
          {lang === "cn" ? "提交需求" : "Book"}
        </Link>
      </div>
      <WechatQrModal open={qrOpen} onClose={() => setQrOpen(false)} content={content} />
    </>
  );
}
