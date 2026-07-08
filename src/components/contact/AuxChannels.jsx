import { Link } from "react-router-dom";
import { getDouyinUrl, getUiText, isDouyinSelfLink, t } from "../../lib/content";
import ExternalLinkButton from "../ui/ExternalLinkButton";
import Button from "../ui/Button";

export default function AuxChannels({ content, lang, ci }) {
  const social = content.socialLinks ?? {};
  const douyin = getDouyinUrl(social);
  const douyinSelf = isDouyinSelfLink(douyin);

  const channels = [
    {
      id: "wechat-video",
      label: t(ci.wechatVideo, lang),
      href: social.wechatVideoUrl,
      external: true,
    },
    {
      id: "douyin",
      label: t(ci.douyin, lang),
      href: douyin,
      external: true,
    },
  ].filter((ch) => ch.href?.trim());

  return (
    <section className="contact-section aux-channels" aria-label={lang === "cn" ? "辅助输出通道" : "Aux channels"}>
      <header className="aux-channels__head">
        <span className="aux-channels__code">AUX CHANNELS</span>
        <h2 className="aux-channels__title">
          {lang === "cn" ? "辅助输出通道" : "Aux Output Channels"}
        </h2>
        <p className="aux-channels__desc">
          {lang === "cn"
            ? "视频号、抖音与代表案例入口，用于快速了解现场风格与项目类型。"
            : "WeChat Channel, Douyin and featured cases for quick reference."}
        </p>
      </header>

      <div className="aux-channels__grid">
        {channels.map((ch, i) => (
          <ExternalLinkButton
            key={ch.id}
            href={ch.href}
            variant="secondary"
            className="aux-channels__btn"
          >
            <span className="aux-channels__btn-code">
              AUX {String(i + 1).padStart(2, "0")}
            </span>
            <span className="aux-channels__btn-label">{ch.label}</span>
          </ExternalLinkButton>
        ))}

        <Button as={Link} to="/cases" variant="secondary" className="aux-channels__btn aux-channels__btn--internal">
          <span className="aux-channels__btn-code">AUX {String(channels.length + 1).padStart(2, "0")}</span>
          <span className="aux-channels__btn-label">
            {lang === "cn" ? "代表案例" : "Featured Cases"}
          </span>
        </Button>

        <Button as={Link} to="/booking" variant="secondary" className="aux-channels__btn aux-channels__btn--internal">
          <span className="aux-channels__btn-code">
            AUX {String(channels.length + 2).padStart(2, "0")}
          </span>
          <span className="aux-channels__btn-label">
            {lang === "cn" ? "预约项目" : "Book Project"}
          </span>
        </Button>
      </div>

      {douyinSelf && (
        <p className="contact-hint aux-channels__hint">{getUiText("douyinDraftHint", lang)}</p>
      )}

      {channels.length === 0 && (
        <p className="aux-channels__empty">
          {lang === "cn" ? "社交链接尚未配置，可通过下方 Patch Bay 直接联系。" : "Social links not configured — use Patch Bay below."}
        </p>
      )}
    </section>
  );
}
