import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getDouyinUrl,
  getServiceArea,
  getSiteLocation,
  getLocationDisplay,
  getUiText,
  isDouyinSelfLink,
  t,
} from "../lib/content";
import ContactRoutingHero from "../components/contact/ContactRoutingHero";
import CommunicationPatchBay from "../components/contact/CommunicationPatchBay";
import WeChatSignalCard from "../components/contact/WeChatSignalCard";
import ContactSignalTimeline from "../components/contact/ContactSignalTimeline";
import ProjectMaterialChecklist from "../components/contact/ProjectMaterialChecklist";
import ContactOutputCta from "../components/contact/ContactOutputCta";
import WechatQrModal from "../components/contact/WechatQrModal";
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
    <div className="page contact-page fade-in">
      <div className="contact-page__inner container">
        <ContactRoutingHero content={content} lang={lang} t={t} />
        <CommunicationPatchBay
          content={content}
          lang={lang}
          t={t}
          ci={ci}
          onOpenQr={() => setQrOpen(true)}
        />
        <WeChatSignalCard
          content={content}
          lang={lang}
          t={t}
          ci={ci}
          onOpenQr={() => setQrOpen(true)}
        />
        <ContactSignalTimeline lang={lang} />
        <ProjectMaterialChecklist lang={lang} />
        <ContactOutputCta lang={lang} bookLabel={t(ci.bookNow, lang)} />

        <section className="contact-section contact-archive" aria-label={lang === "cn" ? "补充联系信息" : "Additional contact"}>
          <span className="contact-archive__code">AUX CHANNELS</span>
          <div className="contact-archive__identity">
            <span className="code-label">{content.siteSettings.siteName.en}</span>
            <h2 className="contact-archive__name">{t(content.profile.name, lang)}</h2>
            <p className="contact-archive__role">{t(content.profile.title, lang)}</p>
          </div>

          {display.showOnContact && (
            <dl className="contact-archive__meta">
              <div className="contact-archive__meta-row">
                <dt>{t(ci.location, lang)}</dt>
                <dd>{t(location, lang)}</dd>
              </div>
              <div className="contact-archive__meta-row">
                <dt>{lang === "cn" ? "服务范围" : "Service Area"}</dt>
                <dd>{t(serviceArea, lang)}</dd>
              </div>
            </dl>
          )}

          <div className="contact-archive__social">
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
        </section>
      </div>

      <WechatQrModal open={qrOpen} onClose={() => setQrOpen(false)} content={content} />
    </div>
  );
}
