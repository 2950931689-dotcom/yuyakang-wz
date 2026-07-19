import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeLiveCases, getHomeMixingCases } from "../../lib/content";
import CaseCard from "../cases/CaseCard";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

const SECTION_COPY = {
  live: {
    eyebrow: { cn: "LIVE CASES", en: "LIVE CASES" },
    title: { cn: "现场 Live 精选案例", en: "Field Live Works" },
    subtitle: {
      cn: "从 Livehouse、巡演系统到活动扩声，记录真实现场中的系统搭建、测量调试与现场调音工作。",
      en: "Livehouse, tour systems and event reinforcement — real on-site build, measurement and live mixing.",
    },
    viewAll: { cn: "查看全部案例", en: "View All Works" },
    empty: { cn: "暂无现场 Live 案例", en: "No live cases yet" },
  },
  mixing: {
    eyebrow: { cn: "MIXING WORKS", en: "MIXING WORKS" },
    title: { cn: "后期 / 混音案例", en: "Post-Production Audio" },
    subtitle: {
      cn: "记录录音、编辑、修唱、混音与声音后期相关作品。",
      en: "Recording, editing, vocal production, mixing and post-production audio works.",
    },
    viewAll: { cn: "查看混音相关案例", en: "View Mixing Works" },
    empty: { cn: "暂无后期 / 混音案例", en: "No mixing cases yet" },
  },
};

/**
 * Homepage case block — Round 7.3.
 * @param {"live" | "mixing"} variant
 */
export default function FeaturedCases({
  variant = "live",
  sectionIndex = 2,
  showViewAll = true,
}) {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const copy = SECTION_COPY[variant] ?? SECTION_COPY.live;
  const cases =
    variant === "mixing" ? getHomeMixingCases(content) : getHomeLiveCases(content);

  if (!cases.length) {
    return (
      <div className={`featured-cases featured-cases--${variant}`}>
        <SectionTitle
          sectionIndex={sectionIndex}
          eyebrow={copy.eyebrow[lang] ?? copy.eyebrow.en}
          title={copy.title[lang] ?? copy.title.cn}
          subtitle={copy.subtitle[lang] ?? copy.subtitle.cn}
        />
        <EmptyState message={copy.empty[lang] ?? copy.empty.cn} />
      </div>
    );
  }

  return (
    <div className={`featured-cases featured-cases--${variant}`}>
      <SectionTitle
        sectionIndex={sectionIndex}
        eyebrow={copy.eyebrow[lang] ?? copy.eyebrow.en}
        title={copy.title[lang] ?? copy.title.cn}
        subtitle={copy.subtitle[lang] ?? copy.subtitle.cn}
      />
      <div className="grid-3">
        {cases.map((c, i) => (
          <CaseCard
            key={c.slug}
            caseItem={c}
            projectNumber={String(i + 1).padStart(3, "0")}
            featuredLayout
          />
        ))}
      </div>
      {showViewAll && (
        <div className="featured-cases__footer">
          <Button as={Link} to="/cases" variant="secondary">
            {copy.viewAll[lang] ?? copy.viewAll.cn}
          </Button>
        </div>
      )}
    </div>
  );
}
