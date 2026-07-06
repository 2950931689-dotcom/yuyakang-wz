import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getVisibleCertificates, getWorkPhotos, t } from "../lib/content";
import { buildWorkPhotoItems } from "../lib/media";
import { useMediaLightbox } from "../context/MediaLightboxContext";
import EngineerIdentity from "../components/about/EngineerIdentity";
import SignalIdentity from "../components/about/SignalIdentity";
import ControlSurface from "../components/about/ControlSurface";
import ExperienceTimeline from "../components/about/ExperienceTimeline";
import ToolRack from "../components/about/ToolRack";
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
        <EngineerIdentity profile={profile} lang={lang} />
        <SignalIdentity lang={lang} />
        <ControlSurface lang={lang} />
        <ExperienceTimeline profile={profile} lang={lang} />
        <ToolRack certificates={certs} profile={profile} lang={lang} />
        <WorkPhilosophy lang={lang} />
        <ProfileArchive
          profile={profile}
          certs={certs}
          workPhotos={workPhotos}
          workItems={workItems}
          lang={lang}
          openLightbox={openLightbox}
        />
        <AboutCTA />
      </div>
    </div>
  );
}
