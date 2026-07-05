import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../lib/content";
import BookingForm from "../components/booking/BookingForm";

export default function BookingPage() {
  const { content, loading } = useContent();
  const { lang } = useLanguage();

  if (loading || !content) return <div className="loading-screen">Loading…</div>;

  return (
    <div className="page container fade-in">
      <h1 className="page-title">{t(content.i18n.booking.title, lang)}</h1>
      <p className="page-lead">
        {lang === "cn"
          ? "填写项目信息，我会根据时间、城市与场地规模进行评估。"
          : "Share your project details for review."}
      </p>
      <div style={{ maxWidth: 560 }}>
        <BookingForm />
      </div>
    </div>
  );
}
