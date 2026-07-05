import { t } from "../../lib/content";
import {
  DELIVERY_OPTIONS,
  SOUND_ISSUES,
  URGENCY_OPTIONS,
  VENUE_TYPES,
  buildVenueSize,
} from "../../lib/bookingContent";

export default function BookingProjectSummary({ form, services, lang }) {
  const service = services.find((s) => s.slug === form.serviceType);
  const venueType = VENUE_TYPES.find((v) => v.id === form.venueType);
  const issues = SOUND_ISSUES.filter((i) => form.soundIssues?.includes(i.id));
  const delivery = DELIVERY_OPTIONS.filter((o) => form[o.key]);
  const urgency = URGENCY_OPTIONS.find((o) => o.id === form.urgency);

  const rows = [
    {
      label: lang === "cn" ? "项目类型" : "Service",
      value: service ? t(service.title, lang) : "—",
    },
    {
      label: lang === "cn" ? "城市" : "City",
      value: form.city || "—",
    },
    {
      label: lang === "cn" ? "场地" : "Venue",
      value: [form.venueName, venueType ? (lang === "cn" ? venueType.cn : venueType.en) : ""]
        .filter(Boolean)
        .join(" · ") || "—",
    },
    {
      label: lang === "cn" ? "系统信息" : "System",
      value: buildVenueSize(form, lang) || "—",
    },
    {
      label: lang === "cn" ? "声音问题" : "Issues",
      value: issues.length
        ? issues.map((i) => (lang === "cn" ? i.cn : i.en)).join("、")
        : form.processNotes?.trim() || "—",
    },
    {
      label: lang === "cn" ? "时间 / 交付" : "Timeline",
      value: [
        form.projectDate,
        delivery.map((o) => (lang === "cn" ? o.label.cn : o.label.en)).join("、"),
        urgency && urgency.id !== "normal" ? (lang === "cn" ? urgency.cn : urgency.en) : "",
        form.budgetRange,
      ]
        .filter(Boolean)
        .join(" · ") || "—",
    },
    {
      label: lang === "cn" ? "联系方式" : "Contact",
      value: [form.clientName, form.wechat, form.phone].filter(Boolean).join(" · ") || "—",
    },
  ];

  return (
    <div className="intake-summary">
      <span className="intake-summary__code">PROJECT SUMMARY</span>
      <dl className="intake-summary__list">
        {rows.map((row) => (
          <div key={row.label} className="intake-summary__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="intake-summary__status">READY TO SEND</p>
    </div>
  );
}
