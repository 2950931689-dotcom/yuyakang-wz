import { useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getWechatQr, t } from "../../lib/content";

export default function WechatQrModal({ open, onClose, content }) {
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

  if (!open || !content) return null;

  const caption =
    lang === "cn" ? "扫码添加微信" : "Scan to add on WeChat";

  return (
    <div className="modal open" role="dialog" aria-modal="true" aria-label={caption}>
      <button type="button" className="modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal__panel">
        <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
          <X size={18} strokeWidth={1.5} />
        </button>
        <img src={getWechatQr(content)} alt={caption} />
        <p>{caption}</p>
        {content.i18n?.booking?.addWeChat && (
          <p className="modal__hint">{t(content.i18n.booking.addWeChat, lang)}</p>
        )}
      </div>
    </div>
  );
}
