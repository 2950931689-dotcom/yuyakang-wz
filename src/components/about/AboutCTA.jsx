import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useLanguage } from "../../context/LanguageContext";

export default function AboutCTA() {
  const { lang } = useLanguage();

  return (
    <section className="about-section about-cta">
      <div className="booking-cta booking-cta--compact">
        <div className="booking-cta__content">
          <span className="booking-cta__code">BOOKING</span>
          <h2 className="booking-cta__title">
            {lang === "cn" ? "预约项目评估" : "Project Assessment"}
          </h2>
          <p className="booking-cta__desc">
            {lang === "cn"
              ? "如果你有 Livehouse、演出、活动扩声、系统调试或混音后期项目，可以先发送场地信息、设备表和项目时间，我会根据城市、规模与复杂度进行评估。"
              : "For livehouse, events, PA, system tuning or mixing projects — share venue details, gear list and timeline. I'll assess by city, scale and complexity."}
          </p>
        </div>
        <div className="booking-cta__actions">
          <Button as={Link} to="/booking">
            {lang === "cn" ? "提交项目需求" : "Submit Inquiry"}
          </Button>
          <Button as={Link} to="/cases" variant="secondary">
            {lang === "cn" ? "查看代表案例" : "View Cases"}
          </Button>
        </div>
      </div>
    </section>
  );
}
