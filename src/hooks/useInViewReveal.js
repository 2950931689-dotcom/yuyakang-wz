import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";

/**
 * One-shot IntersectionObserver reveal.
 * Returns [ref, isRevealed]. Eager / reduced-motion → revealed immediately.
 */
export function useInViewReveal({
  eager = false,
  once = true,
  root = null,
  rootMargin = "0px 0px -8% 0px",
  threshold = 0.12,
} = {}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(() => eager || prefersReducedMotion());

  useEffect(() => {
    if (eager || prefersReducedMotion()) {
      setIsRevealed(true);
      return undefined;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIsRevealed(true);
          if (once) observer.unobserve(entry.target);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, once, root, rootMargin, threshold]);

  return [ref, isRevealed];
}

export default useInViewReveal;
