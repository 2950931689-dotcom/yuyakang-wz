import useInViewReveal from "../../hooks/useInViewReveal";

/**
 * Scroll-in-view reveal wrapper. Use for below-fold modules.
 * Route CSS disables consoleModuleIn when .reveal is present (XOR).
 */
export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  eager = false,
  children,
  style,
  ...props
}) {
  const [ref, isRevealed] = useInViewReveal({ eager });
  const mergedStyle =
    delay > 0 ? { "--reveal-delay": `${delay}ms`, ...style } : style;

  return (
    <Tag
      ref={ref}
      className={["reveal", eager && "reveal--eager", isRevealed && "is-revealed", className]
        .filter(Boolean)
        .join(" ")}
      style={mergedStyle}
      {...props}
    >
      {children}
    </Tag>
  );
}
