import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getCasePlate,
  getCases,
  getUiText,
} from "../lib/content";
import CaseFilter from "../components/cases/CaseFilter";
import CaseCard from "../components/cases/CaseCard";
import EmptyState from "../components/ui/EmptyState";
import { CasesGridSkeleton } from "../components/ui/Skeleton";

function resolveInitialState(searchParams) {
  const plate = searchParams.get("plate") || "all";
  const branch = searchParams.get("branch") || "";
  if (plate === "all" || !getCasePlate(plate)) {
    return { plateId: "all", branchId: "" };
  }
  const plateMeta = getCasePlate(plate);
  const validBranch =
    branch && plateMeta.branches.some((b) => b.id === branch)
      ? branch
      : plateMeta.defaultBranchId;
  return { plateId: plate, branchId: validBranch };
}

export default function CasesPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = resolveInitialState(searchParams);
  const [plateId, setPlateId] = useState(initial.plateId);
  const [branchId, setBranchId] = useState(initial.branchId);

  useEffect(() => {
    const next = resolveInitialState(searchParams);
    setPlateId(next.plateId);
    setBranchId(next.branchId);
  }, [searchParams]);

  const syncUrl = (nextPlate, nextBranch) => {
    if (nextPlate === "all") {
      setSearchParams({}, { replace: true });
      return;
    }
    const params = { plate: nextPlate };
    if (nextBranch) params.branch = nextBranch;
    setSearchParams(params, { replace: true });
  };

  const onPlateChange = (id) => {
    if (id === "all") {
      setPlateId("all");
      setBranchId("");
      syncUrl("all", "");
      return;
    }
    const plate = getCasePlate(id);
    const nextBranch = plate?.defaultBranchId || "";
    setPlateId(id);
    setBranchId(nextBranch);
    syncUrl(id, nextBranch);
  };

  const onBranchChange = (id) => {
    setBranchId(id);
    syncUrl(plateId, id);
  };

  const cases = useMemo(() => {
    if (!content) return [];
    if (plateId === "all") return getCases(content);
    return getCases(content, { plateId, branchId });
  }, [content, plateId, branchId]);

  if (loading || !content) {
    return (
      <div className="page container">
        <div className="skeleton skeleton--title" aria-hidden="true" />
        <div className="skeleton skeleton--line skeleton--lead" aria-hidden="true" />
        <CasesGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="page container fade-in">
      <header className="page-header">
        <span className="page-header__eyebrow">02 / CASES</span>
        <h1 className="page-title">{lang === "cn" ? "案例作品" : "Works"}</h1>
        <p className="page-lead">
          {lang === "cn"
            ? "两大板块：现场 / 系统、后期 / 混音。声学模拟可在「全部」中查看。"
            : "Two plates — Live / System and Post / Mixing. Acoustic simulation appears under All."}
        </p>
      </header>
      <CaseFilter
        plateId={plateId}
        branchId={branchId}
        onPlateChange={onPlateChange}
        onBranchChange={onBranchChange}
      />
      <div key={`${plateId}-${branchId}`} className="cases-grid fade-in">
        {cases.length === 0 ? (
          <EmptyState
            message={getUiText("emptyCases", lang)}
            hint={
              plateId !== "all"
                ? lang === "cn"
                  ? "可切换「全部」或其他分支查看项目"
                  : "Switch to All or another branch"
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
