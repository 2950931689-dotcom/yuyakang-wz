import { useState } from "react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getCases } from "../lib/content";
import CaseFilter from "../components/cases/CaseFilter";
import CaseCard from "../components/cases/CaseCard";

export default function CasesPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const [category, setCategory] = useState("all");

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  const cases = getCases(content, { categoryId: category });

  return (
    <div className="page container">
      <h1 className="page-title">{lang === "cn" ? "案例作品" : "Works"}</h1>
      <p className="page-lead">
        {lang === "cn"
          ? "Livehouse 现场调音、演出系统工程、混音后期与声学模拟代表项目。"
          : "Selected projects in live sound, system engineering, mixing and acoustic simulation."}
      </p>
      <CaseFilter active={category} onChange={setCategory} />
      <div className="grid-3">
        {cases.map((c) => (
          <CaseCard key={c.slug} caseItem={c} />
        ))}
      </div>
    </div>
  );
}
