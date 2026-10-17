import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeCasePlateChrome } from "../../lib/cmsBinding";
import { getCases, getHomePlateCases, t } from "../../lib/content";
import CaseCard from "../cases/CaseCard";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

const VARIANT_TO_PLATE = {
  live: "live",
  mixing: "mixing",
  all: "all",
};

/**
 * Homepage case block — two plates with inner branch tabs.
 * Chrome from CMS homeSections.liveCases / mixingCases.
 * @param {"live" | "mixing"} variant
 */
export default function FeaturedCases({
  variant = "live",
  sectionIndex = 2,
  showViewAll = true,
}) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const plateId = VARIANT_TO_PLATE[variant] ?? "live";
  const cmsPlate = variant === "all" ? null : getHomeCasePlateChrome(content, plateId);
  const plate = cmsPlate ?? { homeEyebrow: { cn: "02 / ALL WORKS", en: "02 / ALL WORKS" }, homeTitle: { cn: "全部案例作品", en: "All Case Works" }, homeSubtitle: { cn: "系统工程、现场调音、录音与混音案例统一展示。", en: "System engineering, live sound, recording and mixing works in one collection." }, label: { cn: "全部案例", en: "All Works" }, viewAllLabel: { cn: "查看全部案例", en: "View All Cases" }, branches: [] };
  const [branchId, setBranchId] = useState(plate.defaultBranchId ?? "");

  const cases = useMemo(() => {
    if (!content) return [];
    return variant === "all" ? getCases(content, { visible: true, featured: true }) : getHomePlateCases(content, plateId, branchId);
  }, [content, plateId, branchId]);

  if (!content || !plate) return null;

  const empty =
    lang === "cn"
      ? `暂无「${t(plate.branches.find((b) => b.id === branchId)?.label, lang) || "该分支"}」精选案例`
      : `No featured cases in this branch yet`;

  const viewAllTo = variant === "all" ? "/cases" : `/cases?plate=${encodeURIComponent(plateId)}&branch=${encodeURIComponent(branchId)}`;
  const viewAllLabel =
    t(plate.viewAllLabel, lang) ||
    (lang === "cn" ? "查看该板块全部案例" : "View All in This Plate");

  return (
    <div className={`featured-cases featured-cases--${variant}`}>
      <SectionTitle
        sectionIndex={sectionIndex}
        eyebrow={t(plate.homeEyebrow, lang)}
        title={t(plate.homeTitle, lang)}
        subtitle={t(plate.homeSubtitle, lang)}
      />

      {variant !== "all" && <div className="case-filter case-filter--branches featured-cases__branches"
        role="tablist"
        aria-label={t(plate.label, lang)}
      >
        {plate.branches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            role="tab"
            aria-selected={branchId === branch.id}
            className={branchId === branch.id ? "active" : ""}
            onClick={() => setBranchId(branch.id)}
          >
            <span>{t(branch.label, lang)}</span>
          </button>
        ))}
      </div>}

      {!cases.length ? (
        <EmptyState message={empty} />
      ) : (
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
      )}

      {showViewAll && (
        <div className="featured-cases__footer">
          <Button as={Link} to={viewAllTo} variant="secondary">
            {viewAllLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
