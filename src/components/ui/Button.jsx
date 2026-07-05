export default function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  loadingText,
  as: Tag = "button",
  disabled,
  type,
  ...props
}) {
  const isDisabled = disabled || loading;
  const classes = [
    "btn",
    `btn--${variant}`,
    loading && "btn--loading",
    isDisabled && !loading && "btn--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label = loading ? loadingText ?? children : children;

  if (Tag === "button") {
    return (
      <button
        type={type ?? "button"}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <span className="btn__dots" aria-hidden="true" />}
        <span className="btn__label">{label}</span>
      </button>
    );
  }

  return (
    <Tag
      className={classes}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...(isDisabled ? { tabIndex: -1 } : {})}
      {...props}
    >
      {loading && <span className="btn__dots" aria-hidden="true" />}
      <span className="btn__label">{label}</span>
    </Tag>
  );
}
