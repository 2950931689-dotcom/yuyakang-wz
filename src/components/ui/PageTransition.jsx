import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getRouteTransitionMeta } from "../../lib/routeTransition";
import { prefersReducedMotion } from "../../lib/motion";

/** Sections that use scroll reveal instead of route consoleModuleIn. */
const AUTO_REVEAL_SELECTOR = [
  ".about-section",
  ".contact-section",
  ".service-page-card",
  ".case-file__section",
  ".cases-grid > *",
].join(", ");

function attachAutoReveal(root) {
  if (!root || typeof IntersectionObserver === "undefined") return () => {};

  const nodes = [...root.querySelectorAll(AUTO_REVEAL_SELECTOR)].filter(
    (node) => !node.classList.contains("reveal")
  );

  if (!nodes.length) return () => {};

  if (prefersReducedMotion()) {
    nodes.forEach((node) => node.classList.add("is-revealed"));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  nodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(index * 40, 160)}ms`);
    if (index === 0) {
      requestAnimationFrame(() => node.classList.add("is-revealed"));
      return;
    }
    observer.observe(node);
  });

  return () => observer.disconnect();
}

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const meta = useMemo(() => getRouteTransitionMeta(pathname), [pathname]);
  const contentRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    // Wait a frame so route children mount
    let cleanup = () => {};
    const id = requestAnimationFrame(() => {
      cleanup = attachAutoReveal(root);
    });
    return () => {
      cancelAnimationFrame(id);
      cleanup();
    };
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
      <div className="route-transition__content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
