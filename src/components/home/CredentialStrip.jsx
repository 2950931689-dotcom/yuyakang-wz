import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCases, getVisibleCertificates, getVisibleServices, t } from "../../lib/content";

export default function CredentialStrip() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const cases = getCases(content);
  const certs = getVisibleCertificates(content);
  const services = getVisibleServices(content);

  const items = [
    { num: certs.length, label: lang === "cn" ? "专业证书" : "Certificates" },
    { num: cases.length, label: lang === "cn" ? "代表案例" : "Projects" },
    { num: services.length, label: lang === "cn" ? "服务方向" : "Services" },
    { num: "NC", label: lang === "cn" ? "常驻地" : "Based in", sub: t(content.socialLinks.location, lang) },
  ];

  return (
    <div className="credential-strip">
      {items.map((item) => (
        <div key={item.label} className="credential-strip__item">
          <span className="credential-strip__num">{item.num}</span>
          <span className="credential-strip__label">{item.label}</span>
          {item.sub && (
            <span style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
              {item.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
