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
            ? "如果你有 Livehouse、演出、活动扩声或混音项目，可以先发我场地信息、现有设备表和项目时间，我会根据城市、规模与复杂度进行评估。"
            : "For livehouse, event, PA or mixing projects, share venue details, gear list and timeline — I'll assess scope by city, scale and complexity."}
        </p>
        <p className="booking-cta__hint">
          {lang === "cn"
            ? "适合 Livehouse 驻场、演出系统工程、现场扩声、混音后期与录音项目。"
            : "Livehouse residency, tour systems, live sound, mixing and recording projects."}
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
