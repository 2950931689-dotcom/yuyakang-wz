import HeroSection from "../components/home/HeroSection";
import CredentialsSection from "../components/home/CredentialsSection";
import ServicePreview from "../components/home/ServicePreview";
import FeaturedCases from "../components/home/FeaturedCases";
import WorkflowSection from "../components/home/WorkflowSection";
import SoundIssueSection from "../components/home/SoundIssueSection";
import TutorialSection from "../components/home/TutorialSection";
import BookingCTA from "../components/home/BookingCTA";
import SectionTitle from "../components/ui/SectionTitle";
import { useLanguage } from "../context/LanguageContext";

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <>
      <HeroSection />
      <section className="section container section-reveal" id="credentials">
        <CredentialsSection />
      </section>
      <section className="section container section-reveal" id="services">
        <SectionTitle
          sectionIndex={2}
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
      <section className="section section--tight container section-reveal" id="process">
        <WorkflowSection />
      </section>
      <section className="section container section-reveal" id="featured-cases">
        <FeaturedCases />
      </section>
      <section className="section container section-reveal" id="sound-check">
        <SoundIssueSection />
      </section>
      <section className="home-conversion-zone container section-reveal" id="conversion">
        <BookingCTA compact />
        <TutorialSection compact />
      </section>
    </>
  );
}
