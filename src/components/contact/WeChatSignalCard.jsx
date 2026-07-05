import SectionTitle from "../ui/SectionTitle";
import { getWechatQr } from "../../lib/content";
import {
  WECHAT_MESSAGE_TEMPLATE,
  isWechatQrConfigured,
} from "../../lib/contactContent";

export default function WeChatSignalCard({ content, lang, t, ci, onOpenQr }) {
  const configured = isWechatQrConfigured(content);
  const src = configured ? getWechatQr(content) : null;
  const template = WECHAT_MESSAGE_TEMPLATE[lang];

  return (
    <section className="contact-section contact-wechat-card">
      <SectionTitle
        sectionIndex={2}
        eyebrow="WECHAT SIGNAL"
        title={lang === "cn" ? "微信优先沟通" : "WeChat Priority Channel"}
      />

      <div className="contact-wechat-card__frame">
        <div className="contact-wechat-card__screen">
          <div className="contact-wechat-card__screen-head">
            <span>SCAN TO CONNECT</span>
            <span className="contact-wechat-card__ready">SIGNAL READY</span>
          </div>

          {configured && src ? (
            <button
              type="button"
              className="contact-wechat-card__qr"
              onClick={onOpenQr}
              aria-label={t(ci.wechatQr, lang)}
            >
              <img src={src} alt={t(ci.wechatQr, lang)} loading="eager" />
              <span className="contact-wechat-card__scanline" aria-hidden="true" />
            </button>
          ) : (
            <div className="contact-wechat-card__empty">
              <span className="contact-wechat-card__empty-code">QR SIGNAL NOT CONFIGURED</span>
              <p>{lang === "cn" ? "请在后台上传微信二维码" : "Upload WeChat QR in admin"}</p>
            </div>
          )}
        </div>

        <div className="contact-wechat-card__guide">
          <p className="contact-wechat-card__lead">
            {lang === "cn"
              ? "扫码添加微信，发送场地信息、设备清单、项目时间、现场视频或参考案例。"
              : "Scan to add on WeChat — send venue info, gear list, timeline, site video or references."}
          </p>
          <div className="contact-wechat-card__template">
            <span className="contact-wechat-card__template-label">
              {lang === "cn" ? "发送时可以直接按这个格式：" : "Suggested message format:"}
            </span>
            <ol className="contact-wechat-card__template-list">
              {template.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
