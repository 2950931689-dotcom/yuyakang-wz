import { useEffect, useState } from "react";

const ROTATE_MS = 7000;

export default function BookingVisualBg({ images = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (!images.length) {
    return <div className="booking-visual-bg booking-visual-bg--fallback" aria-hidden="true" />;
  }

  return (
    <div className="booking-visual-bg" aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={`booking-visual-bg__image${i === index ? " is-active" : ""}`}
          style={{ backgroundImage: `url("${src}")` }}
        />
      ))}
      <div className="booking-visual-bg__overlay" />
      <div className="booking-visual-bg__grid" />
    </div>
  );
}
