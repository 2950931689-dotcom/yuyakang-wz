import { useCallback, useState } from "react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../lib/content";
import { originFromEvent } from "../lib/motion";
import ContactConsole from "../components/contact/ContactConsole";
import AuxChannels from "../components/contact/AuxChannels";
import CommunicationPatchBay from "../components/contact/CommunicationPatchBay";
import WeChatSignalCard from "../components/contact/WeChatSignalCard";
import CommonTools from "../components/contact/CommonTools";
import ProjectMaterialChecklist from "../components/contact/ProjectMaterialChecklist";
import ContactOutputCta from "../components/contact/ContactOutputCta";
import WechatQrModal from "../components/contact/WechatQrModal";
import LoadingState from "../components/ui/LoadingState";

export default function ContactPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrOrigin, setQrOrigin] = useState(null);

  const openQr = useCallback((event) => {
    setQrOrigin(originFromEvent(event));
    setQrOpen(true);
  }, []);

  const closeQr = useCallback(() => {
    setQrOpen(false);
  }, []);

  if (loading || !content) return <LoadingState />;

  const ci = content.i18n.contact;

  return (
    <div className="page contact-page fade-in">
      <div className="contact-page__inner container">
        <ContactConsole content={content} lang={lang} t={t} />
        <AuxChannels content={content} lang={lang} ci={ci} />
        <CommunicationPatchBay
          content={content}
          lang={lang}
          t={t}
          ci={ci}
          onOpenQr={openQr}
        />
        <WeChatSignalCard
          content={content}
          lang={lang}
          t={t}
          ci={ci}
          onOpenQr={openQr}
        />
        <CommonTools content={content} lang={lang} />
        <ProjectMaterialChecklist />
        <ContactOutputCta lang={lang} bookLabel={t(ci.bookNow, lang)} />
      </div>

      <WechatQrModal
        open={qrOpen}
        onClose={closeQr}
        content={content}
        originRect={qrOrigin}
      />
    </div>
  );
}
