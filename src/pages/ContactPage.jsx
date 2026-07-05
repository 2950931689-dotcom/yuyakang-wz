import { useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getDouyinUrl, getServiceArea, getSiteLocation, getLocationDisplay, getUiText, isDouyinSelfLink, t } from "../lib/content";
import WechatQr from "../components/contact/WechatQr";
import WechatQrModal from "../components/contact/WechatQrModal";
import Button from "../components/ui/Button";
import ExternalLinkButton from "../components/ui/ExternalLinkButton";
import LoadingState from "../components/ui/LoadingState";

export default function ContactPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const [qrOpen, setQrOpen] = useState(false);

  if (loading || !content) return <LoadingState />;

  const ci = content.i18n.contact;
  const social = content.socialLinks;
  const douyin = getDouyinUrl(social);
  const douyinSelf = isDouyinSelfLink(douyin);
  const display = getLocationDisplay(content);
  const location = getSiteLocation(content);
  const serviceArea = getServiceArea(content);

  return (
    <div className="page container fade-in">
      <h1 className="page-title">{t(ci.title, lang)}</h1>
      <p className="page-lead">{t(social.contactNote, lang)}</p>

      <div className="contact-panel">
        <div className="contact-panel__main">
          <div className="prose-block">
            <h3>{content.siteSettings.siteName.en}</h3>
            <p>
              {t(content.profile.name, lang)}
              <br />
              {t(content.profile.title, lang)}
              {display.showOnContact && (
                <>
                  <br />
                  {t(ci.location, lang)}：{t(location, lang)}
                  <br />
                  {t(serviceArea, lang)}
                </>
              )}
            </p>
          </div>

          <div className="contact-social">
            <ExternalLinkButton href={social.wechatVideoUrl} variant="secondary" className="contact-social__btn">
              {t(ci.wechatVideo, lang)}
            </ExternalLinkButton>
            <ExternalLinkButton href={douyin} variant="secondary" className="contact-social__btn">
              {t(ci.douyin, lang)}
            </ExternalLinkButton>
          </div>

          {douyinSelf && (
            <p className="contact-hint">{getUiText("douyinDraftHint", lang)}</p>
          )}

          <div className="contact-panel__booking">
            <Button as={Link} to="/booking">{t(ci.bookNow, lang)}</Button>
          </div>
        </div>

        <div className="contact-panel__qr">
          <WechatQr
            content={content}
            caption={t(ci.wechatQr, lang)}
            interactive
            onOpen={() => setQrOpen(true)}
          />
        </div>
      </div>

      <WechatQrModal open={qrOpen} onClose={() => setQrOpen(false)} content={content} />
    </div>
  );
}
