import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function LogoLink({ className = "", onNavigate, children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isPulsing, setIsPulsing] = useState(false);

  const triggerPulse = useCallback(() => {
    setIsPulsing(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsPulsing(true));
    });
  }, []);

  const handlePulseEnd = useCallback(() => {
    setIsPulsing(false);
  }, []);

  const handleClick = (e) => {
    triggerPulse();
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onNavigate?.();
  };

  return (
    <Link
      to="/"
      className={[
        "header__logo",
        "logo-link",
        "logo-link--signal",
        isPulsing && "is-pulsing",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      aria-label="YU YAKANG AUDIO — Home"
    >
      <span className="logo-link__text">{children}</span>
      <span
        className={`logo-link__pulse${isPulsing ? " logo-link__pulse--active" : ""}`}
        aria-hidden="true"
        onAnimationEnd={handlePulseEnd}
      />
      <span
        className={`logo-link__signal${isPulsing ? " logo-link__signal--pulse" : ""}`}
        aria-hidden="true"
        onAnimationEnd={handlePulseEnd}
      />
      <span className="logo-link__tag" aria-hidden="true">
        SYSTEM / LIVE / MIXING
      </span>
    </Link>
  );
}
