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
    <div className="featured-cases">
      <SectionTitle
        sectionIndex={5}
        eyebrow="CASES"
        title={lang === "cn" ? "精选案例" : "Featured Projects"}
        subtitle={
          lang === "cn"
            ? "项目档案摘要 — 点击进入查看完整 Project File。"
            : "Project archive summaries — open for full Project File details."
        }
      />
      <div className="grid-3">
        {featured.map((c, i) => (
          <CaseCard
            key={c.slug}
            caseItem={c}
            projectNumber={String(i + 1).padStart(3, "0")}
            featuredLayout
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
