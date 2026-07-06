import { ISSUE_HINTS } from "../../lib/bookingContent";
import { getBookingGuide } from "../../lib/cmsBinding";
import BookingSignalMeter from "./BookingSignalMeter";

export default function EngineerAssistPanel({ content, step, lang, selectedIssues = [] }) {
  const guide = getBookingGuide(content, step, lang);
  const hints = selectedIssues
    .map((id) => ISSUE_HINTS[id]?.[lang])
    .filter(Boolean);

  return (
    <aside className="intake-assist">
      <div className="intake-assist__head">
        <span className="intake-assist__code">ENGINEER ASSIST</span>
        <BookingSignalMeter level={55 + step * 8} active />
      </div>

      <div className="intake-assist__block">
        <span className="intake-assist__label">STATUS</span>
        <p className="intake-assist__text">{lang === "cn" ? "SIGNAL READY" : "SIGNAL READY"}</p>
      </div>

      <div className="intake-assist__block">
        <span className="intake-assist__label">{lang === "cn" ? "当前任务" : "CURRENT TASK"}</span>
        <p className="intake-assist__text">{guide.task[lang]}</p>
      </div>

      <div className="intake-assist__block">
        <span className="intake-assist__label">CHECKLIST</span>
        <ul className="intake-assist__list">
          {guide.checklist[lang].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {hints.length > 0 && (
        <div className="intake-assist__block intake-assist__block--hint">
          <span className="intake-assist__label">SIGNAL HINT</span>
          {hints.map((hint) => (
            <p key={hint} className="intake-assist__hint">{hint}</p>
          ))}
        </div>
      )}
    </aside>
  );
}
