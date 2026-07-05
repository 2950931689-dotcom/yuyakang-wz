import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCases } from "../../lib/content";
import CaseCard from "../cases/CaseCard";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";

export default function FeaturedCases() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const featured = getCases(content, { featured: true }).slice(0, 6);

  return (
    <div>
      <SectionTitle
        sectionIndex={3}
        eyebrow={lang === "cn" ? "CASES" : "CASES"}
        title={lang === "cn" ? "精选案例" : "Featured Projects"}
      />
      <div className="grid-3">
        {featured.map((c, i) => (
          <CaseCard
            key={c.slug}
            caseItem={c}
            projectNumber={String(i + 1).padStart(3, "0")}
          />
        ))}
      </div>
      <div style={{ marginTop: "var(--space-xl)" }}>
        <Button as={Link} to="/cases" variant="secondary">
          {lang === "cn" ? "查看全部案例" : "View All Works"}
        </Button>
      </div>
    </div>
  );
}
