import { Link } from "react-router-dom";
import * as Lucide from "lucide-react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { getVisibleServices, t } from "../lib/content";
import Button from "../components/ui/Button";

export default function ServicesPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  const services = getVisibleServices(content);

  return (
    <div className="page container fade-in">
      <h1 className="page-title">{lang === "cn" ? "服务方向" : "Services"}</h1>
      <p className="page-lead">{t(content.siteSettings.tagline, lang)}</p>

      {services.map((svc) => {
        const Icon = Lucide[svc.icon] || Lucide.Circle;
        return (
          <article key={svc.id} className="prose-block" style={{ paddingBottom: 32, borderBottom: "1px solid var(--color-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Icon size={22} strokeWidth={1.5} color="var(--color-text-muted)" />
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>{t(svc.title, lang)}</h2>
            </div>
            <p>{t(svc.summary, lang)}</p>
            <p style={{ marginTop: 12, color: "var(--color-text-secondary)" }}>{t(svc.description, lang)}</p>
            <p style={{ marginTop: 12, fontSize: 13, color: "var(--color-text-muted)" }}>
              {lang === "cn" ? "适合：演出方、Livehouse、品牌活动与音乐制作客户" : "For: venues, tours, events and production clients"}
            </p>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
              {lang === "cn" ? "可交付：现场调音报告、系统调试、混音成品或技术方案" : "Deliverables: tuning, system setup, mixes or technical plans"}
            </p>
            <div style={{ marginTop: 16 }}>
              <Button as={Link} to="/booking" variant="secondary" className="btn--sm">
                {lang === "cn" ? "预约此服务" : "Book This Service"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
