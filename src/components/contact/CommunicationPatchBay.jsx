import { useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";
import BookingSignalMeter from "../booking/BookingSignalMeter";
import { PATCH_CHANNELS, getContactChannels } from "../../lib/contactContent";
import { useCopyFeedback } from "../../hooks/useCopyFeedback";

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

  return (
    <section className="contact-section contact-patch-bay">
      <SectionTitle
        sectionIndex={1}
        eyebrow="COMMUNICATION PATCH BAY"
        title={lang === "cn" ? "沟通接入面板" : "Communication Patch Bay"}
      />

      <div className="contact-patch-bay__grid">
        {PATCH_CHANNELS.map((patch, i) => {
          const isActive = activeId === patch.id;
          let value = "";
          if (patch.id === "phone") value = channels.phone;
          if (patch.id === "email") value = channels.email;
          if (patch.id === "wechat") value = channels.wechatId;

          return (
            <article
              key={patch.id}
              className={`contact-patch${isActive ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(patch.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <div className="contact-patch__head">
                <span className="contact-patch__point" aria-hidden="true" />
                <span className="contact-patch__code">PATCH {patch.code}</span>
                <BookingSignalMeter level={60 + i * 8} active={isActive} />
              </div>
              <h3 className="contact-patch__label">{patch.label}</h3>
              <span className="contact-patch__status">{patch.status}</span>
              <p className="contact-patch__desc">{patch.desc[lang]}</p>
              {value && (
                <p className="contact-patch__value">{value}</p>
              )}
              <div className="contact-patch__actions">
                {patch.id === "wechat" && (
                  <>
                    {channels.wechatId && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="btn--sm"
                        onClick={() => handleCopy("wechat", channels.wechatId)}
                      >
                        {feedback("wechat") || (lang === "cn" ? "复制微信号" : "Copy WeChat ID")}
                      </Button>
                    )}
                    <Button type="button" variant="secondary" className="btn--sm" onClick={onOpenQr}>
                      {lang === "cn" ? "查看二维码" : "View QR Code"}
                    </Button>
                  </>
                )}
                {patch.id === "phone" && (
                  <>
                    {channels.phone ? (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          className="btn--sm"
                          onClick={() => handleCopy("phone", channels.phone)}
                        >
                          {feedback("phone") || (lang === "cn" ? "复制电话" : "Copy Phone")}
                        </Button>
                        <Button as="a" href={`tel:${channels.phone}`} variant="ghost" className="btn--sm">
                          {lang === "cn" ? "拨打电话" : "Call"}
                        </Button>
                      </>
                    ) : (
                      <span className="contact-patch__empty">
                        {lang === "cn" ? "电话未配置" : "Phone not configured"}
                      </span>
                    )}
                  </>
                )}
                {patch.id === "email" && (
                  <>
                    {channels.email ? (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          className="btn--sm"
                          onClick={() => handleCopy("email", channels.email)}
                        >
                          {feedback("email") || (lang === "cn" ? "复制邮箱" : "Copy Email")}
                        </Button>
                        <Button as="a" href={`mailto:${channels.email}`} variant="ghost" className="btn--sm">
                          {lang === "cn" ? "发送邮件" : "Send Email"}
                        </Button>
                      </>
                    ) : (
                      <span className="contact-patch__empty">
                        {lang === "cn" ? "邮箱未配置" : "Email not configured"}
                      </span>
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
