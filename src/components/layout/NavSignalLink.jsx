import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function isCurrentPath(to, pathname, end) {
  if (end || to === "/") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function NavSignalLink({ to, end, children, onClick, className = "" }) {
  const location = useLocation();
  const [pulseKey, setPulseKey] = useState(0);

  const handleClick = (e) => {
    setPulseKey((k) => k + 1);
    if (isCurrentPath(to, location.pathname, end)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onClick?.(e);
  };

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        ["nav-link", isActive && "is-active", className].filter(Boolean).join(" ")
      }
      onClick={handleClick}
    >
      <span className="nav-link__text">{children}</span>
      <span
        key={pulseKey}
        className="nav-link__signal nav-link__signal--pulse"
        aria-hidden="true"
      />
    </NavLink>
  );
}
