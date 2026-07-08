export default function SectionTitle({
  sectionIndex,
  eyebrow,
  title,
  subtitle,
  align = "left",
  size = "default",
  className = "",
  headingLevel = "h2",
}) {
  const indexLabel = sectionIndex != null ? String(sectionIndex).padStart(2, "0") : null;
  const Heading = headingLevel;

  const classes = [
    "section-title",
    "console-section-title",
    align !== "left" && `section-title--${align}`,
    size !== "default" && `section-title--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {(indexLabel || eyebrow) && (
        <span className="section-title__eyebrow code-label console-mono">
          {indexLabel && <span className="section-title__index">{indexLabel}</span>}
          {indexLabel && eyebrow && <span className="section-title__sep"> / </span>}
          {eyebrow}
        </span>
      )}
      <Heading className="section-title__heading">{title}</Heading>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
      <div className="section-title__line" aria-hidden="true" />
    </div>
  );
}
