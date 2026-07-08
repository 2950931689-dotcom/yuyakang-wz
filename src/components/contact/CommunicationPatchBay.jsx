import { useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";
import BookingSignalMeter from "../booking/BookingSignalMeter";
import { PATCH_CHANNELS, getContactChannels } from "../../lib/contactContent";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";

function isChannelConfigured(patchId, channels) {
  if (patchId === "wechat") return !!(channels.wechatId);
  if (patchId === "phone") return !!channels.phone;
  if (patchId === "email") return !!channels.email;
  return true;
}

export default function CommunicationPatchBay({
  content,
  lang,
  t,
  ci,
  onOpenQr,
}) {
  const [activeId, setActiveId] = useState(null);
  const { copy, feedback } = useCopyFeedback(lang);
  const channels = getContactChannels(content);

  const handleCopy = async (id, text) => {
    if (text) await copy(id, text);
  };

  const missingHint =
    lang === "cn"
      ? "请在后台联系方式中补充该通道信息。"
      : "Add this channel in admin contact settings.";

  return (
    <section className="contact-section contact-patch-bay">
      <SectionTitle
        sectionIndex={3}
        eyebrow="PRIMARY PATCH BAY"
        title={lang === "cn" ? "主接入面板" : "Primary Patch Bay"}
      />

      <p className="contact-patch-bay__cms-note">
        {lang === "cn"
          ? "联系方式来自后台 CMS；启用复制按钮需补充微信号、电话或邮箱。"
          : "Contact channels come from CMS — add WeChat ID, phone or email in admin to enable copy."}
      </p>

      <div className="contact-patch-bay__grid">
        {PATCH_CHANNELS.map((patch, i) => {
          const isActive = activeId === patch.id;
          let value = "";
          if (patch.id === "phone") value = channels.phone;
          if (patch.id === "email") value = channels.email;
          if (patch.id === "wechat") value = channels.wechatId;

          const configured =
            patch.id === "booking" || isChannelConfigured(patch.id, channels);
          const statusLabel = configured ? patch.status : "CHANNEL NOT CONFIGURED";

          return (
            <article
              key={patch.id}
              className={`contact-patch${isActive ? " is-active" : ""}${!configured ? " is-unconfigured" : ""}`}
              onMouseEnter={() => setActiveId(patch.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <div className="contact-patch__head">
                <span className="contact-patch__point" aria-hidden="true" />
                <span className="contact-patch__code">PATCH {patch.code}</span>
                <BookingSignalMeter level={configured ? 60 + i * 8 : 24} active={isActive && configured} />
              </div>
              <h3 className="contact-patch__label">{patch.label}</h3>
              <span className="contact-patch__status">{statusLabel}</span>
              <p className="contact-patch__desc">{patch.desc[lang]}</p>
              {!configured && patch.id !== "booking" && (
                <p className="contact-patch__configure-hint">{missingHint}</p>
              )}
              {value && (
                <p className="contact-patch__value">{value}</p>
              )}
              <div className="contact-patch__actions">
                {patch.id === "wechat" && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      className="btn--sm"
                      disabled={!channels.wechatId}
                      onClick={() => channels.wechatId && handleCopy("wechat", channels.wechatId)}
                    >
                      {channels.wechatId
                        ? feedback("wechat") || (lang === "cn" ? "复制微信号" : "Copy WeChat ID")
                        : lang === "cn"
                          ? "暂未配置"
                          : "Not configured"}
                    </Button>
                    <Button type="button" variant="secondary" className="btn--sm" onClick={onOpenQr}>
                      {lang === "cn" ? "查看二维码" : "View QR Code"}
                    </Button>
                  </>
                )}
                {patch.id === "phone" && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      className="btn--sm"
                      disabled={!channels.phone}
                      onClick={() => channels.phone && handleCopy("phone", channels.phone)}
                    >
                      {channels.phone
                        ? feedback("phone") || (lang === "cn" ? "复制电话" : "Copy Phone")
                        : lang === "cn"
                          ? "暂未配置"
                          : "Not configured"}
                    </Button>
                    {channels.phone && (
                      <Button as="a" href={`tel:${channels.phone}`} variant="ghost" className="btn--sm">
                        {lang === "cn" ? "拨打电话" : "Call"}
                      </Button>
                    )}
                  </>
                )}
                {patch.id === "email" && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      className="btn--sm"
                      disabled={!channels.email}
                      onClick={() => channels.email && handleCopy("email", channels.email)}
                    >
                      {channels.email
                        ? feedback("email") || (lang === "cn" ? "复制邮箱" : "Copy Email")
                        : lang === "cn"
                          ? "暂未配置"
                          : "Not configured"}
                    </Button>
                    {channels.email && (
                      <Button as="a" href={`mailto:${channels.email}`} variant="ghost" className="btn--sm">
                        {lang === "cn" ? "发送邮件" : "Send Email"}
                      </Button>
                    )}
                  </>
                )}
                {patch.id === "booking" && (
                  <Button as={Link} to="/booking" className="btn--sm">
                    {t(ci.bookNow, lang)}
                  </Button>
                )}
              </div>
              <span className="contact-patch__scan" aria-hidden="true" />
            </article>
          );
        })}
      </div>
    </section>
  );
}
