import HeroSection from "../components/home/HeroSection";
import CredentialsSection from "../components/home/CredentialsSection";
import HomeMobileCertificates from "../components/home/HomeMobileCertificates";
import ServicePreview from "../components/home/ServicePreview";
import FeaturedCases from "../components/home/FeaturedCases";
import VideoHighlights from "../components/home/VideoHighlights";
import WorkflowSection from "../components/home/WorkflowSection";
import SoundIssueSection from "../components/home/SoundIssueSection";
import TutorialSection from "../components/home/TutorialSection";
import BookingCTA from "../components/home/BookingCTA";
import SectionTitle from "../components/ui/SectionTitle";
import { useLanguage } from "../context/LanguageContext";

/**
 * Round 7.1 homepage DOM order (PC visual = source order):
 * Hero → credentials → certificates(mobile) → featured cases → video
 * → workflow → sound check → services(deferred) → conversion CTA
 *
 * Mobile visual order is controlled by CSS flex order in mobile.css.
 */
export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <>
      <HeroSection />
      <div className="home-sections-flow">
        <section
          className="section container section-reveal home-section home-section--credentials-text home-mobile-hide"
          id="credentials"
        >
          <CredentialsSection />
        </section>

        <section
          className="section container section-reveal home-section home-section--certificates mobile-only-block"
          id="home-certificates"
          aria-label={lang === "cn" ? "专业证书" : "Professional certificates"}
        >
          <HomeMobileCertificates />
        </section>

        <section
          className="section container section-reveal home-section home-section--featured-cases"
          id="featured-cases"
        >
          <FeaturedCases />
        </section>

        <VideoHighlights />

        <section
          className="section section--tight container section-reveal home-section home-section--process"
          id="process"
        >
          <WorkflowSection />
        </section>

        <section
          className="section container section-reveal home-section home-section--sound-check"
          id="sound-check"
        >
          <SoundIssueSection />
        </section>

        <section
          className="section container section-reveal home-section home-section--services"
          id="services"
        >
          <SectionTitle
            sectionIndex={7}
            eyebrow="SERVICES"
            title={lang === "cn" ? "声音解决方案" : "Sound Solutions"}
            subtitle={
              lang === "cn"
                ? "按项目类型定位问题，提供可落地的现场与后期支持。"
                : "Problem-focused support for live sound, systems and post-production."
            }
          />
          <ServicePreview />
        </section>

        <section
          className="home-conversion-zone container section-reveal home-section home-section--conversion"
          id="conversion"
        >
          <BookingCTA compact />
          <TutorialSection compact />
        </section>
      </div>
    </>
  );
}
