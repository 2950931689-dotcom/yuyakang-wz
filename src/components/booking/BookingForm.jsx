import { useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getVisibleServices, t } from "../../lib/content";
import { createBooking } from "../../lib/api";
import Button from "../ui/Button";
import WechatQr from "../contact/WechatQr";

const STEPS = 4;

const STEP_TITLES = [
  { cn: "选择服务类型", en: "Choose Service" },
  { cn: "项目信息", en: "Project Info" },
  { cn: "需求描述", en: "Project Details" },
  { cn: "联系方式", en: "Contact" },
];

function validateStep(step, form, lang) {
  switch (step) {
    case 0:
      if (!form.serviceType.trim()) {
        return lang === "cn" ? "请选择服务类型" : "Please select a service type";
      }
      break;
    case 1:
      if (!form.city.trim()) {
        return lang === "cn" ? "请填写城市" : "Please enter your city";
      }
      break;
    case 2:
      if (!form.description.trim()) {
        return lang === "cn" ? "请填写需求描述" : "Please describe your project";
      }
      break;
    case 3:
      if (!form.clientName.trim() && !form.wechat.trim()) {
        return lang === "cn" ? "请填写姓名或微信" : "Please provide your name or WeChat ID";
      }
      break;
    default:
      break;
  }
  return "";
}

export default function BookingForm() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
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
  const progress = ((step + 1) / STEPS) * 100;

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (stepError) setStepError("");
  };

  const goNext = () => {
    const msg = validateStep(step, form, lang);
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validateStep(3, form, lang);
    if (msg) {
      setStepError(msg);
      return;
    }

    setSubmitting(true);
    setError("");
    setStepError("");

    try {
      await createBooking({
        name: form.clientName,
        wechat: form.wechat,
        phone: form.phone,
        email: form.email,
        serviceType: form.serviceType,
        city: form.city,
        projectDate: form.projectDate,
        venueSize: form.venueScale,
        budgetRange: form.budgetRange,
        referenceLink: form.referenceUrl,
        message: form.description,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.message ||
          (lang === "cn"
            ? "提交失败，请稍后重试，或直接添加微信沟通"
            : "Submission failed. Please try again or contact via WeChat.")
      );
    } finally {
      setSubmitting(false);
    }
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
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <div className="form-progress" aria-hidden="true">
        <div className="form-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="form-steps">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={step === i ? "active" : i < step ? "done" : ""}>
            {lang === "cn" ? `步骤 ${i + 1}` : `Step ${i + 1}`}
          </span>
        ))}
      </div>

      <h2 className="form-step-title">
        {lang === "cn" ? STEP_TITLES[step].cn : STEP_TITLES[step].en}
      </h2>

      {(stepError || error) && (
        <div className="alert alert--warn form-alert" role="alert">
          {stepError || error}
        </div>
      )}

      {step === 0 && (
        <div className="form-group">
          <span className="form-group__label">{t(bi.serviceType, lang)}</span>
          <div className="service-pick-grid" role="listbox" aria-label={t(bi.serviceType, lang)}>
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={form.serviceType === s.slug}
                className={`service-pick${form.serviceType === s.slug ? " selected" : ""}`}
                onClick={() => update("serviceType", s.slug)}
                disabled={submitting}
              >
                <span className="service-pick__title">{t(s.title, lang)}</span>
                {s.summary && (
                  <span className="service-pick__desc">{t(s.summary, lang)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="form-group">
            <label htmlFor="booking-city">{t(bi.city, lang)}</label>
            <input
              id="booking-city"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-date">{t(bi.projectDate, lang)}</label>
            <input
              id="booking-date"
              type="date"
              value={form.projectDate}
              onChange={(e) => update("projectDate", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-venue">{t(bi.venueScale, lang)}</label>
            <input
              id="booking-venue"
              value={form.venueScale}
              onChange={(e) => update("venueScale", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-budget">{t(bi.budgetRange, lang)}</label>
            <input
              id="booking-budget"
              value={form.budgetRange}
              onChange={(e) => update("budgetRange", e.target.value)}
              disabled={submitting}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="form-group">
            <label htmlFor="booking-ref">{t(bi.referenceUrl, lang)}</label>
            <input
              id="booking-ref"
              type="url"
              value={form.referenceUrl}
              onChange={(e) => update("referenceUrl", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-desc">{t(bi.description, lang)}</label>
            <textarea
              id="booking-desc"
              rows={5}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              disabled={submitting}
            />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="form-group">
            <label htmlFor="booking-name">{t(bi.clientName, lang)}</label>
            <input
              id="booking-name"
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-wechat">{t(bi.wechat, lang)}</label>
            <input
              id="booking-wechat"
              value={form.wechat}
              onChange={(e) => update("wechat", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-phone">{t(bi.phone, lang)}</label>
            <input
              id="booking-phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="booking-email">{t(bi.email, lang)}</label>
            <input
              id="booking-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={submitting}
            />
          </div>
          <p className="form-hint">
            {lang === "cn" ? "姓名或微信至少填写一项" : "Provide name or WeChat ID"}
          </p>
        </>
      )}

      <div className="form-actions">
        {step > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStepError("");
              setStep((s) => s - 1);
            }}
            disabled={submitting}
          >
            {lang === "cn" ? "上一步" : "Back"}
          </Button>
        )}
        {step < STEPS - 1 ? (
          <Button type="button" onClick={goNext} disabled={submitting}>
            {lang === "cn" ? "下一步" : "Next"}
          </Button>
        ) : (
          <Button
            type="submit"
            loading={submitting}
            loadingText={lang === "cn" ? "提交中…" : "Submitting…"}
            disabled={submitting}
          >
            {t(content.i18n.common.submit, lang)}
          </Button>
        )}
      </div>
    </form>
  );
}
