import SectionTitle from "../ui/SectionTitle";
import { ROUTING_DESC, ROUTING_INTRO, ROUTING_PARAMS, getRoutingLocation } from "../../lib/contactContent";

export default function ContactRoutingHero({ content, lang, t }) {
  const location = getRoutingLocation(content, lang, t);
  const params = [
    { key: "STATUS", value: ROUTING_PARAMS.status[lang] || ROUTING_PARAMS.status.en },
    { key: "LOCATION", value: location },
    { key: "RESPONSE", value: ROUTING_PARAMS.response[lang] || ROUTING_PARAMS.response.en },
    { key: "PROJECT INTAKE", value: ROUTING_PARAMS.intake[lang] || ROUTING_PARAMS.intake.en },
  ];

  return (
    <section className="contact-section contact-routing-hero">
      <SectionTitle
        eyebrow="CONTACT ROUTING"
        title={lang === "cn" ? "联系路由控制台" : "Contact Routing Console"}
        headingLevel="h1"
        className="page-title"
      />
      <div className="contact-routing-hero__card">
        <div className="contact-routing-hero__main">
          <p className="contact-routing-hero__intro">{ROUTING_INTRO[lang]}</p>
          <p className="contact-routing-hero__desc">{ROUTING_DESC[lang]}</p>
          {content?.socialLinks?.contactNote && (
            <p className="contact-routing-hero__note">{t(content.socialLinks.contactNote, lang)}</p>
          )}
        </div>
        <aside className="contact-routing-hero__params" aria-label={lang === "cn" ? "路由状态" : "Routing status"}>
          {params.map((p) => (
            <div key={p.key} className="contact-routing-hero__param">
              <span className="contact-routing-hero__param-key">{p.key}</span>
              <span className="contact-routing-hero__param-value">
                {p.key === "STATUS" && <span className="contact-routing-hero__dot" aria-hidden="true" />}
                {p.value}
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
