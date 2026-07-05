import { useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getVisibleServices, t } from "../../lib/content";
import Button from "../ui/Button";
import WechatQr from "../contact/WechatQr";

const STEPS = 4;

export default function BookingForm() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    serviceType: "",
    city: "",
    projectDate: "",
    venueScale: "",
    budgetRange: "",
    referenceUrl: "",
    description: "",
    clientName: "",
    wechat: "",
    phone: "",
    email: "",
  });

  if (!content) return null;

  const services = getVisibleServices(content);
  const bi = content.i18n.booking;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="booking-success fade-in">
        <h2>{t(bi.successTitle, lang)}</h2>
        <p>{t(bi.success, lang)}</p>
        <WechatQr content={content} />
        <div className="booking-success__actions">
          <Button as={Link} to="/" variant="secondary">
            {t(bi.successBackHome, lang)}
          </Button>
          <Button as={Link} to="/cases">
            {t(bi.successViewCases, lang)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-steps">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={step === i ? "active" : ""}>
            {lang === "cn" ? `步骤 ${i + 1}` : `Step ${i + 1}`}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="form-group">
          <label>{t(bi.serviceType, lang)}</label>
          <select value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)} required>
            <option value="">{lang === "cn" ? "请选择" : "Select"}</option>
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {t(s.title, lang)}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="form-group">
            <label>{t(bi.city, lang)}</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t(bi.projectDate, lang)}</label>
            <input type="date" value={form.projectDate} onChange={(e) => update("projectDate", e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t(bi.venueScale, lang)}</label>
            <input value={form.venueScale} onChange={(e) => update("venueScale", e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t(bi.budgetRange, lang)}</label>
            <input value={form.budgetRange} onChange={(e) => update("budgetRange", e.target.value)} />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="form-group">
            <label>{t(bi.referenceUrl, lang)}</label>
            <input type="url" value={form.referenceUrl} onChange={(e) => update("referenceUrl", e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t(bi.description, lang)}</label>
            <textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} required />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="form-group">
            <label>{t(bi.clientName, lang)}</label>
            <input value={form.clientName} onChange={(e) => update("clientName", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t(bi.wechat, lang)}</label>
            <input value={form.wechat} onChange={(e) => update("wechat", e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t(bi.phone, lang)}</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t(bi.email, lang)}</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            {lang === "cn" ? "上一步" : "Back"}
          </Button>
        )}
        {step < STEPS - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)}>
            {lang === "cn" ? "下一步" : "Next"}
          </Button>
        ) : (
          <Button type="submit">{t(content.i18n.common.submit, lang)}</Button>
        )}
      </div>
    </form>
  );
}
