import { useLanguage } from "../../context/LanguageContext";
import { getWechatQr, t } from "../../lib/content";

export default function WechatQr({ content, caption, interactive = false, onOpen }) {
  const { lang } = useLanguage();
  const src = getWechatQr(content);
  const alt = lang === "cn" ? "微信二维码" : "WeChat QR Code";
  const hint = lang === "cn" ? "点击查看大图" : "Tap to enlarge";

  const inner = (
    <>
      <img src={src} alt={alt} loading="eager" />
      <p>{caption || t(content.i18n?.booking?.addWeChat, lang)}</p>
      {interactive && <span className="wechat-qr__hint">{hint}</span>}
    </>
  );

  if (interactive && onOpen) {
    return (
      <button type="button" className="wechat-qr wechat-qr--interactive" onClick={onOpen} aria-label={alt}>
        {inner}
      </button>
    );
  }

  return <div className="wechat-qr">{inner}</div>;
}
