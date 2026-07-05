import { getCaseHeroImage } from "../../lib/caseVisuals";

export default function CaseDetailHero({ caseItem }) {
  const image = getCaseHeroImage(caseItem);

  return (
    <div className={`case-detail-hero${image ? " case-detail-hero--has-image" : ""}`} aria-hidden="true">
      {image && (
        <div
          className="case-detail-hero__bg"
          style={{ backgroundImage: `url("${image}")` }}
        />
      )}
      <div className="case-detail-hero__overlay" />
      <div className="case-detail-hero__grid" />
    </div>
  );
}
