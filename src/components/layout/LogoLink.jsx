import { Link, useLocation } from "react-router-dom";

export default function LogoLink({ className = "", onNavigate, children }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleClick = (e) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onNavigate?.();
  };

  return (
    <Link
      to="/"
      className={`header__logo logo-link ${className}`.trim()}
      onClick={handleClick}
      aria-label="YU YAKANG AUDIO — Home"
    >
      <span className="logo-link__text">{children}</span>
      <span className="logo-link__signal" aria-hidden="true" />
      <span className="logo-link__tag" aria-hidden="true">
        SYSTEM / LIVE / MIXING
      </span>
    </Link>
  );
}
