import SectionTitle from "../ui/SectionTitle";
import { Link } from "react-router-dom";
import {
  getLocationDisplay,
  getServiceArea,
  getSiteLocation,
} from "../../lib/content";
import { ROUTING_DESC, ROUTING_INTRO, ROUTING_PARAMS, getRoutingLocation } from "../../lib/contactContent";
import Button from "../ui/Button";

export default function ContactConsole({ content, lang, t }) {
  const profile = content.profile ?? {};
  const display = getLocationDisplay(content);
  const location = getSiteLocation(content);
  const serviceArea = getServiceArea(content);
  const routingLocation = getRoutingLocation(content, lang, t);
  const siteName = content.siteSettings?.siteName?.en || "YU YAKANG AUDIO";

  const params = [
    { key: "STATUS", value: ROUTING_PARAMS.status[lang] || ROUTING_PARAMS.status.en, dot: true },
    { key: "LOCATION", value: routingLocation },
    { key: "RESPONSE", value: ROUTING_PARAMS.response[lang] || ROUTING_PARAMS.response.en },
    { key: "PROJECT INTAKE", value: ROUTING_PARAMS.intake[lang] || ROUTING_PARAMS.intake.en },
  ];

  return (
    <section className="contact-section contact-console">
      <SectionTitle
        eyebrow="CONTACT CONSOLE"
        title={lang === "cn" ? "联系路由控制台" : "Contact Console"}
        headingLevel="h1"
        className="page-title"
      />

      <div className="contact-console__frame console-panel console-panel--split">
        <div className="contact-console__identity">
          <span className="contact-console__brand code-label">{siteName}</span>
          <h2 className="contact-console__name">{t(profile.name, lang)}</h2>
          <p className="contact-console__role">{t(profile.title, lang)}</p>

          {display.showOnContact && (
            <dl className="contact-console__meta">
              <div className="contact-console__meta-row">
                <dt>{lang === "cn" ? "服务城市" : "Base City"}</dt>
                <dd>{t(location, lang)}</dd>
              </div>
              <div className="contact-console__meta-row">
                <dt>{lang === "cn" ? "服务范围" : "Service Area"}</dt>
                <dd>{t(serviceArea, lang)}</dd>
              </div>
            </dl>
          )}

          <p className="contact-console__intro">{ROUTING_INTRO[lang]}</p>
          <p className="contact-console__desc">{ROUTING_DESC[lang]}</p>
          {content?.socialLinks?.contactNote && (
            <p className="contact-console__note">{t(content.socialLinks.contactNote, lang)}</p>
          )}

          <div className="contact-console__actions">
            <Button as={Link} to="/booking">
              {lang === "cn" ? "提交项目需求" : "Submit Project"}
            </Button>
            <Button as={Link} to="/cases" variant="secondary">
              {lang === "cn" ? "查看代表案例" : "View Cases"}
            </Button>
          </div>
        </div>

        <aside className="contact-console__params" aria-label={lang === "cn" ? "路由状态" : "Routing status"}>
          {params.map((p) => (
            <div key={p.key} className="contact-console__param">
              <span className="contact-console__param-key">{p.key}</span>
              <span className="contact-console__param-value">
                {p.dot && <span className="contact-console__dot console-panel__status-dot" aria-hidden="true" />}
                {p.value}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
