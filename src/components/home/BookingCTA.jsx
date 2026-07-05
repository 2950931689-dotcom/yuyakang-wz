import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useLanguage } from "../../context/LanguageContext";

export default function BookingCTA({ compact = false }) {
  const { lang } = useLanguage();

  return (
    <div className={`booking-cta${compact ? " booking-cta--compact" : ""}`}>
      <div className="booking-cta__content">
        <span className="booking-cta__code">BOOKING</span>
        <h2 className="booking-cta__title">
          {lang === "cn" ? "预约合作" : "Book a Project"}
        </h2>
        <p className="booking-cta__desc">
          {lang === "cn"
            ? "提交项目需求，或通过微信发送现场资料与音频文件。"
            : "Submit your project details or reach out via WeChat."}
        </p>
      </div>
      <div className="booking-cta__actions">
        <Button as={Link} to="/booking">
          {lang === "cn" ? "提交项目需求" : "Submit Inquiry"}
        </Button>
        <Button as={Link} to="/contact" variant="secondary">
          {lang === "cn" ? "添加微信沟通" : "WeChat"}
        </Button>
      </div>
    </div>
  );
}
