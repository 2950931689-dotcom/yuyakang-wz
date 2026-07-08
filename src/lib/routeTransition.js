/**
 * Route transition metadata for PageTransition (Round 5.2.2).
 */

export function getRouteTransitionMeta(pathname) {
  if (pathname === "/") {
    return { type: "home", statusLabel: "SYSTEM BOOT" };
  }
  if (pathname === "/about") {
    return { type: "about", statusLabel: "ENGINEER PROFILE LOADED" };
  }
  if (pathname === "/cases") {
    return { type: "cases", statusLabel: "PROJECT FILE INDEX" };
  }
  if (/^\/cases\/[^/]+/.test(pathname)) {
    return { type: "case-detail", statusLabel: "PROJECT FILE OPENED" };
  }
  if (pathname === "/services") {
    return { type: "services", statusLabel: "SERVICE CHANNEL READY" };
  }
  if (pathname === "/booking") {
    return { type: "booking", statusLabel: "AUDIO INTAKE READY" };
  }
  if (pathname === "/contact") {
    return { type: "contact", statusLabel: "CONTACT ROUTING READY" };
  }
  return { type: "default", statusLabel: "SIGNAL READY" };
}
