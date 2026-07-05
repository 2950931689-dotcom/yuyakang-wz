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
        <div className="booking-layout">
          <div className="booking-layout__main">
            <header className="booking-page__header">
              <h1 className="booking-title">{t(content.i18n.booking.title, lang)}</h1>
              <p className="booking-lead">
                {lang === "cn"
                  ? "填写项目信息，我会根据时间、城市与场地规模进行评估。"
                  : "Share your project details for review."}
              </p>
            </header>
            <div className="booking-page__form">
              <BookingForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
