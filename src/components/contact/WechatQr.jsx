import { useLanguage } from "../../context/LanguageContext";
import { getWechatQr, t } from "../../lib/content";

export default function WechatQr({ content, caption }) {
  const { lang } = useLanguage();
  const src = getWechatQr(content);

  return (
    <div className="wechat-qr">
      <img src={src} alt={lang === "cn" ? "微信二维码" : "WeChat QR Code"} loading="eager" />
      <p>{caption || t(content.i18n?.booking?.addWeChat, lang)}</p>
    </div>
  );
}
