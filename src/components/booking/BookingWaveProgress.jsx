import { INTAKE_STEPS } from "../../lib/bookingContent";

export default function BookingWaveProgress({ step, maxStep, onStepClick, lang }) {
  return (
    <div className="intake-wave" aria-label={lang === "cn" ? "填写进度" : "Progress"}>
      <div className="intake-wave__track">
        {INTAKE_STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          const locked = i <= maxStep;
          return (
            <button
              key={s.id}
              type="button"
              className={`intake-wave__cue${current ? " is-current" : ""}${done ? " is-done" : ""}`}
              disabled={!locked || i > maxStep}
              onClick={() => locked && i <= maxStep && onStepClick?.(i)}
              aria-current={current ? "step" : undefined}
            >
              <span className="intake-wave__dot" />
              <span className="intake-wave__code">{s.code}</span>
              <span className="intake-wave__label">{s.label}</span>
              {done && <span className="intake-wave__state">LOCKED</span>}
            </button>
          );
        })}
        <span className="intake-wave__line" aria-hidden="true" />
      </div>
      <div className="intake-wave__bars" aria-hidden="true">
        {Array.from({ length: 32 }, (_, i) => (
          <span
            key={i}
            className="intake-wave__bar"
            style={{ "--h": `${18 + Math.sin(i * 0.5) * 12 + (i % 4) * 3}%` }}
          />
        ))}
      </div>
    </div>
  );
}
