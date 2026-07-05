export default function SectionTitle({ sectionIndex, eyebrow, title, subtitle, className = "" }) {
  const indexLabel = sectionIndex != null ? String(sectionIndex).padStart(2, "0") : null;

  return (
    <div className={`section-title ${className}`.trim()}>
      {(indexLabel || eyebrow) && (
        <span className="section-title__eyebrow">
          {indexLabel && <span className="section-title__index">{indexLabel}</span>}
          {indexLabel && eyebrow && <span className="section-title__sep"> / </span>}
          {eyebrow}
        </span>
      )}
      <h2 className="section-title__heading">{title}</h2>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
      <div className="section-title__line" />
    </div>
  );
}
