import HeroSection from "../components/home/HeroSection";
import HomeProfileSection from "../components/home/HomeProfileSection";
import ServicePreview from "../components/home/ServicePreview";
import FeaturedCases from "../components/home/FeaturedCases";
import VideoHighlights from "../components/home/VideoHighlights";
import WorkflowSection from "../components/home/WorkflowSection";
import SoundIssueSection from "../components/home/SoundIssueSection";
import TutorialSection from "../components/home/TutorialSection";
import BookingCTA from "../components/home/BookingCTA";
import SectionTitle from "../components/ui/SectionTitle";
import Reveal from "../components/ui/Reveal";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getHomeSection } from "../lib/cmsBinding";
import { t } from "../lib/content";

/**
 * Round 7.7 homepage DOM order (PC visual = source order):
 * Hero → 01 profile+certs → live → mixing → 04 social video
 * → 05 workflow → 06 sound check → services → conversion CTA
 *
 * Hero stays static; below-fold sections use scroll Reveal (not route stagger).
 */
export default function HomePage() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const servicesChrome = getHomeSection(content, "services");

  return (
    <>
      <HeroSection />
      <div className="home-sections-flow">
        <Reveal
          as="section"
          className="section container home-section home-section--profile"
          id="profile"
          delay={0}
        >
          <HomeProfileSection />
        </Reveal>

        <Reveal
          as="section"
          className="section container home-section home-section--live-cases"
          id="live-cases"
          delay={40}
        >
          <FeaturedCases variant="live" sectionIndex={2} />
        </Reveal>

        <Reveal
          as="section"
          className="section container home-section home-section--mixing-cases"
          id="mixing-cases"
          delay={40}
        >
          <FeaturedCases variant="mixing" sectionIndex={3} />
        </Reveal>

        <VideoHighlights />

        <Reveal
          as="section"
          className="section section--tight container home-section home-section--process"
          id="process"
          delay={40}
        >
          <WorkflowSection />
        </Reveal>

        <Reveal
          as="section"
          className="section container home-section home-section--sound-check"
          id="sound-check"
          delay={40}
        >
          <SoundIssueSection />
        </Reveal>

        <Reveal
          as="section"
          className="section container home-section home-section--services"
          id="services"
          delay={40}
        >
          <SectionTitle
            sectionIndex={7}
            eyebrow={t(servicesChrome.eyebrow, lang) || "SERVICES"}
            title={t(servicesChrome.title, lang)}
            subtitle={t(servicesChrome.subtitle, lang)}
          />
          <ServicePreview />
        </Reveal>

        <Reveal
          as="section"
          className="home-conversion-zone container home-section home-section--conversion"
          id="conversion"
          delay={60}
        >
          <BookingCTA compact />
          <TutorialSection compact />
        </Reveal>
      </div>
    </>
  );
}
