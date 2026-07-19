/** Console feel — Expand Open / Press→Launch helpers */

export const MOTION = {
  pressMs: 80,
  launchMs: 200,
  overlayExpandMs: 280,
  overlayCollapseMs: 160,
  backdropDelayMs: 50,
  routePageMs: 360,
};

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Snapshot a trigger element's viewport rect for morph expand. */
export function getOriginRect(target) {
  if (!target || typeof target.getBoundingClientRect !== "function") return null;
  const r = target.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
  };
}

export function originFromEvent(event) {
  return getOriginRect(event?.currentTarget);
}

/**
 * FLIP deltas: map settled panel rect → origin trigger rect (center-based scale).
 */
export function morphFromOrigin(origin, finalRect) {
  if (!origin || !finalRect?.width || !finalRect?.height) return null;
  const ox = origin.left + origin.width / 2;
  const oy = origin.top + origin.height / 2;
  const fx = finalRect.left + finalRect.width / 2;
  const fy = finalRect.top + finalRect.height / 2;
  return {
    dx: ox - fx,
    dy: oy - fy,
    sx: Math.max(0.06, Math.min(1, origin.width / finalRect.width)),
    sy: Math.max(0.06, Math.min(1, origin.height / finalRect.height)),
  };
}

/** Press → Launch → then open external URL (animation finishes first). */
export function openExternalAfterLaunch(url, { delayMs = MOTION.launchMs } = {}) {
  const href = String(url || "").trim();
  if (!href) return Promise.resolve(false);
  const wait = prefersReducedMotion() ? 0 : delayMs;
  return new Promise((resolve) => {
    window.setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
      resolve(true);
    }, wait);
  });
}
