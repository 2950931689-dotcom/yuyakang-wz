import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getRouteTransitionMeta } from "../../lib/routeTransition";

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const meta = useMemo(() => getRouteTransitionMeta(pathname), [pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={`route-transition route-transition--${meta.type}`}
      data-route-type={meta.type}
    >
      <span className="route-transition__scan" aria-hidden="true" />
      <span className="route-transition__status" aria-hidden="true">
        {meta.statusLabel}
      </span>
      <div className="route-transition__content">{children}</div>
    </div>
  );
}
