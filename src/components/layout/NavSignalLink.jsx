import { useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function isCurrentPath(to, pathname, end) {
  if (end || to === "/") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function NavSignalLink({ to, end, children, onClick, className = "" }) {
  const location = useLocation();
  const [isRouting, setIsRouting] = useState(false);

  const triggerRoute = useCallback(() => {
    setIsRouting(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsRouting(true));
    });
  }, []);

  const handleRouteEnd = useCallback(() => {
    setIsRouting(false);
  }, []);

  const handleClick = (e) => {
    triggerRoute();
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
        [
          "nav-link",
          isActive && "is-active",
          isRouting && "is-routing",
          className,
        ]
          .filter(Boolean)
          .join(" ")
      }
      onClick={handleClick}
    >
      <span className="nav-link__label nav-link__text">{children}</span>
      <span
        className={`nav-link__signal${isRouting ? " nav-link__signal--route" : ""}`}
        aria-hidden="true"
        onAnimationEnd={handleRouteEnd}
      />
    </NavLink>
  );
}
