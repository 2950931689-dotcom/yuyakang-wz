import HeroSection from "../components/home/HeroSection";
import CredentialStrip from "../components/home/CredentialStrip";
import ServicePreview from "../components/home/ServicePreview";
import FeaturedCases from "../components/home/FeaturedCases";
import WorkflowSection from "../components/home/WorkflowSection";
import TutorialSection from "../components/home/TutorialSection";
import BookingCTA from "../components/home/BookingCTA";
import SectionTitle from "../components/ui/SectionTitle";
import { useLanguage } from "../context/LanguageContext";

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <>
      <HeroSection />
      <section className="section container" id="credentials">
        <SectionTitle
          sectionIndex={1}
          eyebrow="CREDENTIALS"
          title={lang === "cn" ? "专业背书" : "Credentials"}
        />
        <CredentialStrip />
      </section>
      <section className="section container" id="services">
        <SectionTitle
          sectionIndex={2}
          eyebrow="SERVICES"
          title={lang === "cn" ? "服务方向" : "Services"}
        />
        <ServicePreview />
      </section>
      <section className="section container" id="featured-cases">
        <FeaturedCases />
      </section>
      <section className="section section--tight container" id="process">
        <WorkflowSection />
      </section>
      <section className="home-conversion-zone container" id="conversion">
        <BookingCTA compact />
        <TutorialSection compact />
      </section>
    </>
  );
}
