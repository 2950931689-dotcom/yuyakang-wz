import { useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getVisibleServices, t } from "../../lib/content";
import { createBooking } from "../../lib/api";
import {
  ASSIST_CONTENT,
  DELIVERY_OPTIONS,
  INTAKE_STEPS,
  PATCH_POINTS,
  SERVICE_TAGS,
  SOUND_ISSUES,
  URGENCY_OPTIONS,
  VENUE_TYPES,
  buildCompositeMessage,
  buildVenueSize,
} from "../../lib/bookingContent";
import Button from "../ui/Button";
import WechatQr from "../contact/WechatQr";
import BookingWaveProgress from "./BookingWaveProgress";
import BookingStepPanel from "./BookingStepPanel";
import BookingModuleCard from "./BookingModuleCard";
import EngineerAssistPanel from "./EngineerAssistPanel";
import BookingProjectSummary from "./BookingProjectSummary";

const STEPS = INTAKE_STEPS.length;

const INITIAL_FORM = {
  serviceType: "",
  city: "",
  venueName: "",
  venueType: "",
  audienceSize: "",
  equipmentNotes: "",
  hasMainPa: false,
  hasSub: false,
  hasMonitor: false,
  hasConsole: false,
  hasProcessor: false,
  gearBrands: "",
  projectDate: "",
  venueScale: "",
  budgetRange: "",
  referenceUrl: "",
  soundIssues: [],
  processNotes: "",
  contactTime: "",
  needsAssessment: false,
  needsTuning: false,
  needsLiveMix: false,
  needsMixing: false,
  needsReview: false,
  urgency: "normal",
  description: "",
  clientName: "",
  wechat: "",
  phone: "",
  email: "",
  preferWechat: true,
  viewCasesFirst: false,
};

function validateStep(step, form, lang) {
  switch (step) {
    case 0:
      if (!form.serviceType.trim()) {
        return lang === "cn" ? "请选择项目类型" : "Please select a service type";
      }
      break;
    case 1:
      if (!form.city.trim()) {
        return lang === "cn" ? "请填写城市" : "Please enter your city";
      }
      break;
    case 2:
      if (!form.soundIssues.length && !form.processNotes.trim()) {
        return lang === "cn" ? "请选择声音问题或填写补充说明" : "Select issues or add notes";
      }
      break;
    case 3:
      break;
    case 4:
      if (!form.clientName.trim() && !form.wechat.trim()) {
        return lang === "cn" ? "请填写姓名或微信" : "Please provide your name or WeChat ID";
      }
      break;
    default:
      break;
  }
  return "";
}

function stepPhase(step) {
  if (step === 0) return { en: "INPUT", cn: "输入" };
  if (step <= 1) return { en: "INPUT", cn: "输入" };
  if (step <= 3) return { en: "PROCESS", cn: "处理" };
  return { en: "OUTPUT", cn: "输出" };
}

