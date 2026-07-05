export default function BookingSignalMeter({ level = 72, active = false, size = "sm" }) {
  const lit = Math.round((level / 100) * 6);
  return (
    <div
      className={`intake-meter intake-meter--${size}${active ? " is-active" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={`intake-meter__led${i < lit ? " is-lit" : ""}`} />
      ))}
    </div>
  );
}
