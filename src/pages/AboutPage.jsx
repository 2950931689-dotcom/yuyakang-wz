import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getVisibleCertificates, getWorkPhotos } from "../lib/content";
import { buildWorkPhotoItems } from "../lib/media";
import { useMediaLightbox } from "../context/MediaLightboxContext";
import EngineerIdentity from "../components/about/EngineerIdentity";
import CertificationRack from "../components/about/CertificationRack";
import SignalIdentity from "../components/about/SignalIdentity";
import ControlSurface from "../components/about/ControlSurface";
import FieldRecord from "../components/about/FieldRecord";
import WorkPhilosophy from "../components/about/WorkPhilosophy";
import ProfileArchive from "../components/about/ProfileArchive";
import AboutCTA from "../components/about/AboutCTA";
import LoadingState from "../components/ui/LoadingState";

export default function AboutPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const { openLightbox } = useMediaLightbox();

  if (loading || !content) return <LoadingState />;

  const profile = content.profile ?? {
    name: { cn: "余雅康", en: "Yu Yakang" },
    title: { cn: "", en: "" },
    bio: { cn: "", en: "" },
  };
  const certs = getVisibleCertificates(content);
  const workPhotos = getWorkPhotos(content);
  const workItems = buildWorkPhotoItems(workPhotos, lang);

  return (
    <div className="page about-page fade-in">
      <div className="about-page__inner container">
        <EngineerIdentity content={content} profile={profile} lang={lang} />
        <CertificationRack certificates={certs} lang={lang} />
        <SignalIdentity content={content} lang={lang} />
        <ControlSurface content={content} lang={lang} />
        <FieldRecord
          workPhotos={workPhotos}
          workItems={workItems}
          lang={lang}
          openLightbox={openLightbox}
        />
        <WorkPhilosophy lang={lang} />
        <ProfileArchive profile={profile} lang={lang} />
        <AboutCTA />
      </div>
    </div>
  );
}
