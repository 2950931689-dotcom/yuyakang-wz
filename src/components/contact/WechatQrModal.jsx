import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getWechatQr, t } from "../../lib/content";
import {
  MOTION,
  morphFromOrigin,
  prefersReducedMotion,
} from "../../lib/motion";

/**
 * Viewport-fixed WeChat QR dialog (ported to document.body so route-transition
 * transforms do not trap position:fixed).
 * Expand Open: panel morphs from trigger originRect → centered card.
 */
export default function WechatQrModal({ open, onClose, content, originRect = null }) {
  const { lang } = useLanguage();
  const panelRef = useRef(null);
  const originRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | enter | settled | leave
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (open) {
      originRef.current = originRect;
      setMounted(true);
      setPhase("enter");
      return undefined;
    }
    setPhase((prev) => (prev === "idle" ? prev : "leave"));
    return undefined;
  }, [open, originRect]);

  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!mounted || !panel) return undefined;

    const clearInline = () => {
      panel.style.transition = "";
      panel.style.transform = "";
      panel.style.opacity = "";
    };

    if (phase === "enter") {
      if (reduced || !originRef.current) {
        clearInline();
        setPhase("settled");
        return undefined;
      }

      const final = panel.getBoundingClientRect();
      const morph = morphFromOrigin(originRef.current, final);
      if (!morph) {
        setPhase("settled");
        return undefined;
      }

      panel.style.transition = "none";
      panel.style.transform = `translate(${morph.dx}px, ${morph.dy}px) scale(${morph.sx}, ${morph.sy})`;
      panel.style.opacity = "0.88";

      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          panel.style.transition = [
            `transform ${MOTION.overlayExpandMs}ms var(--motion-ease)`,
            `opacity ${MOTION.overlayExpandMs}ms var(--motion-ease)`,
          ].join(", ");
          panel.style.transform = "translate(0, 0) scale(1)";
          panel.style.opacity = "1";
          setPhase("settled");
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    if (phase === "leave") {
      const finish = () => {
        clearInline();
        setMounted(false);
        setPhase("idle");
        originRef.current = null;
      };

      if (reduced || !originRef.current) {
        panel.style.transition = `opacity ${MOTION.overlayCollapseMs}ms ease`;
        panel.style.opacity = "0";
        const t = window.setTimeout(finish, MOTION.overlayCollapseMs);
        return () => window.clearTimeout(t);
      }

      const final = panel.getBoundingClientRect();
      const morph = morphFromOrigin(originRef.current, final);
      if (!morph) {
        finish();
        return undefined;
      }

      panel.style.transition = [
        `transform ${MOTION.overlayCollapseMs}ms var(--motion-ease)`,
        `opacity ${MOTION.overlayCollapseMs}ms var(--motion-ease)`,
      ].join(", ");
      panel.style.transform = `translate(${morph.dx}px, ${morph.dy}px) scale(${morph.sx}, ${morph.sy})`;
      panel.style.opacity = "0";
      const t = window.setTimeout(finish, MOTION.overlayCollapseMs + 20);
      return () => window.clearTimeout(t);
    }

    return undefined;
  }, [phase, mounted, reduced]);

  if (!mounted || !content || typeof document === "undefined") return null;

  const caption = lang === "cn" ? "扫码添加微信" : "Scan to add on WeChat";
  const closeLabel = lang === "cn" ? "关闭" : "Close";
  const showOpen = phase === "enter" || phase === "settled" || phase === "leave";

  return createPortal(
    <div
      className={[
        "modal",
        "modal--expand-open",
        showOpen && "open",
        phase === "enter" && "modal--enter",
        phase === "settled" && "modal--settled",
        phase === "leave" && "modal--leave",
        reduced && "modal--reduced",
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={caption}
    >
      <button
        type="button"
        className="modal__backdrop"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="modal__panel"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
        <img src={getWechatQr(content)} alt={caption} />
        <p>{caption}</p>
        {content.i18n?.booking?.addWeChat && (
          <p className="modal__hint">{t(content.i18n.booking.addWeChat, lang)}</p>
        )}
      </div>
    </div>,
    document.body
  );
}
