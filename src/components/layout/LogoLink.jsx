import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function LogoLink({ className = "", onNavigate, children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [pulseKey, setPulseKey] = useState(0);

  const handleClick = (e) => {
    setPulseKey((k) => k + 1);
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onNavigate?.();
  };

  return (
    <Link
      to="/"
      className={`header__logo logo-link logo-link--signal${className ? ` ${className}` : ""}`}
      onClick={handleClick}
      aria-label="YU YAKANG AUDIO — Home"
    >
      <span className="logo-link__text">{children}</span>
      <span
        key={pulseKey}
        className="logo-link__signal logo-link__signal--pulse"
        aria-hidden="true"
      />
      <span className="logo-link__tag" aria-hidden="true">
        SYSTEM / LIVE / MIXING
      </span>
    </Link>
  );
}
