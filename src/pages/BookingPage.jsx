import { useMemo } from "react";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../lib/content";
import { collectCaseAmbientImages } from "../lib/caseVisuals";
import BookingForm from "../components/booking/BookingForm";
import BookingVisualBg from "../components/booking/BookingVisualBg";
import LoadingState from "../components/ui/LoadingState";

export default function BookingPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  const ambientImages = useMemo(
    () => (content ? collectCaseAmbientImages(content) : []),
    [content]
  );

  if (loading || !content) return <LoadingState />;

  return (
    <div className="booking-page">
      <BookingVisualBg images={ambientImages} />
      <div className="booking-page__inner section-reveal">
        <div className="booking-layout booking-layout--intake">
          <header className="booking-page__header">
            <span className="booking-page__code">AUDIO INTAKE CONSOLE</span>
            <h1 className="booking-title">
              {lang === "cn" ? "音频项目接单控制台" : "Audio Intake Console"}
            </h1>
            <p className="booking-lead">
              {lang === "cn"
                ? "像提交一个音频工程项目需求一样完成预约 — 分步填写，系统接入，专业评估。"
                : "Submit your project like an audio engineering intake — step by step, structured and professional."}
            </p>
          </header>
          <div className="booking-page__form">
            <BookingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