export default function BookingIntakeConsole() {
  const { content } = useContent();
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  if (!content) return null;

  const services = getVisibleServices(content);
  const bi = content.i18n.booking;
  const phase = stepPhase(step);
  const currentStep = INTAKE_STEPS[step];

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (stepError) setStepError("");
  };

  const toggleIssue = (id) => {
    setForm((f) => ({
      ...f,
      soundIssues: f.soundIssues.includes(id)
        ? f.soundIssues.filter((x) => x !== id)
        : [...f.soundIssues, id],
    }));
    if (stepError) setStepError("");
  };

  const togglePatch = (key) => {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  };

  const toggleDelivery = (key) => {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  };

  const goToStep = (target) => {
    if (target > maxStep || target > step) return;
    setStepError("");
    setStep(target);
  };

  const goNext = () => {
    const msg = validateStep(step, form, lang);
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError("");
    const next = step + 1;
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validateStep(4, form, lang);
    if (msg) {
      setStepError(msg);
      return;
    }

    setSubmitting(true);
    setError("");
    setStepError("");

    const message = buildCompositeMessage(form, lang);
    if (!message.trim()) {
      setStepError(lang === "cn" ? "请填写需求描述" : "Please describe your project");
      setSubmitting(false);
      return;
    }

    try {
      await createBooking({
        name: form.clientName,
        wechat: form.wechat,
        phone: form.phone,
        email: form.email,
        serviceType: form.serviceType,
        city: form.city,
        projectDate: form.projectDate,
        venueSize: buildVenueSize(form, lang),
        budgetRange: form.budgetRange,
        referenceLink: form.referenceUrl || (form.viewCasesFirst ? "/cases" : ""),
        message,
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
        <span className="booking-success__code">SIGNAL RECEIVED</span>
        <h2>{lang === "cn" ? "需求信号已接收" : "Signal Received"}</h2>
        <p>
          {lang === "cn"
            ? "我会根据你提交的场地信息、设备情况和项目时间进行初步评估，后续可通过微信补充设备表、场地图片、现场视频或音频文件。"
            : "I'll review your venue, gear and timeline — you can follow up via WeChat with gear lists, photos, video or audio."}
        </p>
        <WechatQr content={content} />
        <div className="booking-success__actions">
          <Button as={Link} to="/contact" variant="secondary">
            {t(bi.addWeChat, lang)}
          </Button>
          <Button as={Link} to="/cases">
            {t(bi.successViewCases, lang)}
          </Button>
        </div>
      </div>
    );
  }

  const stepTitle = `${phase.en} ${currentStep.code} / ${lang === "cn" ? currentStep.titleCn : currentStep.titleEn}`;

  return (
    <form className="booking-form intake-console" onSubmit={handleSubmit} noValidate>
      <header className="intake-console__header">
        <div className="intake-console__header-main">
          <span className="intake-console__eyebrow">PROJECT INTAKE</span>
          <span className="intake-console__step-meta">
            STEP {String(step + 1).padStart(2, "0")} / {String(STEPS).padStart(2, "0")}
          </span>
        </div>
        <div className="intake-console__header-status">
          <span className="intake-console__signal">SIGNAL READY</span>
          <span className="intake-console__source">INPUT SOURCE: CLIENT REQUEST</span>
          <span className="intake-console__est">EST. 02:30</span>
        </div>
      </header>

      <BookingWaveProgress step={step} maxStep={maxStep} onStepClick={goToStep} lang={lang} />

      <div className="intake-console__body">
        <div className="intake-console__main">
          <h2 className="form-step-title intake-console__step-title">{stepTitle}</h2>
          <p className="intake-console__step-desc">
            {ASSIST_CONTENT[step]?.task[lang]}
          </p>

          {(stepError || error) && (
            <div className="alert alert--warn form-alert" role="alert">
              {stepError || error}
            </div>
          )}

          <BookingStepPanel stepKey={step}>
            {step === 0 && (
              <div className="form-group">
                <span className="form-group__label">{t(bi.serviceType, lang)}</span>
                <div className="service-pick-grid intake-module-grid" role="listbox">
                  {services.map((s, i) => (
                    <BookingModuleCard
                      key={s.id}
                      selected={form.serviceType === s.slug}
                      title={t(s.title, lang)}
                      subtitle={s.summary ? t(s.summary, lang) : undefined}
                      tags={
                        SERVICE_TAGS[s.slug]
                          ? SERVICE_TAGS[s.slug][lang]
                          : undefined
                      }
                      meterLevel={68 + (i % 4) * 6}
                      onClick={() => update("serviceType", s.slug)}
                      disabled={submitting}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="intake-rack">
                <fieldset className="intake-rack__group">
                  <legend className="intake-rack__legend">VENUE</legend>
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
                    <label htmlFor="booking-venue-name">
                      {lang === "cn" ? "场地名称" : "Venue name"}
                    </label>
                    <input
                      id="booking-venue-name"
                      value={form.venueName}
                      onChange={(e) => update("venueName", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-venue-type">
                      {lang === "cn" ? "场地类型" : "Venue type"}
                    </label>
                    <select
                      id="booking-venue-type"
                      value={form.venueType}
                      onChange={(e) => update("venueType", e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">{lang === "cn" ? "请选择" : "Select"}</option>
                      {VENUE_TYPES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {lang === "cn" ? v.cn : v.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-audience">
                      {lang === "cn" ? "预计人数" : "Expected audience"}
                    </label>
                    <input
                      id="booking-audience"
                      value={form.audienceSize}
                      onChange={(e) => update("audienceSize", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </fieldset>

                <fieldset className="intake-rack__group">
                  <legend className="intake-rack__legend">SYSTEM</legend>
                  <div className="intake-patch-grid">
                    {PATCH_POINTS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        className={`intake-patch${form[p.key] ? " is-patched" : ""}`}
                        onClick={() => togglePatch(p.key)}
                        disabled={submitting}
                      >
                        <span className="intake-patch__dot" />
                        {lang === "cn" ? p.label.cn : p.label.en}
                        {form[p.key] && <span className="intake-patch__state">PATCH</span>}
                      </button>
                    ))}
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-gear">
                      {lang === "cn" ? "设备品牌 / 型号信息" : "Gear brands / models"}
                    </label>
                    <input
                      id="booking-gear"
                      value={form.gearBrands}
                      onChange={(e) => update("gearBrands", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </fieldset>

                <fieldset className="intake-rack__group">
                  <legend className="intake-rack__legend">SIGNAL</legend>
                  <div className="form-group">
                    <label htmlFor="booking-equipment">
                      {lang === "cn" ? "现有设备情况" : "Current equipment"}
                    </label>
                    <textarea
                      id="booking-equipment"
                      rows={3}
                      value={form.equipmentNotes}
                      onChange={(e) => update("equipmentNotes", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="intake-check">
                <p className="intake-check__lead">
                  {lang === "cn"
                    ? "选择当前最需要解决的问题，可多选。"
                    : "Select the issues you need help with (multiple allowed)."}
                </p>
                <div className="intake-check__grid">
                  {SOUND_ISSUES.map((issue, i) => {
                    const selected = form.soundIssues.includes(issue.id);
                    return (
                      <button
                        key={issue.id}
                        type="button"
                        className={`intake-check__tag${selected ? " is-marked" : ""}`}
                        onClick={() => toggleIssue(issue.id)}
                        disabled={submitting}
                      >
                        <span className="intake-check__code">
                          CHECK {String(i + 1).padStart(2, "0")}
                        </span>
                        {lang === "cn" ? issue.cn : issue.en}
                        {selected && <span className="intake-check__state">SIGNAL MARKED</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="form-group">
                  <label htmlFor="booking-process-notes">
                    {lang === "cn" ? "问题补充说明" : "Additional issue notes"}
                  </label>
                  <textarea
                    id="booking-process-notes"
                    rows={4}
                    value={form.processNotes}
                    onChange={(e) => update("processNotes", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="intake-delivery">
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
                  <label htmlFor="booking-contact-time">
                    {lang === "cn" ? "期望沟通时间" : "Preferred contact time"}
                  </label>
                  <input
                    id="booking-contact-time"
                    value={form.contactTime}
                    onChange={(e) => update("contactTime", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <fieldset className="intake-rack__group">
                  <legend className="intake-rack__legend">
                    {lang === "cn" ? "交付范围" : "DELIVERY SCOPE"}
                  </legend>
                  <div className="intake-output-grid">
                    {DELIVERY_OPTIONS.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        className={`intake-output${form[o.key] ? " is-assigned" : ""}`}
                        onClick={() => toggleDelivery(o.key)}
                        disabled={submitting}
                      >
                        {lang === "cn" ? o.label.cn : o.label.en}
                        {form[o.key] && <span className="intake-output__state">OUTPUT ASSIGNED</span>}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="form-group">
                  <label htmlFor="booking-budget">{t(bi.budgetRange, lang)}</label>
                  <input
                    id="booking-budget"
                    value={form.budgetRange}
                    onChange={(e) => update("budgetRange", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <span className="form-group__label">
                    {lang === "cn" ? "紧急程度" : "Urgency"}
                  </span>
                  <div className="intake-urgency">
                    {URGENCY_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`intake-urgency__btn${form.urgency === o.id ? " is-active" : ""}`}
                        onClick={() => update("urgency", o.id)}
                        disabled={submitting}
                      >
                        {lang === "cn" ? o.cn : o.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
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
                <div className="form-group">
                  <label htmlFor="booking-desc">{t(bi.description, lang)}</label>
                  <textarea
                    id="booking-desc"
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    disabled={submitting}
                  />
                </div>
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
                <label className="intake-toggle">
                  <input
                    type="checkbox"
                    checked={form.preferWechat}
                    onChange={(e) => update("preferWechat", e.target.checked)}
                    disabled={submitting}
                  />
                  {lang === "cn" ? "方便微信沟通" : "WeChat contact preferred"}
                </label>
                <label className="intake-toggle">
                  <input
                    type="checkbox"
                    checked={form.viewCasesFirst}
                    onChange={(e) => update("viewCasesFirst", e.target.checked)}
                    disabled={submitting}
                  />
                  {lang === "cn" ? "希望先看代表案例" : "Would like to view cases first"}
                </label>
                <p className="form-hint">
                  {lang === "cn" ? "姓名或微信至少填写一项" : "Provide name or WeChat ID"}
                </p>
                <BookingProjectSummary form={form} services={services} lang={lang} />
              </>
            )}
          </BookingStepPanel>

          <div className="form-actions intake-console__actions">
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
              <>
                <Button as={Link} to="/contact" variant="secondary" type="button">
                  {t(bi.addWeChat, lang)}
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  loadingText={lang === "cn" ? "提交中…" : "Submitting…"}
                  disabled={submitting}
                >
                  {t(content.i18n.common.submit, lang)}
                </Button>
              </>
            )}
          </div>
        </div>

        <EngineerAssistPanel
          step={step}
          lang={lang}
          selectedIssues={form.soundIssues}
        />
      </div>
    </form>
  );
}
