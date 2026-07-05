import { Link } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import CredentialStrip from "../components/home/CredentialStrip";
import ServicePreview from "../components/home/ServicePreview";
import FeaturedCases from "../components/home/FeaturedCases";
import WorkflowSection from "../components/home/WorkflowSection";
import TutorialSection from "../components/home/TutorialSection";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import { useLanguage } from "../context/LanguageContext";

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <>
      <HeroSection />
      <section className="section container" id="credentials">
        <SectionTitle eyebrow="Credentials" title={lang === "cn" ? "专业背书" : "Credentials"} />
        <CredentialStrip />
      </section>
      <section className="section container" id="services">
        <SectionTitle eyebrow="Services" title={lang === "cn" ? "服务方向" : "Services"} />
        <ServicePreview />
      </section>
      <section className="section container" id="featured-cases">
        <FeaturedCases />
      </section>
      <section className="section section--tight container" id="process">
        <WorkflowSection />
      </section>
      <section className="section container" id="booking">
        <div className="cta-band">
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>
              {lang === "cn" ? "预约合作" : "Book a Project"}
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
              {lang === "cn"
                ? "提交项目需求，或通过微信发送现场资料与音频文件。"
                : "Submit your project details or reach out via WeChat."}
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button as={Link} to="/booking">
              {lang === "cn" ? "提交项目需求" : "Submit Inquiry"}
            </Button>
            <Button as={Link} to="/contact" variant="secondary">
              {lang === "cn" ? "添加微信沟通" : "WeChat"}
            </Button>
          </div>
        </div>
      </section>
      <TutorialSection />
    </>
  );
}
