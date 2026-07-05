export default function SectionTitle({ eyebrow, title, className = "" }) {
  return (
    <div className={`section-title ${className}`.trim()}>
      {eyebrow && <span className="section-title__eyebrow">{eyebrow}</span>}
      <h2 className="section-title__heading">{title}</h2>
      <div className="section-title__line" />
    </div>
  );
}
