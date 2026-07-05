import BookingSignalMeter from "./BookingSignalMeter";

export default function BookingModuleCard({
  selected,
  title,
  subtitle,
  tags,
  meterLevel = 70,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <button
      type="button"
      className={`service-pick intake-module${selected ? " selected" : ""}${className ? ` ${className}` : ""}`}
      aria-selected={selected}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="intake-module__head">
        <BookingSignalMeter level={meterLevel} active={selected} />
        {selected && <span className="intake-module__lock">INPUT LOCKED</span>}
      </span>
      <span className="service-pick__title">{title}</span>
      {subtitle && <span className="service-pick__desc">{subtitle}</span>}
      {tags && <span className="intake-module__tags">{tags}</span>}
      <span className="intake-module__sweep" aria-hidden="true" />
    </button>
  );
}
