import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getHomeBookingCtaCopy } from "../../lib/cmsBinding";

export default function BookingCTA({ compact = false }) {
  const { content } = useContent();
  const { lang } = useLanguage();
  const copy = getHomeBookingCtaCopy(content, lang);

  return (
    <div className={`booking-cta${compact ? " booking-cta--compact" : ""}`}>
      <div className="booking-cta__content">
        <span className="booking-cta__code">{copy.eyebrow}</span>
        <h2 className="booking-cta__title">{copy.title}</h2>
        <p className="booking-cta__desc">{copy.description}</p>
        <p className="booking-cta__hint">{copy.hint}</p>
      </div>
      <div className="booking-cta__actions">
        <Button as={Link} to="/booking">
          {copy.primaryCta}
        </Button>
        <Button as={Link} to="/contact" variant="secondary">
          {copy.secondaryCta}
        </Button>
      </div>
    </div>
  );
}
