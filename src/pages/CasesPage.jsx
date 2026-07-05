import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getCases, getUiText } from "../lib/content";
import CaseFilter from "../components/cases/CaseFilter";
import CaseCard from "../components/cases/CaseCard";
import EmptyState from "../components/ui/EmptyState";
import { CasesGridSkeleton } from "../components/ui/Skeleton";

export default function CasesPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const [category, setCategory] = useState("all");

  if (loading || !content) {
    return (
      <div className="page container">
        <div className="skeleton skeleton--title" aria-hidden="true" />
        <div className="skeleton skeleton--line skeleton--lead" aria-hidden="true" />
        <CasesGridSkeleton count={6} />
      </div>
    );
  }

  const cases = getCases(content, { categoryId: category });

  return (
    <div className="page container fade-in">
      <header className="page-header">
        <span className="page-header__eyebrow">02 / CASES</span>
        <h1 className="page-title">{lang === "cn" ? "案例作品" : "Works"}</h1>
        <p className="page-lead">
          {lang === "cn"
            ? "Livehouse 现场调音、演出系统工程、混音后期与声学模拟代表项目。"
            : "Selected projects in live sound, system engineering, mixing and acoustic simulation."}
        </p>
      </header>
      <CaseFilter active={category} onChange={setCategory} />
      <div key={category} className="cases-grid fade-in">
        {cases.length === 0 ? (
          <EmptyState
            message={getUiText("emptyCases", lang)}
            hint={
              category !== "all"
                ? lang === "cn"
                  ? "可切换「全部」查看所有项目"
                  : "Switch to All to view every project"
                : undefined
            }
          />
        ) : (
          <div className="grid-3">
            {cases.map((c, i) => (
              <CaseCard
                key={c.slug}
                caseItem={c}
                projectNumber={String(i + 1).padStart(3, "0")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
